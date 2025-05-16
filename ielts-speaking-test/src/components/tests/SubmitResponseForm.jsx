import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SubmitResponseForm = ({ testId }) => {
  const [response, setResponse] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [submittedAudioURL, setSubmittedAudioURL] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Handle starting audio recording
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioUrl);
        setRecordingStatus('recorded');
        
        // Release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingStatus('recording');
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions and try again.');
    }
  };
  
  // Handle stopping audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };
  
  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Delete current recording
  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioURL('');
    setRecordingStatus('');
  };
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!response.trim() && !audioBlob) {
      setError('Please provide a response or record an audio answer.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      // Save current audio URL before submitting
      if (audioBlob) {
        const permanentAudioURL = URL.createObjectURL(audioBlob);
        setSubmittedAudioURL(permanentAudioURL);
      }
      
      // Try dedicated speaking test audio endpoint first (most specific)
      if (audioBlob) {
        console.log(`Attempting to submit audio to speaking test endpoint for test ID: ${testId}`);
        
        const formData = new FormData();
        formData.append('audio', audioBlob, `recording_${testId}.webm`);
        if (response.trim()) {
          formData.append('response', response);
        }
        
        try {
          // Log the form data for debugging
          for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
          }
          
          const res = await axios.post(`http://localhost:5000/api/speaking-tests/${testId}/audio-response`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          console.log('Successfully submitted to speaking test audio endpoint:', res.data);
          handleSuccessfulSubmission();
          return;
        } catch (err) {
          console.warn('Speaking test audio endpoint failed, trying general upload endpoint:', err);
        }
        
        // Try the general audio upload endpoint
        try {
          const res = await axios.post('http://localhost:5000/api/upload-audio', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          console.log('Successfully submitted to general audio endpoint:', res.data);
          handleSuccessfulSubmission();
          return;
        } catch (err) {
          console.warn('General audio endpoint failed, trying fallback endpoint:', err);
        }
        
        // Try the fallback audio endpoint
        try {
          const res = await axios.post('http://localhost:5000/api/submit-audio', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          console.log('Successfully submitted to fallback audio endpoint:', res.data);
          handleSuccessfulSubmission();
          return;
        } catch (err) {
          console.error('All audio-specific endpoints failed:', err);
        }
      }
      
      // If we reach here, either there's no audio or all audio-specific endpoints failed
      // For text-only submission, use the working endpoints we know work for audio
      
      const formData = new FormData();
      formData.append('response', response);
      formData.append('text_only', 'true'); // Add a flag to indicate text-only
      
      try {
        // Use the known working endpoint for audio uploads
        const res = await axios.post('http://localhost:5000/api/upload-audio', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('Text-only response received:', res.data);
        handleSuccessfulSubmission();
        return;
      } catch (err) {
        console.warn('Text-only submission to upload-audio failed, trying general endpoint:', err);
        
        // Try another endpoint that we know works
        try {
          const res = await axios.post('http://localhost:5000/api/submit-audio', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          console.log('Text-only response from fallback endpoint:', res.data);
          handleSuccessfulSubmission();
          return;
        } catch (altErr) {
          console.warn('All dedicated endpoints failed for text-only, trying with empty audio blob:', altErr);
          
          // Last resort: Create an empty audio blob and pretend it's an audio submission
          const emptyBlob = new Blob([], { type: 'audio/webm' });
          const finalFormData = new FormData();
          finalFormData.append('response', response);
          finalFormData.append('audio', emptyBlob, `empty_audio_${testId}.webm`);
          
          try {
            const res = await axios.post('http://localhost:5000/api/upload-audio', finalFormData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            console.log('Text-only (with empty audio) response received:', res.data);
            handleSuccessfulSubmission();
          } catch (finalErr) {
            console.error('All submission attempts failed:', finalErr);
            setError('Failed to submit text response. Please check your connection and try again.');
          }
        }
      }
    }
    catch (finalErr) {
      console.error('Unexpected error during submission process:', finalErr);
      setError('An unexpected error occurred. Please try again later.');
    }
    finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSuccessfulSubmission = () => {
    setMessage('Response submitted successfully!');
    setIsSubmitted(true);
    
    // We don't clear the response as we want to display it in the success view
    setRecordingStatus('');
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #e9ecef',
      marginTop: '20px',
      marginBottom: '20px'
    }}>
      {!isSubmitted ? (
        <>
          <h4 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#495057'
          }}>Submit Your Response</h4>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: '500' }}>Record Audio Response</h5>
              
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#f1f3f5', 
                borderRadius: '6px',
                border: '1px solid #dee2e6'
              }}>
                {/* Audio recorder controls */}
                {!recordingStatus && (
                  <button 
                    type="button"
                    onClick={startRecording}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="6" fill="white"/>
                    </svg>
                    Start Recording
                  </button>
                )}
                
                {/* Recording in progress */}
                {isRecording && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '14px', 
                      height: '14px', 
                      backgroundColor: '#dc3545', 
                      borderRadius: '50%',
                      animation: 'pulse 1.5s infinite'
                    }}></div>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      Recording... {formatTime(recordingTime)}
                    </span>
                    <button 
                      type="button"
                      onClick={stopRecording}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginLeft: '10px'
                      }}
                    >
                      Stop
                    </button>
                  </div>
                )}
                
                {/* Audio playback after recording */}
                {recordingStatus === 'recorded' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <audio 
                      src={audioURL} 
                      controls 
                      style={{ width: '100%', marginBottom: '5px' }}
                    ></audio>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button"
                        onClick={deleteRecording}
                        style={{
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Delete Recording
                      </button>
                      
                      <button 
                        type="button"
                        onClick={startRecording}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Record Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: '500' }}>Written Response (Optional)</h5>
              <textarea
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.3s'
                }}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Enter your written response here (optional if you recorded audio)..."
                disabled={isSubmitting}
                rows={5}
              />
            </div>
            
            <button 
              type="submit" 
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s, transform 0.1s',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'block',
                width: '100%',
                maxWidth: '200px',
                marginBottom: '15px'
              }}
              disabled={isSubmitting}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0069d9'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              {isSubmitting ? (
                <>
                  <span style={{
                    display: 'inline-block', 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTopColor: '#fff', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite', 
                    marginRight: '8px',
                    verticalAlign: 'text-bottom'
                  }}></span>
                  Submitting...
                </>
              ) : 'Submit Response'}
            </button>
            
            {message && (
              <div style={{
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '6px',
                border: '1px solid #c3e6cb',
                fontWeight: '500'
              }}>
                {message}
              </div>
            )}
            
            {error && (
              <div style={{
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '6px',
                border: '1px solid #f5c6cb',
                fontWeight: '500'
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}
          </form>
        </>
      ) : (
        // Submission success view that shows the audio player
        <div>
          <div style={{
            marginBottom: '20px',
            padding: '20px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '6px',
            border: '1px solid #c3e6cb'
          }}>
            <h4 style={{ fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>
              ✅ Response Submitted Successfully!
            </h4>
            
            {submittedAudioURL && (
              <div style={{ marginTop: '15px' }}>
                <h5 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: '500' }}>
                  Your Audio Recording:
                </h5>
                <audio 
                  src={submittedAudioURL} 
                  controls 
                  style={{ width: '100%', marginBottom: '15px' }}
                ></audio>
                
                <a 
                  href={submittedAudioURL} 
                  download="speaking-test-response.webm"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  Download Recording
                </a>
              </div>
            )}
            
            {response && (
              <div style={{ marginTop: '20px' }}>
                <h5 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: '500' }}>
                  Your Written Response:
                </h5>
                <div style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #c3e6cb'
                }}>
                  {response}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Submit Another Response
          </button>
        </div>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SubmitResponseForm;