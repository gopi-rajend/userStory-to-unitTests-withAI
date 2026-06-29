import express from 'express';
import { z } from 'zod';
import { GroqClient } from '../llm/groqClient';

// Define schema for request validation
const GenerateTestdataRequestSchema = z.object({
  storyTitle: z.string(),
  description: z.string().optional(),
  acceptanceCriteria: z.string().optional(),
  additionalInfo: z.string().optional(),
  categories: z.array(z.string()).optional(),
  testCases: z.array(z.any()).optional(),
});

export const testdataRouter = express.Router();

testdataRouter.post('/', async (req, res) => {
  const validation = GenerateTestdataRequestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid request', details: validation.error.errors });
  }
  const { storyTitle, description, acceptanceCriteria, additionalInfo, categories, testCases } = validation.data;

  // Dynamically build test data schema fields based on user story content
  let schemaFields = [
    'testCaseId', 'category'
  ];
  const content = `${storyTitle} ${description || ''} ${acceptanceCriteria || ''} ${additionalInfo || ''}`.toLowerCase();
  if (content.includes('first name') || content.includes('firstname')) schemaFields.push('first_name');
  if (content.includes('last name') || content.includes('lastname')) schemaFields.push('last_name');
  if (content.includes('email')) schemaFields.push('email');
  if (content.includes('gender')) schemaFields.push('gender');
  if (content.includes('address')) schemaFields.push('address');
  if (content.includes('phone')) schemaFields.push('phone');
  if (content.includes('dob') || content.includes('date of birth')) schemaFields.push('dob');
  if (content.includes('ip address') || content.includes('ipaddress')) schemaFields.push('ip_address');

  const SYSTEM_PROMPT = `You are a senior QA engineer. Your task is to analyze the user story and its test cases, and generate realistic mock test data for each test case.\n\nCRITICAL: You must return ONLY valid JSON matching this exact schema:\n{\n  "testdata": [\n    {\n      "testCaseId": "TC-001",\n      "category": "Positive|Negative|Edge Case|Non Functional|Authorization",\n      "data": [\n        {${schemaFields.filter(f => f !== 'testCaseId' && f !== 'category').map(f => `\"${f}\": "sample value"`).join(', ')} }\n      ]\n    },\n    ...\n  ]\n}\n\nGuidelines:\n- For each test case, generate at least 2 rows of test data relevant to its steps and category.\n- Use varied and plausible values for each field.\n- Only include fields relevant for functional validation of the user story.\n- Return ONLY the JSON object, no additional text or formatting.`;

  function buildTestdataPrompt({ storyTitle, description, acceptanceCriteria, additionalInfo, categories, testCases }: any): string {
    let prompt = `Generate realistic test data for the following user story and its test cases in the format specified above:\n\nStory Title: ${storyTitle}\n`;
    if (description) prompt += `Description: ${description}\n`;
    if (acceptanceCriteria) prompt += `Acceptance Criteria: ${acceptanceCriteria}\n`;
    if (additionalInfo) prompt += `Additional Info: ${additionalInfo}\n`;
    if (categories && categories.length > 0) {
      prompt += `\nTest Categories: ${categories.join(', ')}.`;
    } else {
      prompt += `\nTest Categories: Positive, Negative, Edge Case, Non Functional, Authorization.`;
    }
    if (testCases && testCases.length > 0) {
      prompt += `\nTest Cases:\n`;
      testCases.forEach((tc: any) => {
        prompt += `- ID: ${tc.id}\n  Title: ${tc.title}\n  Steps: ${tc.steps?.join(' | ')}\n  Category: ${tc.category}\n`;
      });
      prompt += `\nGenerate test data for each test case above, grouped by testCaseId and category, and relevant to its steps.`;
    }
    prompt += `\nReturn only the JSON response.`;
    return prompt;
  }

  try {
    const groqClient = new GroqClient();
    const userPrompt = buildTestdataPrompt({ storyTitle, description, acceptanceCriteria, additionalInfo, categories, testCases });
    const groqResponse = await groqClient.generateTests(SYSTEM_PROMPT, userPrompt);
    let parsed;
    try {
      parsed = JSON.parse(groqResponse.content);
    } catch (err) {
      return res.status(502).json({ error: 'LLM returned invalid JSON format', details: groqResponse.content });
    }
    return res.json(parsed);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate test data.' });
  }
  // Ensure all code paths return
  return;
});
