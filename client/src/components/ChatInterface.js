import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';

function ChatInterface({ conversation, sendMessage, isLoading }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const copyToClipboard = (text) => {
    const cleanedText = text.replace(/\*\*|【.*?】|\[.*?\]/g, '').trim();
    navigator.clipboard.writeText(cleanedText).then(() => {
      alert('텍스트가 클립보드에 복사되었습니다.');
    }).catch(err => {
      console.error('복사 중 오류가 발생했습니다:', err);
    });
  };

  if (!conversation) {
    return <div className="chat-interface">대화를 선택하거나 새로운 대화를 시작하세요.</div>;
  }

  return (
    <div className="chat-interface">
      <h2>Chat with {conversation.assistant.name}</h2>
      <div className="message-list">
        {conversation.messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isUser ? 'user' : 'assistant'}`}>
            <div className="message-sender">{msg.isUser ? '학생' : 'Magicnote'}</div>
            <div className="message-content">{msg.content}</div>
            {!msg.isUser && (
              <button className="copy-button" onClick={() => copyToClipboard(msg.content)}>
                복사
              </button>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-sender">Magicnote</div>
            <div className="message-content loading">
              <div className="loading-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요... (Ctrl+Enter로 전송)"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>전송</button>
      </form>
    </div>
  );
}

export default ChatInterface;