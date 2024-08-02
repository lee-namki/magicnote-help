import React, { useState } from 'react';
import './AssistantList.css';

function AssistantList({ assistants, onSelectAssistant, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return <div className="assistant-list">Assistant 목록을 불러오는 중...</div>;
  }

  return (
    <div className="assistant-list">
      <button className="menu-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Close' : 'Select Assistant'}
      </button>
      {isOpen && (
        <div className="assistant-menu">
          {assistants.map((assistant) => (
            <button
              key={assistant.id}
              className="assistant-item"
              onClick={() => {
                onSelectAssistant(assistant);
                setIsOpen(false);
              }}
            >
              {assistant.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AssistantList;