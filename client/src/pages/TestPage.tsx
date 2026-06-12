import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Tracker from '../components/Tracker';
import type { MetricEvent } from '../types';

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: number;
  estimatedTime?: number; 
}

interface Test {
  _id: string;
  title: string;
  questions: Question[];
}

const TestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [metrics, setMetrics] = useState<MetricEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());

  useEffect(() => {
    const fetchTest = async () => {
      try {
        console.log(`[PROCTORING] Fetching test structure for ID: ${id}`);
        const response = await api.get<Test>(`/tests/${id}`);
        setTest(response.data);
        setQuestionStartTime(new Date()); 
        console.log('[PROCTORING] Test successfully loaded:', response.data);
      } catch (err) {
        console.error('[PROCTORING] Failed to load test structure:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  const handleTrackerEvent = (event: MetricEvent) => {
    console.warn(`[PROCTORING TELEMETRY] Caught behavior anomaly: ${event.eventType.toUpperCase()}`, event.details);
    setMetrics((prev) => [...prev, event]);
  };

  const handleAnswerSelection = (selectedOptionIndex: number) => {
    if (!test) return;

    const now = new Date();
    const timeSpentOnQuestion = (now.getTime() - questionStartTime.getTime()) / 1000;
    const currentQuestion = test.questions[currentQuestionIndex];
    
    const timeLimitThreshold = currentQuestion.estimatedTime 
      ? currentQuestion.estimatedTime * 0.2 
      : 1;

    console.log(`[TIME CHECK] Question #${currentQuestionIndex + 1} processing:`);
    console.log(` => Time spent by student: ${timeSpentOnQuestion.toFixed(2)} seconds`);
    console.log(` => Anomaly activation threshold: ${timeLimitThreshold.toFixed(2)} seconds`);

    let updatedMetrics = [...metrics];

    if (timeSpentOnQuestion < timeLimitThreshold || timeSpentOnQuestion < 3) {
      const anomalyDetails = `Unusually rapid response on question ${currentQuestionIndex + 1} (${timeSpentOnQuestion.toFixed(2)} sec).`;
      
      console.error(`[PROCTORING ALERT] TIME-ANOMALY DETECTED! Student responded too fast.`);

      const anomalyEvent: MetricEvent = {
        eventType: 'time-anomaly',
        details: anomalyDetails,
        timestamp: new Date()
      };
      
      updatedMetrics.push(anomalyEvent);
      setMetrics(updatedMetrics);
    } else {
      console.log(` => Time usage verified: Legitimate submission behavior.`);
    }

    const isCorrect = selectedOptionIndex === currentQuestion.correctAnswer;
    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(nextScore);
    }

    if (currentQuestionIndex + 1 < test.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionStartTime(new Date()); 
    } else {
      submitTestResults(nextScore, updatedMetrics);
    }
  };

  const submitTestResults = async (finalScore: number, finalMetrics: MetricEvent[]) => {
    setLoading(true);
    console.log('[PROCTORING] Examination finished. Compiling payload for database submission...');
    
    const payload = {
      testId: id,
      score: finalScore,
      metrics: finalMetrics 
    };

    console.log('[PROCTORING] Target payload array ready for server destination:', payload);

    try {
      await api.post('/tests/submit', payload);
      console.log('[PROCTORING] Examination transaction successfully saved in MongoDB.');
    } catch (err) {
      console.error('[PROCTORING] Critical transmission leak during submission:', err);
    } finally {
      navigate('/dashboard');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Processing examination session...</div>;
  if (!test) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Test structure not found. Check connection parameters.</div>;

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div style={{ maxWidth: '550px', margin: '60px auto', padding: '25px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', fontFamily: 'Segoe UI, sans-serif' }}>
      <Tracker onEvent={handleTrackerEvent} currentQuestionNumber={currentQuestionIndex + 1} />

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{test.title}</h3>
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
          Question {currentQuestionIndex + 1} of {test.questions.length}
        </span>
      </div>
      <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', marginBottom: '20px' }} />

      <div style={{ marginBottom: '25px', textAlign: 'center' }}>
        <h4 style={{ color: '#0f172a', margin: 0, fontSize: '17px', lineHeight: '1.4' }}>{currentQuestion.questionText}</h4>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {currentQuestion.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswerSelection(idx)}
            style={{
              padding: '14px 20px',
              textAlign: 'left',
              backgroundColor: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#334155',
              fontWeight: 500,
              transition: '0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TestPage;