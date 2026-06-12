import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface Attempt {
  _id: string;
  userId: { _id: string; email: string } | null;
  testId: { _id: string; title: string } | null;
  score: number;
  startTime: string;
  endTime: string;
  metrics: Array<{ eventType: string; details: string; timestamp: string }>;
}

const Dashboard: React.FC = () => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await api.get<Attempt[]>('/tests/attempts/all');
        setAttempts(response.data);
      } catch (error) {
        console.error('Error fetching dashboard entries:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const calculateAnomalyCoefficient = (metrics: Attempt['metrics']) => {
    let score = 0;
    metrics.forEach((m) => {
      if (m.eventType === 'tab-switch') score += 2.0;
      if (m.eventType === 'copy-paste') score += 3.5;

      if (m.eventType === 'context-menu') {
        if (m.details.includes('[w-selection]')) {
          score += 1.0;
        } else {
          score += 0.5;
        }
      }

      if (m.eventType === 'time-anomaly') score += 0.5;
    });
    return Math.min(score, 10.0);
  };

  // Interpretation of abnormality thresholds
  const getRiskStatus = (coefficient: number) => {
    if (coefficient <= 2.0) return { label: 'No/Low Anomaly', color: '#28a745' };
    if (coefficient <= 5.0) return { label: 'Moderate Anomaly', color: '#ffc107' };
    return { label: 'Critical Anomaly', color: '#dc3545' };
  };

  if (loading) return <div style={{ padding: '30px', textAlign: 'center' }}>Loading analytical data...</div>;

  // Chart dataset
  let lowCount = 0, modCount = 0, critCount = 0;
  let tabSwitches = 0, copyPastes = 0, ctxMenus = 0, timeAnomalies = 0;

  attempts.forEach(att => {
    const coefficient = calculateAnomalyCoefficient(att.metrics);
    if (coefficient <= 2.0) lowCount++;
    else if (coefficient <= 5.0) modCount++;
    else critCount++;

    att.metrics.forEach(m => {
      if (m.eventType === 'tab-switch') tabSwitches++;
      if (m.eventType === 'copy-paste') copyPastes++;
      if (m.eventType === 'context-menu') ctxMenus++;
      if (m.eventType === 'time-anomaly') timeAnomalies++;
    });
  });

  const pieData = {
    labels: ['No/Low Anomaly', 'Moderate Anomaly', 'Critical Anomaly'],
    datasets: [{
      data: [lowCount, modCount, critCount],
      backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
    }]
  };

  const barData = {
    labels: ['Tab Switches', 'Copy-Paste Actions', 'Context Menus', 'Time Anomalies'],
    datasets: [{
      label: 'Total Incidents Detected',
      data: [tabSwitches, copyPastes, ctxMenus, timeAnomalies],
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
    }]
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif', boxSizing: 'border-box' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: 'calc(1.3rem + 0.6vw)' }}>Educator Analytical Dashboard</h2>
        </div>
        <button onClick={() => navigate('/')} style={{ padding: '10px 18px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
          Back to Hub
        </button>
      </div>
      <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', marginBottom: '25px' }} />

      {/* MATHEMATICAL SPECIFICATION OVERVIEW */}
      <div style={{ padding: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '30px', fontSize: '14px', color: '#334155' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '16px' }}>Mathematical Formula Specification</h4>
        <p style={{ margin: '0 0 10px 0', lineHeight: '1.5' }}>
          The Anomaly Coefficient (K_anomaly) is calculated dynamically within a normalized scale of 0.0 to 10.0 using predefined operational penalty weights assigned to various types of anomalies:
        </p>
        <p style={{ textAlign: 'left', marginLeft: '24px' }}>1. Tab Switches: 2.0 points per incident</p>
        <p style={{ textAlign: 'left', marginLeft: '24px' }}>2. Copy-Paste Actions: 3.5 points per incident</p>
        <p style={{ textAlign: 'left', marginLeft: '24px' }}>3. Context Menu Selections: 1.0 point (or 0.5 points if no preselection) per incident</p>
        <p style={{ textAlign: 'left', marginLeft: '24px' }}>4. Time Anomalies: 0.5 points per incident</p>
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #cbd5e1', margin: '15px 0', fontSize: '15px', color: '#0f172a', fontFamily: 'monospace', overflowX: 'auto' }}>
          K_anomaly = Min(10.0, (N_tab × 2.0) + (N_copy × 3.5) + (N_context_w_selection × 1.0) + (N_context_no_selection × 0.5) + (N_time × 0.5))
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', marginTop: '15px', fontSize: '13px', padding: '10px', backgroundColor: '#fff', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
          <strong style={{ minWidth: '100px' }}>Evaluation Scale:</strong>
          <span style={{ color: '#28a745', fontWeight: 600 }}>No/Low Anomaly (0.0 - 2.0)</span> |
          <span style={{ color: '#ffc107', fontWeight: 600 }}>Moderate Anomaly (2.1 - 5.0)</span> |
          <span style={{ color: '#dc3545', fontWeight: 600 }}>Critical Anomaly (5.1 - 10.0)</span>
        </div>
      </div>

      {/* ANALYTICAL CHARTS VISUALIZATION */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
        <div style={{ flex: '1 1 300px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', minWidth: '280px' }}>
          <h4 style={{ margin: '0 0 15px 0', textAlign: 'center', color: '#334155', fontSize: '15px' }}>Student Risk Group Distribution</h4>
          <div style={{ maxHeight: '230px', display: 'flex', justifyContent: 'center' }}>
            <Pie data={pieData} options={{ maintainAspectRatio: true }} />
          </div>
        </div>
        <div style={{ flex: '1 1 300px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', minWidth: '280px' }}>
          <h4 style={{ margin: '0 0 15px 0', textAlign: 'center', color: '#334155', fontSize: '15px' }}>Total Anomaly Type Frequencies</h4>
          <div style={{ height: '230px' }}>
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* DETAILED MONITORING LOGS TABLE */}
      <h3 style={{ color: '#0f172a', marginBottom: '15px', fontSize: '18px' }}>Detailed Examination Logs</h3>
      
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #edf2f7', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', color: '#475569', fontSize: '14px' }}>
              <th style={{ padding: '14px 16px' }}>Student Email</th>
              <th style={{ padding: '14px 16px' }}>Examination Scope</th>
              <th style={{ padding: '14px 16px' }}>Raw Score</th>
              <th style={{ padding: '14px 16px' }}>Anomalies</th>
              <th style={{ padding: '14px 16px' }}>Risk Coefficient (K)</th>
              <th style={{ padding: '14px 16px' }}>Session Status</th>
              <th style={{ padding: '14px 16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '14px' }}>
            {attempts.map((att) => {
              const coefficient = calculateAnomalyCoefficient(att.metrics);
              const status = getRiskStatus(coefficient);
              const isExpanded = expandedAttempt === att._id;

              return (
                <React.Fragment key={att._id}>
                  <tr style={{ borderBottom: '1px solid #edf2f7', backgroundColor: isExpanded ? '#f8fafc' : 'transparent', transition: '0.2s' }}>
                    <td style={{ padding: '16px', fontWeight: 500, color: '#334155' }}>{att.userId?.email || 'anonymous@edu.ua'}</td>
                    <td style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>{att.testId?.title || 'General Evaluation'}</td>
                    <td style={{ padding: '16px' }}>{att.score}</td>
                    <td style={{ padding: '16px', fontWeight: att.metrics.length > 0 ? 600 : 400, color: att.metrics.length > 0 ? '#dc3545' : '#475569' }}>{att.metrics.length}</td>
                    <td style={{ padding: '16px', fontWeight: 700, color: status.color, fontSize: '15px' }}>{coefficient.toFixed(1)}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ backgroundColor: status.color, color: status.color === '#ffc107' ? '#1e293b' : '#fff', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'inline-block', minWidth: '110px', textAlign: 'center' }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button onClick={() => setExpandedAttempt(isExpanded ? null : att._id)} style={{ padding: '6px 12px', backgroundColor: '#edf2f7', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>

                  {/* TELEMETRY INCIDENT AUDIT TRAIL BLOCK */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} style={{ backgroundColor: '#f8fafc', padding: '20px 25px', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ borderLeft: '3px solid #cbd5e1', paddingLeft: '20px', textAlign: 'left' }}>
                          <h5 style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 700 }}>
                            Telemetry Incident Audit Trail
                          </h5>
                          
                          {att.metrics.length === 0 ? (
                            <p style={{ color: '#64748b', margin: 0, fontSize: '13px', textAlign: 'left' }}>
                              No behavioral anomalies detected during this session.
                            </p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0, textAlign: 'left' }}>
                              {att.metrics.map((m, idx) => {
                                let weight: number | string = 0;
                                if (m.eventType === 'tab-switch') weight = 2.0;
                                if (m.eventType === 'copy-paste') weight = 3.5;
                                if (m.eventType === 'time-anomaly') weight = 0.5;

                                if (m.eventType === 'context-menu') {
                                  weight = m.details.includes('[w-selection]') ? 1.0 : 0.5;
                                }

                                return (
                                  <div 
                                    key={idx} 
                                    style={{ 
                                      fontSize: '13px', 
                                      color: '#475569', 
                                      lineHeight: '1.4',
                                      textAlign: 'left',
                                      padding: '2px 0'
                                    }}
                                  >
                                    <strong style={{ color: '#0f172a', fontFamily: 'monospace', marginRight: '5px' }}>
                                      [{m.eventType.toUpperCase()}]
                                    </strong> 
                                    <span style={{ color: '#64748b', fontWeight: 600, marginRight: '6px' }}>
                                      (+{weight.toFixed(1)} K)
                                    </span> 
                                    — {m.details} 
                                    <span style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '8px', fontFamily: 'monospace' }}>
                                      ({new Date(m.timestamp).toLocaleTimeString()})
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          <div style={{ marginTop: '14px', fontSize: '12px', color: '#64748b', fontStyle: 'italic', textAlign: 'left', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                            Model Computation: Sum of active incidents weights capped at limits threshold = {coefficient.toFixed(1)} Coefficient.
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;