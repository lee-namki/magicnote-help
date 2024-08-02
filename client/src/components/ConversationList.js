import React, { useState } from 'react';
import './ConversationList.css';

function ConversationList({ conversations, activeConversation, onSelectConversation, onRenameConversation, onDeleteConversation }) {
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');

  const handleRename = (id, currentName) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const handleSaveRename = (id) => {
    onRenameConversation(id, newName);
    setEditingId(null);
  };

  return (
    <div className="conversation-list">
      <h3>대화 목록</h3>
      <ul>
        {conversations.map((conversation) => (
          <li key={conversation.id} className={activeConversation && activeConversation.id === conversation.id ? 'active' : ''}>
            {editingId === conversation.id ? (
              <div className="rename-form">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
                <button onClick={() => handleSaveRename(conversation.id)}>확인</button>
                <button onClick={() => setEditingId(null)}>취소</button>
              </div>
            ) : (
              <div className="conversation-item">
                <span 
                  className="conversation-name"
                  onClick={() => onSelectConversation(conversation)}
                >
                  {conversation.name || `Chat with ${conversation.assistant.name}`}
                </span>
                <div className="conversation-actions">
                  <button onClick={() => handleRename(conversation.id, conversation.name || `Chat with ${conversation.assistant.name}`)}>
                    이름 변경
                  </button>
                  <button onClick={() => onDeleteConversation(conversation.id)}>삭제</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConversationList;