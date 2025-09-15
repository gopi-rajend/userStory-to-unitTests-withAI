import express from 'express';
import fetch from 'node-fetch';

export const jiraRouter = express.Router();

const JIRA_BASE_URL = process.env.JIRA_BASE_URL || 'https://gopirajend-ai-testing.atlassian.net';
const JIRA_EMAIL = process.env.JIRA_EMAIL || 'gopi.rajend@gmail.com';
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || 'ATATT3xFfGF0HZO-Q8AxoFLaPqUI6AZagoro0gc_bxCol7E0Rks3b4uBQhtw_PKnOLl7GkCIOT-ReV6WNd15WRqPRbXD18s18a5-PFIoAGvlNx-JtV2uEd7ZTuU6kSTfhU1n9NC3IVGShVJQgQLrTcnU3Hl73aL5nbaWUIbsh6FiXqj4vjjgv9w=46A0978D';

jiraRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'JIRA ID is required' });
  }
  try {
    const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
    const response = await fetch(`${JIRA_BASE_URL}/rest/api/3/issue/${encodeURIComponent(id)}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });
    let errorData: any = {};
    if (!response.ok) {
      try {
        errorData = await response.json();
      } catch {}
      const errorMsg = errorData && errorData.errorMessages && Array.isArray(errorData.errorMessages)
        ? errorData.errorMessages[0]
        : 'Failed to fetch from JIRA';
      return res.status(response.status).json({ error: errorMsg });
    }
    let data: any = {};
    try {
      data = await response.json();
    } catch {}
    if (!data || typeof data !== 'object' || !data.fields) {
      return res.status(500).json({ error: 'Invalid response from JIRA' });
    }
    const fields = data.fields || {};
    const title = fields.summary || '';

    // Helper to recursively extract all text from Atlassian Document Format (ADF)
    function extractTextFromADF(adf: any): string {
      if (!adf) return '';
      if (typeof adf === 'string') return adf;
      if (Array.isArray(adf)) return adf.map(extractTextFromADF).join(' ');
      if (adf.text) return adf.text;
      if (adf.content) return extractTextFromADF(adf.content);
      return '';
    }

    let fullDescription = extractTextFromADF(fields.description);

    let acceptanceCriteria = '';
    let additionalInfo = '';
    let mainDescription = fullDescription;
    if (typeof fullDescription === 'string') {
      // Split at first occurrence of 'Acceptance Criteria' (case-insensitive, with or without colon/whitespace)
      const acRegex = /Acceptance Criteria\s*:?(.*)/is;
      const split = fullDescription.split(/Acceptance Criteria\s*:?/i);
      if (split.length > 1) {
        mainDescription = split[0].trim();
        // Everything after 'Acceptance Criteria' is the acceptance criteria (until 'Additional Info' or end)
        const acSection = split.slice(1).join('Acceptance Criteria').trim();
        const aiSplit = acSection.split(/Additional Info\s*:?/i);
        acceptanceCriteria = aiSplit[0].trim();
        if (aiSplit.length > 1) {
          additionalInfo = aiSplit.slice(1).join('Additional Info').trim();
        }
      } else {
        mainDescription = fullDescription.trim();
      }
    }

    return res.json({ title, description: mainDescription, acceptanceCriteria, additionalInfo });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});
