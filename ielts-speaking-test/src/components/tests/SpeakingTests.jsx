import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SubmitResponseForm from './SubmitResponseForm';
import Timer from '../Timer';
import Modal from '../Modal';
import TestInstructions from '../TestInstructions';

const SpeakingTests = () => {
  // States for speaking tests
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  
  // States for sample questions
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(true);
  const [sampleError, setSampleError] = useState('');
  
  // States for new sample question
  const [newSampleQuestion, setNewSampleQuestion] = useState('');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState('Medium');
  
  // Toggle between views
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' or 'samples'

  // Timer states
  const [timeExpired, setTimeExpired] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);

  // Modal states
  const [showInstructions, setShowInstructions] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const API_URL = 'http://localhost:5000/api/speaking-tests';
  const SAMPLES_URL = `${API_URL}/sample-questions`;

  const setupTimer = (minutes = 2) => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + minutes * 60);
    return time;
  };

  const handleStartTest = (questionId) => {
    setTestStarted(true);
    setTimeExpired(false);
    setSelectedQuestionId(questionId);
    setShowQuestion(true);
  };

  const generateMockQuestions = async () => {
    try {
      const mockQuestions = [
        "Describe a memorable trip you've taken",
        "What are the advantages of living in a big city?",
        "How has technology changed education in recent years?"
      ];
      
      const randomQuestion = mockQuestions[Math.floor(Math.random() * mockQuestions.length)];
      setQuestion(randomQuestion);
      setError('');
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error('Error generating questions:', err);
    }
  };
  
  // Fetch speaking tests
  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setTests(res.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load tests. Is the backend running?');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sample questions
  const fetchSampleQuestions = async () => {
    try {
      setLoadingSamples(true);
      const res = await axios.get(SAMPLES_URL);
      setSampleQuestions(res.data.data || []);
      setSampleError('');
    } catch (err) {
      setSampleError('Failed to load sample questions.');
      console.error('API Error:', err);
    } finally {
      setLoadingSamples(false);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchSampleQuestions();
  }, []);

  // Handle submitting a new speaking test
  const handleSubmitTest = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!question.trim()) {
      setError('Question cannot be empty');
      return;
    }
              
    try {
      const res = await axios.post(API_URL, {
        question: question,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setTests([res.data.data, ...tests]);
      setQuestion('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create test';
      setError(errorMsg);
      console.error('API Error:', err.response?.data || err.message);
    }
  };

  // Handle submitting a new sample question
  const handleSubmitSample = async (e) => {
    e.preventDefault();
    setSampleError('');
    
    if (!newSampleQuestion.trim()) {
      setSampleError('Question text cannot be empty');
      return;
    }

    try {
      const res = await axios.post(SAMPLES_URL, {
        text: newSampleQuestion,
        category: category,
        difficulty: difficulty
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setSampleQuestions([...sampleQuestions, res.data.data]);
      setNewSampleQuestion('');
      setCategory('General');
      setDifficulty('Medium');
    } catch (err) {
      setSampleError(err.response?.data?.message || 'Failed to create sample question');
      console.error('API Error:', err.response?.data || err.message);
    }
  };

  // Delete a speaking test
  const handleDeleteTest = async (testId) => {
    try {
      await axios.delete(`${API_URL}/${testId}`);
      setTests(tests.filter(test => test.id !== testId));
    } catch (err) {
      setError('Failed to delete test');
      console.error('Error deleting test:', err);
    }
  };

  // Delete a sample question
  const handleDeleteSample = async (questionId) => {
    try {
      await axios.delete(`${SAMPLES_URL}/${questionId}`);
      setSampleQuestions(sampleQuestions.filter(q => q.id !== questionId));
    } catch (err) {
      setSampleError('Failed to delete sample question');
      console.error('Error deleting sample question:', err);
    }
  };

  // Use a sample question as a test
  const useAsSpeakingTest = (text) => {
    setQuestion(text);
    setActiveTab('tests');
  };

  // Enhanced Styling
  const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#fff',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
    borderRadius: '12px'
  };
  
  const headerStyle = {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '25px',
    color: '#2c3e50',
    textAlign: 'center',
    borderBottom: '3px solid #3498db',
    paddingBottom: '12px'
  };
  
  const tabContainerStyle = {
    display: 'flex',
    marginBottom: '30px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px 8px 0 0',
    overflow: 'hidden'
  };

  const tabStyle = {
    padding: '15px 28px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#6c757d',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
    flex: 1,
    textAlign: 'center'
  };
  
  const activeTabStyle = {
    ...tabStyle,
    color: '#fff',
    backgroundColor: '#3498db',
    borderBottom: '3px solid #2980b9',
    fontWeight: '600'
  };

  const formContainerStyle = {
    marginBottom: '30px',
    padding: '25px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: '1px solid #eaeaea'
  };
  
  const formTitleStyle = {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#343a40',
    borderLeft: '4px solid #3498db',
    paddingLeft: '10px'
  };

  const textareaStyle = {
    width: '100%',
    minHeight: '120px',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    fontSize: '16px',
    marginBottom: '20px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  };

  const buttonStyle = {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const deleteButtonStyle = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const useButtonStyle = {
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };
  
  const testCardStyle = {
    margin: '20px 0',
    padding: '25px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #eaeaea',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative'
  };
  
  const testCardHoverStyle = {
    ...testCardStyle,
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
  };

  const testTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#343a40',
    display: 'flex',
    alignItems: 'center'
  };
  
  const testQuestionStyle = {
    fontSize: '17px',
    marginBottom: '15px',
    lineHeight: '1.6',
    color: '#495057',
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #e9ecef'
  };
  
  const testMetaStyle = {
    fontSize: '14px',
    color: '#6c757d',
    marginBottom: '20px'
  };
  
  const previousResponseStyle = {
    marginBottom: '25px',
    padding: '15px',
    backgroundColor: '#e9f5ff',
    borderRadius: '6px',
    border: '1px solid #b8daff'
  };

  const [hoveredCardId, setHoveredCardId] = useState(null);

  if (loading && loadingSamples) {
    return (
      <div style={containerStyle}>
        <div style={{
          textAlign: 'center',
          padding: '60px',
          fontSize: '18px',
          color: '#6c757d'
        }}>
          <div style={{
            display: 'inline-block',
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      {/* Modals */}
      <Modal 
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Test Instructions"
      >
        <TestInstructions />
      </Modal>

      <Modal 
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        title="Test Results"
      >
        <div>
          <p>You completed the speaking test.</p>
          <div style={{ 
            backgroundColor: '#fff3cd',
            padding: '10px',
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <p><strong>Feedback:</strong> Try to use more complex sentences and vocabulary.</p>
          </div>
        </div>
      </Modal>

      <div style={containerStyle}>
        <h2 style={headerStyle}>IELTS Speaking Tests Platform</h2>
        
        {/* Instructions Button */}
        <button 
          onClick={() => setShowInstructions(true)}
          style={{
            background: '#6c757d',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '6px',
            border: 'none',
            marginBottom: '20px',
            cursor: 'pointer',
            display: 'block',
            width: '100%',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          View Test Instructions
        </button>
        
        {/* Navigation Tabs */}
        <div style={tabContainerStyle}>
          <div 
            style={activeTab === 'tests' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('tests')}
          >
            Speaking Tests
          </div>
          <div 
            style={activeTab === 'samples' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('samples')}
          >
            Sample Questions
          </div>
        </div>
        
        {/* Speaking Tests Tab */}
        {activeTab === 'tests' && (
          <div>
            {error && (
              <div style={{
                color: '#721c24',
                margin: '15px 0',
                padding: '15px',
                backgroundColor: '#f8d7da',
                borderRadius: '6px',
                border: '1px solid #f5c6cb'
              }}>
                {error}
                {error.includes('backend') && (
                  <div style={{ marginTop: '10px', fontSize: '14px' }}>
                    <p style={{ fontWeight: '500' }}>Make sure:</p>
                    <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                      <li>Your Flask backend is running (check terminal)</li>
                      <li>You're using the correct port (usually 5000)</li>
                      <li>There are no CORS errors in browser console</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div style={{
              ...formContainerStyle,
              background: 'linear-gradient(to bottom, #ffffff, #f9f9f9)'
            }}>
              <h3 style={formTitleStyle}>Add New Speaking Test</h3>
              <form onSubmit={handleSubmitTest}>
                {testStarted && showQuestion && (
                  <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Speaking Test</h3>
                    <Timer 
                      expiryTimestamp={setupTimer(2)} 
                      onExpire={() => {
                        setTimeExpired(true);
                        setShowResults(true);
                        alert("Time's up! Please submit your response.");
                      }} 
                    />
                  </div>
                )}
                <textarea
                  style={{
                    ...textareaStyle,
                    borderColor: question ? '#28a745' : '#ced4da',
                  }}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your speaking test question here..."
                  required
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.25)'}
                  onBlur={(e) => e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)'}
                />
                <button 
                  type="submit" 
                  style={buttonStyle}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Submit
                </button>
                
                <button 
                  onClick={generateMockQuestions}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#ffc107',
                    marginTop: '10px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0a800'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffc107'}
                >
                  Generate AI Questions (Demo)
                </button>

                <button 
                  onClick={() => handleStartTest(1)} // Using 1 as a sample ID
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#17a2b8',
                    marginTop: '10px',
                    marginLeft: '10px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
                >
                  Start Practice Test
                </button>
              </form>
            </div>

            <div>
              <h3 style={{
                ...formTitleStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Test Records</span>
                <span style={{
                  fontSize: '14px', 
                  fontWeight: 'normal',
                  color: '#6c757d',
                  backgroundColor: '#e9ecef',
                  padding: '3px 8px',
                  borderRadius: '12px'
                }}>
                  {tests.length} {tests.length === 1 ? 'Test' : 'Tests'}
                </span>
              </h3>
              
              {tests.length === 0 ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  color: '#6c757d'
                }}>
                  <p style={{ marginBottom: '15px', fontSize: '18px' }}>No tests available</p>
                  <p style={{ fontSize: '14px' }}>Create your first speaking test or use a sample question</p>
                </div>
              ) : (
                <div>
                  {tests.map(test => (
                    <div 
                      key={test.id} 
                      style={hoveredCardId === test.id ? testCardHoverStyle : testCardStyle}
                      onMouseEnter={() => setHoveredCardId(test.id)}
                      onMouseLeave={() => setHoveredCardId(null)}
                    >
                      <h4 style={testTitleStyle}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          borderRadius: '50%',
                          marginRight: '10px',
                          fontSize: '14px'
                        }}>
                          {test.id}
                        </span>
                        Question #{test.id}
                      </h4>
                      
                      <p style={testQuestionStyle}>{test.question}</p>
                      
                      <p style={testMetaStyle}>
                        <small>Created: {new Date(test.created_at).toLocaleString('en-US', {
                          timeZone: 'Asia/Kolkata', // IST timezone
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true })}</small>
                      </p>
                      
                      {test.response && (
                        <div style={{
                          ...previousResponseStyle,
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                        }}>
                          <p style={{ 
                            fontSize: '15px', 
                            fontWeight: '600', 
                            marginBottom: '8px', 
                            color: '#0c5460',
                            display: 'flex',
                            alignItems: 'center' 
                          }}>
                            <span style={{
                              display: 'inline-block',
                              width: '6px',
                              height: '6px',
                              backgroundColor: '#0c5460',
                              borderRadius: '50%',
                              marginRight: '8px'
                            }}></span>
                            Previous Response:
                          </p>
                          <p style={{ 
                            fontSize: '15px', 
                            lineHeight: '1.6', 
                            color: '#0c5460',
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            padding: '10px',
                            borderRadius: '4px'
                          }}>
                            {test.response}
                          </p>
                           {/* NEW AUDIO PLAYER SECTION */}
                           {test.audio_file_url && (
                             <div style={{ 
                               marginTop: '15px',
                               padding: '15px',
                               backgroundColor: '#e9f5ff',
                               borderRadius: '6px',
                               border: '1px solid #b8daff'
                             }}>
                           <p style={{
                             fontSize: '15px',
                             fontWeight: '600',
                             marginBottom: '10px',
                             color: '#0c5460'
                           }}>
                            Audio Response:
                          </p>
                           <audio 
                            controls 
                            src={`http://localhost:5000${test.audio_file_url}`} 
                            style={{
                             width: '100%',
                             marginBottom: '10px',
                             backgroundColor: '#f8f9fa',
                             borderRadius: '4px'
                           }}
                          >
                           Your browser does not support the audio element.
                          </audio>
                          <a
                            href={`http://localhost:5000${test.audio_file_url}`}
                            download
                            style={{
                              display: 'inline-block',
                              padding: '8px 12px',
                              backgroundColor: '#17a2b8',
                              color: 'white',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            ⬇️ Download Audio
                          </a>
                         </div>
                        )}
                        </div>
                      )}
                      
                      {test.score && (
                        <div style={{
                          marginBottom: '15px',
                          fontSize: '16px',
                          backgroundColor: '#fff3cd',
                          padding: '10px 15px',
                          borderRadius: '6px',
                          border: '1px solid #ffeeba',
                          color: '#856404',
                          display: 'inline-block'
                        }}>
                          <strong>Score:</strong> {test.score}
                        </div>
                      )}
                      
                      {/* Response Form */}
                      <SubmitResponseForm testId={test.id} />
                      
                      <div style={{ marginTop: '15px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleStartTest(test.id)}
                          style={{
                            ...useButtonStyle,
                            marginRight: '10px'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
                        >
                          Start Test
                        </button>
                        <button 
                          onClick={() => handleDeleteTest(test.id)}
                          style={deleteButtonStyle}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Sample Questions Tab */}
        {activeTab === 'samples' && (
          <div>
            {sampleError && (
              <div style={{
                color: '#721c24',
                margin: '15px 0',
                padding: '15px',
                backgroundColor: '#f8d7da',
                borderRadius: '6px',
                border: '1px solid #f5c6cb'
              }}>
                {sampleError}
              </div>
            )}

            <div style={{
              ...formContainerStyle,
              background: 'linear-gradient(to bottom, #ffffff, #f9f9f9)'
            }}>
              <h3 style={formTitleStyle}>Add New Sample Question</h3>
              <form onSubmit={handleSubmitSample}>
                <textarea
                  style={{
                    ...textareaStyle,
                    borderColor: newSampleQuestion ? '#17a2b8' : '#ced4da',
                  }}
                  value={newSampleQuestion}
                  onChange={(e) => setNewSampleQuestion(e.target.value)}
                  placeholder="Enter sample question text..."
                  required
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(23, 162, 184, 0.25)'}
                  onBlur={(e) => e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)'}
                />
                
                <div style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  marginBottom: '20px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px',
                      fontSize: '15px',
                      fontWeight: '500',
                      color: '#495057'
                    }}>
                      Category:
                    </label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '12px', 
                        borderRadius: '6px', 
                        border: '1px solid #ced4da',
                        fontSize: '15px',
                        backgroundColor: '#fff',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px top 50%',
                        backgroundSize: '10px auto',
                        paddingRight: '30px'
                      }}
                    >
                      <option value="General">General</option>
                      <option value="Personal">Personal</option>
                      <option value="Education">Education</option>
                      <option value="Work">Work</option>
                      <option value="Technology">Technology</option>
                      <option value="Environment">Environment</option>
                      <option value="Culture">Culture</option>
                      <option value="Health">Health</option>
                      <option value="Food">Food</option>
                      <option value="Travel">Travel</option>
                      <option value="Urban Life">Urban Life</option>
                      <option value="Literature">Literature</option>
                    </select>
                  </div>
                  
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px',
                      fontSize: '15px',
                      fontWeight: '500',
                      color: '#495057'
                    }}>
                      Difficulty:
                    </label>
                    <select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '12px', 
                        borderRadius: '6px', 
                        border: '1px solid #ced4da',
                        fontSize: '15px',
                        backgroundColor: '#fff',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px top 50%',
                        backgroundSize: '10px auto',
                        paddingRight: '30px'
                      }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
                
                <button type="submit" style={{
                  ...buttonStyle,
                  backgroundColor: '#17a2b8'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Add Sample Question
                </button>
              </form>
            </div>

            <div>
              <h3 style={{
                ...formTitleStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Sample Questions Library</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 'normal',
                  color: '#6c757d',
                  backgroundColor: '#e9ecef',
                  padding: '3px 8px',
                  borderRadius: '12px'
                }}>
                  {sampleQuestions.length} {sampleQuestions.length === 1 ? 'Question' : 'Questions'}
                </span>
              </h3>
              
              {sampleQuestions.length === 0 ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  color: '#6c757d'
                }}>
                  <p style={{ marginBottom: '15px', fontSize: '18px' }}>No sample questions available</p>
                  <p style={{ fontSize: '14px' }}>Add your first sample question to get started</p>
                </div>
              ) : (
                <div>
                  {sampleQuestions.map((q) => (
                    <div key={q.id} style={{
                      border: '1px solid #e2e8f0',
                      padding: '20px',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      backgroundColor: '#f9fafb',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      ':hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                      }
                    }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '12px',
                        color: '#343a40',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '26px',
                          height: '26px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          borderRadius: '50%',
                          marginRight: '10px',
                          fontSize: '14px'
                        }}>
                          {q.id}
                        </span>
                        Sample Question
                      </h4>
                      
                      <p style={{
                        fontSize: '16px',
                        marginBottom: '15px',
                        lineHeight: '1.6',
                        padding: '15px',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        border: '1px solid #e9ecef'
                      }}>
                        {q.text}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px',
                        marginBottom: '15px'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: '#e2f3f5',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '14px',
                          color: '#0c5460'
                        }}>
                          <strong>Category:</strong> {q.category}
                        </span>
                        
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: q.difficulty === 'Easy' ? '#d4edda' : 
                                         q.difficulty === 'Medium' ? '#fff3cd' : '#f8d7da',
                          color: q.difficulty === 'Easy' ? '#155724' :
                                q.difficulty === 'Medium' ? '#856404' : '#721c24',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '14px'
                        }}>
                          <strong>Difficulty:</strong> {q.difficulty}
                        </span>
                      </div>
                      
                      <div style={{ 
                        marginTop: '15px',
                        display: 'flex',
                        gap: '10px'
                      }}>
                        <button 
                          onClick={() => useAsSpeakingTest(q.text)}
                          style={{
                            ...useButtonStyle,
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 14px'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
                        >
                          <span style={{ marginRight: '5px' }}>&#43;</span> Use as Speaking Test
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteSample(q.id)}
                          style={{
                            ...deleteButtonStyle,
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 14px'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                        >
                          <span style={{ marginRight: '5px' }}>&#10005;</span> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakingTests;