import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from './api/axios';
import TestPage from './pages/TestPage';
import Dashboard from './pages/Dashboard';

function Home() {
  const [testId, setTestId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAvailableTest = async () => {
      try {
        const response = await api.get<{ _id: string; title: string }[]>('/tests');
        
        if (response.data && response.data.length > 0) {
          setTestId(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching available test mappings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTest();
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', textAlign: 'center', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', boxSizing: 'border-box' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'calc(1.6rem + 1vw)', color: '#222', margin: '0 0 15px 0', fontWeight: 700, lineHeight: '1.2' }}>
          Intellectual Knowledge Evaluation System
        </h1>
        <p style={{ color: '#666', fontSize: 'calc(1rem + 0.2vw)', margin: 0, lineHeight: '1.5' }}>
          Intelectual Knowledge Evaluation system based on real-time user behavior metrics analysis.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        {/* Student Section */}
        <div style={{ padding: '30px', border: '1px solid #b3d7ff', borderRadius: '12px', backgroundColor: '#f4f9ff', flex: '1 1 350px', boxSizing: 'border-box', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: '#0056b3', marginTop: 0, fontSize: '18px' }}>Student Portal</h3>
          <p style={{ color: '#555', minHeight: '45px', fontSize: '14px', lineHeight: '1.4' }}>Take examinations under session integrity tracking.</p>
          
          {loading ? (
            <button disabled style={{ padding: '12px 25px', backgroundColor: '#b3d7ff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'not-allowed', fontWeight: 600, fontSize: '14px' }}>
              Loading Exam...
            </button>
          ) : testId ? (
            <Link to={`/test/${testId}`}>
              <button style={{ padding: '12px 25px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                Start Examination
              </button>
            </Link>
          ) : (
            <button disabled style={{ padding: '12px 25px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'not-allowed', fontWeight: 600, fontSize: '14px' }}>
              No Tests Found (Run Seed)
            </button>
          )}
        </div>

        {/* Teacher Section */}
        <div style={{ padding: '30px', border: '1px solid #c3e6cb', borderRadius: '12px', backgroundColor: '#f8fff9', flex: '1 1 350px', boxSizing: 'border-box', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: '#1e7e34', marginTop: 0, fontSize: '18px' }}>Educator Dashboard</h3>
          <p style={{ color: '#555', minHeight: '45px', fontSize: '14px', lineHeight: '1.4' }}>Review examination results: Incident Audit Trail, Behavior Metrics Analysis.</p>
          <Link to="/dashboard">
            <button style={{ padding: '12px 25px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              Open Analytics
            </button>
          </Link>
        </div>
      </div>

      <footer style={{ marginTop: '60px', color: '#aaa', fontSize: '13px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        Intellectual Knowledge Evaluation System with Behavior Metrics Analysis | Developed by <i><b>Nikita Borysov</b></i>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test/:id" element={<TestPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;