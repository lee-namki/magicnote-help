import React from 'react';

function Message({ content, isUser }) {
  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      <p>{content}</p>
    </div>
  );
}

export default Message;