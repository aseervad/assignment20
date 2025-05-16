import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import QuestionCard from './QuestionCard';
import AudioRecorder from './AudioRecorder';
import SubmitResponseForm from "./tests/SubmitResponseForm";

const TestTakerDashboard: React.FC = () => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | undefined>(undefined);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [showQuestion, setShowQuestion] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const handleStartTest = (questionId?: number) => {
    setSelectedQuestionId(questionId);
    setShowQuestion(true);
    setAudioBlob(null);
    setRecordingError(null);
  };

  const handleQuestionAnswered = (questionId: number) => {
    if (!answeredQuestions.includes(questionId)) {
      setAnsweredQuestions([...answeredQuestions, questionId]);
    }
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setRecordingError(null);
    console.log('Audio recording complete. Size:', blob.size, 'bytes');
  };

  const handleAudioError = (error: string) => {
    setRecordingError(error);
    console.error('Audio recording error:', error);
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <h1>Test Taker Dashboard</h1>
      <p className="dashboard-description">Welcome to your personal IELTS Speaking Test dashboard.</p>

      {!showQuestion ? (
        <div className="tests-section" style={{ marginTop: '2rem' }}>
          <h2>Available Tests</h2>
          <div className="test-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <div className="test-card" style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>IELTS Speaking Part 1: Introduction</h3>
              <p>Practice answering common introduction questions.</p>
              <button
                onClick={() => handleStartTest(1)}
                className="start-test-button"
                style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  marginTop: '1rem',
                  cursor: 'pointer'
                }}
              >
                Start Test
              </button>
            </div>

            <div className="test-card" style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>IELTS Speaking Part 2: Long-turn speaking</h3>
              <p>Practice speaking on a given topic for 2 minutes.</p>
              <button
                onClick={() => handleStartTest(2)}
                className="start-test-button"
                style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  marginTop: '1rem',
                  cursor: 'pointer'
                }}
              >
                Start Test
              </button>
            </div>

            <div className="test-card" style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>IELTS Speaking Part 3: Discussion</h3>
              <p>Practice answering in-depth questions on various topics.</p>
              <button
                onClick={() => handleStartTest(3)}
                className="start-test-button"
                style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  marginTop: '1rem',
                  cursor: 'pointer'
                }}
              >
                Start Test
              </button>
            </div>

            <div className="test-card" style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>Random Practice Questions</h3>
              <p>Practice with randomly selected questions from all parts.</p>
              <button
                onClick={() => handleStartTest()}
                className="start-test-button"
                style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  marginTop: '1rem',
                  cursor: 'pointer'
                }}
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="test-session" style={{ marginTop: '2rem' }}>
          <button
            onClick={() => setShowQuestion(false)}
            className="back-button"
            style={{
              background: '#4b5563',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              marginBottom: '1rem',
              cursor: 'pointer'
            }}
          >
            Back to Tests
          </button>

          <QuestionCard
            questionId={selectedQuestionId}
            onAnswered={handleQuestionAnswered}
          />

          {recordingError && (
            <div className="recording-error" style={{ 
              color: '#ef4444', 
              marginTop: '1rem',
              padding: '0.5rem',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              background: '#fee2e2'
            }}>
              {recordingError}
            </div>
          )}
          
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <h3>Record Your Answer</h3>
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              onError={handleAudioError}
            />
          </div>

          {(audioBlob || answeredQuestions.length > 0) && (
            <SubmitResponseForm 
              testId={selectedQuestionId || 0} 
              audioBlob={audioBlob}
            />
          )}

          {answeredQuestions.length > 0 && (
            <div className="progress-section" style={{ marginTop: '2rem' }}>
              <h3>Progress</h3>
              <p>You have answered {answeredQuestions.length} question(s) in this session.</p>
            </div>
          )}
        </div>
      )}

      <div className="dashboard-footer" style={{ marginTop: '2rem' }}>
        <Link
          to="/"
          className="home-link"
          style={{
            color: '#2563eb',
            marginRight: '1rem'
          }}
        >
          Back to Home
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem('isAuthenticated');
            window.location.reload();
          }}
          className="logout-button"
          style={{
            background: '#ef4444',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default TestTakerDashboard;