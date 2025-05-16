import React from 'react';

const TestInstructions = () => {
  return (
    <div>
      <h3>IELTS Speaking Test Instructions</h3>
      <ul style={{ paddingLeft: '20px' }}>
        <li>The test has 3 parts lasting 11-14 minutes</li>
        <li>Part 1: Introduction and interview (4-5 minutes)</li>
        <li>Part 2: Long turn (3-4 minutes)</li>
        <li>Part 3: Discussion (4-5 minutes)</li>
        <li>Speak clearly and at a natural pace</li>
        <li>Expand your answers with reasons/examples</li>
      </ul>
      <div style={{ 
        backgroundColor: '#f8f9fa',
        padding: '10px',
        borderRadius: '4px',
        marginTop: '10px'
      }}>
        <p><strong>Tip:</strong> Practice common topics like hobbies, work, and studies.</p>
      </div>
    </div>
  );
};

export default TestInstructions;
