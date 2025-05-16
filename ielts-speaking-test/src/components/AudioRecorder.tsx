import { useState, useRef, useEffect } from 'react';

// Basic styles directly in component to ensure visibility
const AudioRecorder = ({ onRecordingComplete, onError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioURL(audioURL);
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Microphone access error:', error);
      const errorMsg = 'Microphone access denied. Please allow access to your microphone.';
      setErrorMessage(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!audioURL) return;
    
    const a = document.createElement('a');
    a.href = audioURL;
    a.download = 'ielts-speaking-response.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Record Your Response</h3>
        
        {errorMessage && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}
        
        <div className="mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-4 py-2 rounded-md font-medium ${
              isRecording 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRecording ? (
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-white animate-pulse mr-2"></span>
                Stop Recording
              </div>
            ) : 'Start Recording'}
          </button>
          
          {isRecording && (
            <div className="mt-2 text-lg font-mono">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>
        
        {audioURL && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-3">Your Recording:</h4>
            <audio src={audioURL} controls className="w-full mb-3" />
            <div>
              <button 
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Download Recording
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Demo component to show the AudioRecorder in action
export default function AudioRecorderDemo() {
  const handleRecordingComplete = (blob) => {
    console.log("Recording completed:", blob);
  };
  
  const handleError = (error) => {
    console.error("Recording error:", error);
  };
  
  return (
    <div className="p-4">
      <AudioRecorder 
        onRecordingComplete={handleRecordingComplete}
        onError={handleError}
      />
    </div>
  );
}