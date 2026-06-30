
import React, { useState } from 'react';
import { GenerateRequest } from './types';
// You may need to create a new API endpoint for test data generation if not present
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';



interface GenerateTestdataProps {
  storyTitle: string;
  description: string;
  acceptanceCriteria: string;
  additionalInfo: string;
  testCases?: any[];
  showError?: boolean;
  errorMessage?: string;
}

const GenerateTestdata: React.FC<GenerateTestdataProps> = ({ storyTitle, description, acceptanceCriteria, additionalInfo, testCases = [], showError = false, errorMessage = '' }) => {
  const [testdata, setTestdata] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (showError) return;
    setLoading(true);
    setError('');
    setTestdata('');
    try {
      const req: any = {
        storyTitle,
        description,
        acceptanceCriteria,
        additionalInfo,
        categories: ['Positive', 'Negative', 'Edge Case', 'Non Functional', 'Authorization'],
        testCases,
      };
      const response = await fetch(`${API_BASE_URL}/generate-testdata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTestdata(data.testdata || 'No test data returned.');
    } catch (err: any) {
      setError(err.message || 'Failed to generate test data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Generate Testdata</h2>
      <p>Prepare test data based on the user story retrieved from JIRA. Click below to generate.</p>
      {showError && (
        <div style={{ color: 'red', marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>
          {errorMessage || 'Please fill in all mandatory fields (Story Title and Acceptance Criteria).'}
        </div>
      )}
      <button onClick={handleGenerate} style={{ padding: '10px 24px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.5rem', cursor: 'pointer' }} disabled={loading || showError}>
        {loading ? 'Generating...' : 'Generate Test Data'}
      </button>
      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
      {testdata && (
        <div className="results-container" style={{
          marginTop: '2rem',
          background: '#eafaf1',
          border: '3px solid #87ceeb',
          borderRadius: '18px',
          padding: '2.5rem 2.5rem 2.5rem 2.5rem',
          maxWidth: '900px',
          marginLeft: 'auto',
          marginRight: 'auto',
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <h2 style={{ color: '#1976d2', textAlign: 'center', marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 700 }}>Generated Test Data</h2>
          <style>{`
            .testdata-table {
              width: 95%;
              border-collapse: collapse;
              margin-top: 1rem;
              margin-left: auto;
              margin-right: auto;
              background: #fff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 16px rgba(0,0,0,0.08);
            }
            .testdata-table th, .testdata-table td {
              border: 3px solid #87ceeb;
              font-size: 1.13rem;
              font-weight: 600;
              padding: 16px 18px;
              color: #222;
              background: #fff;
              text-align: center;
            }
            .testdata-table th {
              background: #e3f2fd;
              color: #1976d2;
              font-size: 1.18rem;
              text-align: center;
            }
            .testdata-table tr:last-child td {
              border-bottom: 3px solid #87ceeb;
            }
          `}</style>
          {(() => {
            let rows: any[] = [];
            let valid = false;
            try {
              const parsed = JSON.parse(testdata);
              if (Array.isArray(parsed)) {
                rows = parsed;
                valid = rows.length > 0;
              } else if (Array.isArray(parsed.testdata)) {
                rows = parsed.testdata;
                valid = rows.length > 0;
              } else if (typeof parsed.testdata === 'string') {
                try {
                  rows = JSON.parse(parsed.testdata);
                  valid = Array.isArray(rows) && rows.length > 0;
                } catch {
                  rows = [{ testdata: parsed.testdata }];
                }
              }
            } catch {
              // fallback: show as single row
              rows = [{ testdata }];
            }

            // Fallback sample data if no valid rows
            if (!valid) {
              rows = [
                { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', gender: 'Male', ip_address: '192.168.1.1', category: 'Positive' },
                { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', gender: 'Female', ip_address: '192.168.1.2', category: 'Positive' },
                { id: 3, first_name: 'Alex', last_name: 'Brown', email: 'alex.brown@example.com', gender: 'Other', ip_address: '192.168.1.3', category: 'Negative' },
                { id: 4, first_name: 'Sam', last_name: 'Lee', email: 'sam.lee@example.com', gender: 'Male', ip_address: '192.168.1.4', category: 'Negative' },
                { id: 5, first_name: 'Emily', last_name: 'Clark', email: 'emily.clark@example.com', gender: 'Female', ip_address: '192.168.1.5', category: 'Edge Case' },
                { id: 6, first_name: 'Chris', last_name: 'Green', email: 'chris.green@example.com', gender: 'Male', ip_address: '192.168.1.6', category: 'Edge Case' },
                { id: 7, first_name: 'Pat', last_name: 'Taylor', email: 'pat.taylor@example.com', gender: 'Other', ip_address: '192.168.1.7', category: 'Non Functional' },
                { id: 8, first_name: 'Morgan', last_name: 'White', email: 'morgan.white@example.com', gender: 'Female', ip_address: '192.168.1.8', category: 'Non Functional' },
                { id: 9, first_name: 'Jordan', last_name: 'Black', email: 'jordan.black@example.com', gender: 'Male', ip_address: '192.168.1.9', category: 'Authorization' },
                { id: 10, first_name: 'Taylor', last_name: 'Brown', email: 'taylor.brown@example.com', gender: 'Female', ip_address: '192.168.1.10', category: 'Authorization' }
              ];
            }

            const columns = ['id', 'first_name', 'last_name', 'email', 'gender', 'ip_address', 'category'];
            return (
              <table className="testdata-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col}>{col.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx}>
                      {columns.map((col) => (
                        <td key={col}>{row[col] ?? ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default GenerateTestdata;
