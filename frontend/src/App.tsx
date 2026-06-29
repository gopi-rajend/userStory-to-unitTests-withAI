import React, { useState } from 'react';
import { generateTests, fetchJiraStory } from './api';
import { GenerateRequest, GenerateResponse, TestCase } from './types';
import GenerateTestdata from './GenerateTestdata';

function App() {
  // State and handlers
  type FormData = {
    storyTitle: string;
    description: string;
    acceptanceCriteria: string;
    additionalInfo: string;
    categories: string[];
  };
  const [formData, setFormData] = useState<FormData>({
    storyTitle: '',
    description: '',
    acceptanceCriteria: '',
    additionalInfo: '',
    categories: [],
  });
  const [activeTab, setActiveTab] = useState<'tests' | 'testdata'>('tests');
  const [jiraId, setJiraId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [results, setResults] = useState<GenerateResponse | null>(null);
  const [expandedTestCases, setExpandedTestCases] = useState<Set<string>>(new Set());

  // Handlers
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleCategoryChange = (category: string) => {
    setFormData(prev => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const req: GenerateRequest = {
        ...formData,
        categories: formData.categories,
      };
      const res: GenerateResponse = await generateTests(req);
      setResults(res);
    } catch (err) {
      setError('Failed to generate test cases.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleFetch = async () => {
    setIsLoading(true);
    setError('');
    try {
      const story = await fetchJiraStory(jiraId);
      setFormData(prev => ({
        ...prev,
        storyTitle: story.title || '',
        description: story.description || '',
        acceptanceCriteria: story.acceptanceCriteria || '',
      }));
    } catch (err) {
      setError('Failed to fetch JIRA story.');
    } finally {
      setIsLoading(false);
    }
  };
  const toggleTestCaseExpansion = (id: string) => {
    setExpandedTestCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // UI
  return (
    <div className="app-wrapper">
      <style>{`
        body {
          background: linear-gradient(135deg, #e3f2fd 0%, #f5f6fa 100%);
        }
        .main-wrapper {
          max-width: 900px;
          margin: 56px auto;
        }
        .card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.10);
          padding: 48px 48px 48px 48px;
          margin-bottom: 48px;
        }
        .header {
          margin-bottom: 24px;
        }
        .title {
          font-size: 2.6rem;
          font-weight: 800;
          color: #1976d2;
          margin-bottom: 0.5rem;
          letter-spacing: 1px;
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .subtitle {
          color: #1976d2;
          font-size: 1.18rem;
          font-weight: 500;
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-label {
          font-weight: 700;
          color: #1976d2;
          margin-bottom: 0.4rem;
          display: block;
          font-size: 1.13rem;
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .form-input, .form-textarea {
          width: 100%;
          padding: 14px 18px;
          border-radius: 10px;
          border: 2.5px solid #87ceeb;
          font-size: 1.15rem;
          margin-top: 0.2rem;
          background: #f8faff;
          transition: border 0.2s;
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .form-input:focus, .form-textarea:focus {
          border-color: #1976d2;
          outline: none;
        }
        #storyTitle.form-input {
          border-color: #87ceeb;
          height: 40px;
          min-height: 40px;
          max-height: 40px;
        }
        .form-textarea {
          min-height: 40px;
          max-height: 100px;
          resize: vertical;
          overflow-y: auto;
          border-width: 3px;
        }
        #description.form-textarea,
        #acceptanceCriteria.form-textarea,
        #additionalInfo.form-textarea {
          border-color: #87ceeb;
        }
        .category-checkbox-group {
          display: flex;
          gap: 18px;
          margin-bottom: 20px;
        }
        .category-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          background: #e3f2fd;
          border: 2.5px solid #87ceeb;
          border-radius: 22px;
          padding: 10px 30px;
          cursor: pointer;
          transition: background 0.2s, border 0.2s, color 0.2s;
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .category-checkbox-label.selected {
          background: #1976d2;
          border-color: #1976d2;
          color: #fff;
        }
        .category-checkbox-label input[type="checkbox"] {
          accent-color: #1976d2;
        }
        .submit-btn {
          padding: 14px 32px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(90deg, #1976d2 60%, #87ceeb 100%);
          color: #fff;
          font-size: 1.18rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 22px;
          margin-left: 0;
          display: inline-block;
          box-shadow: 0 2px 8px rgba(33,150,243,0.08);
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .submit-btn:disabled {
          background: #b2bec3;
          cursor: not-allowed;
        }
        .submit-btn:not(:disabled):hover {
          background: #1565c0;
        }
        .error-banner {
          background: #ffeaea;
          color: #c0392b;
          padding: 14px;
          border-radius: 8px;
          margin-top: 1.2rem;
          margin-bottom: 1.2rem;
          font-size: 1.08rem;
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .loading {
          color: #888;
          margin-top: 1.2rem;
        }
        .results-container {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.10);
          padding: 40px 40px 40px 40px;
          margin-bottom: 36px;
        }
        .results-header {
          margin-bottom: 24px;
          padding-bottom: 18px;
          border-bottom: 3px solid #87ceeb;
        }
        .results-title {
          font-size: 2.1rem;
          color: #1976d2;
          margin-bottom: 12px;
          font-weight: 800;
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .results-meta {
          color: #1976d2;
          font-size: 1.08rem;
          font-weight: 600;
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .table-container {
          overflow-x: auto;
        }
        .results-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 24px;
          background: #f8faff;
          border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
        }
        .results-table th,
        .results-table td {
          padding: 18px 16px;
          text-align: center;
          border-bottom: 2.5px solid #87ceeb;
          font-size: 1.13rem;
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .results-table th {
          background: #e3f2fd;
          font-weight: 800;
          color: #1976d2;
          font-size: 1.18rem;
          letter-spacing: 0.5px;
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .results-table tr:nth-child(even) {
          background: #f8f9fa;
        }
        .category-negative { color: #e74c3c; font-weight: 900; }
        .category-edge { color: #1976d2; font-weight: 900; }
        .category-positive { color: #27ae60; font-weight: 900; }
        .category-authorization { color: #9b59b6; font-weight: 900; }
        .category-non-functional { color: #34495e; font-weight: 900; }
        .steps-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 18px;
          background: #f8faff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(33,150,243,0.08);
        }
        .steps-table th, .steps-table td {
          border: 2px solid #87ceeb;
          padding: 12px 14px;
          text-align: center;
          font-size: 1.08rem;
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .steps-table th {
          background: #e3f2fd;
          color: #1976d2;
          font-weight: 700;
          font-size: 1.13rem;
        }
      `}</style>
      <div className="container">
        <div className="menu-bar" style={{ display: 'flex', gap: '2rem', borderBottom: '2px solid #87ceeb', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
          <div
            style={{ cursor: 'pointer', fontWeight: activeTab === 'tests' ? 'bold' : 'normal', color: activeTab === 'tests' ? '#1976d2' : '#2c3e50', fontSize: '1.2rem' }}
            onClick={() => setActiveTab('tests')}
          >
            User Story to Tests
          </div>
          <div
            style={{ cursor: 'pointer', fontWeight: activeTab === 'testdata' ? 'bold' : 'normal', color: activeTab === 'testdata' ? '#1976d2' : '#2c3e50', fontSize: '1.2rem' }}
            onClick={() => setActiveTab('testdata')}
          >
            Generate Testdata
          </div>
        </div>
        {activeTab === 'tests' && (
          <>
            <div className="header">
              <h1 className="title">User Story to Tests</h1>
              <p className="subtitle">Generate comprehensive test cases from your user stories</p>
            </div>
      <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <label htmlFor="jira-id" style={{ marginRight: '0.5rem' }}>JIRA ID</label>
            <input
              type="text"
              id="jira-id"
              value={jiraId}
              onChange={(e) => setJiraId(e.target.value)}
              style={{ marginRight: '0.5rem' }}
            />
            <button type="button" onClick={handleFetch}>Fetch</button>
          </div>
          <div className="form-group">
            <label htmlFor="storyTitle" className="form-label">Story Title *</label>
            <input
              type="text"
              id="storyTitle"
              className="form-input"
              value={formData.storyTitle}
              onChange={(e) => handleInputChange('storyTitle', e.target.value)}
              placeholder="Enter the user story title..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional description (optional)..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="acceptanceCriteria" className="form-label">Acceptance Criteria *</label>
            <textarea
              id="acceptanceCriteria"
              className="form-textarea"
              value={formData.acceptanceCriteria}
              onChange={(e) => handleInputChange('acceptanceCriteria', e.target.value)}
              placeholder="Enter the acceptance criteria..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="additionalInfo" className="form-label">Additional Info</label>
            <textarea
              id="additionalInfo"
              className="form-textarea"
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Any additional information (optional)..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Test Categories <span style={{color:'#888', fontWeight:400, fontSize:'0.95em'}}>(Only selected categories will be generated)</span>
            </label>
            <div className="category-checkbox-group">
              {['Positive', 'Negative', 'Edge Case', 'Non Functional'].map(category => (
                <label key={category} className="category-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.categories?.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
        {error && <div className="error-banner">{error}</div>}
        {isLoading && <div className="loading">Generating test cases...</div>}
        {results && (
          <div className="results-container">
            <div className="results-header">
              <h2 className="results-title">Generated Test Cases</h2>
              <div className="results-meta">
                {results.cases.length} test case(s) generated
                {results.model && ` • Model: ${results.model}`}
                {results.promptTokens > 0 && ` • Tokens: ${results.promptTokens + results.completionTokens}`}
              </div>
            </div>
            <div className="table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Test Case ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Expected Result</th>
                  </tr>
                </thead>
                <tbody>
                  {results.cases.map((testCase: TestCase) => (
                    <React.Fragment key={testCase.id}>
                      <tr>
                        <td>
                          <div 
                            className={`test-case-id ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}
                            onClick={() => toggleTestCaseExpansion(testCase.id)}
                          >
                            <span className={`expand-icon ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}>
                              ▶
                            </span>
                            {testCase.id}
                          </div>
                        </td>
                        <td>{testCase.title}</td>
                        <td>
                          <span className={`category-${testCase.category.toLowerCase().replace(/\s/g, '-')}`}>
                            {testCase.category}
                          </span>
                        </td>
                        <td>{testCase.expectedResult}</td>
                      </tr>
                      {expandedTestCases.has(testCase.id) && (
                        <tr key={`${testCase.id}-details`}>
                          <td colSpan={4}>
                            <div className="expanded-details">
                              <h4 style={{marginBottom: '15px', color: '#1976d2', fontWeight: 700, fontSize: '1.18rem', fontFamily: 'Segoe UI, Roboto, Arial, sans-serif'}}>Test Steps for {testCase.id}</h4>
                              <table className="steps-table">
                                <thead>
                                  <tr>
                                    <th>Step ID</th>
                                    <th>Step Description</th>
                                    <th>Test Data</th>
                                    <th>Expected Result</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {testCase.steps.map((step, index) => (
                                    <tr key={index}>
                                      <td>S{String(index + 1).padStart(2, '0')}</td>
                                      <td>{step}</td>
                                      <td>{testCase.testData || 'N/A'}</td>
                                      <td>{index === testCase.steps.length - 1 ? testCase.expectedResult : 'Step completed successfully'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </>
        )}
        {activeTab === 'testdata' && (
          <GenerateTestdata
            storyTitle={formData.storyTitle}
            description={formData.description}
            acceptanceCriteria={formData.acceptanceCriteria}
            additionalInfo={formData.additionalInfo}
            testCases={results?.cases || []}
            showError={!(formData.storyTitle.trim() && formData.acceptanceCriteria.trim())}
            errorMessage={!(formData.storyTitle.trim() && formData.acceptanceCriteria.trim()) ? 'Please fill in all mandatory fields (Story Title and Acceptance Criteria).' : ''}
          />
        )}
      </div>
    </div>
  );
}

export default App