import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import AssistantList from './components/AssistantList';
import ChatInterface from './components/ChatInterface';
import ConversationList from './components/ConversationList';
import ErrorMessage from './components/ErrorMessage';

// Heroku 앱 URL을 상수로 정의
const API_URL = 'https://temporarymagicnote-27062cbc5678.herokuapp.com' || 'http://localhost:5000';

function App() {
  const [assistants, setAssistants] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveConversationsToLocalStorage = useCallback(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
    console.log('Saved conversations:', conversations);
  }, [conversations]);

  useEffect(() => {
    fetchAssistants();
    loadConversationsFromLocalStorage();
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      saveConversationsToLocalStorage();
    }
  }, [conversations, saveConversationsToLocalStorage]);

  const fetchAssistants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/assistants`);
      setAssistants(response.data);
    } catch (error) {
      console.error('Assistant 가져오기 오류:', error);
      setError('Assistant 목록을 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversationsFromLocalStorage = () => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const parsedConversations = JSON.parse(savedConversations);
      setConversations(parsedConversations);
      console.log('Loaded conversations:', parsedConversations);
    }
  };

  const createConversation = async (assistant) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/conversation`, { assistantId: assistant.id });
      const newConversation = {
        id: response.data.threadId,
        assistant: assistant,
        name: `Chat with ${assistant.name}`,
        messages: []
      };
      const updatedConversations = [...conversations, newConversation];
      setConversations(updatedConversations);
      setActiveConversation(newConversation);
    } catch (error) {
      console.error('대화 생성 오류:', error);
      setError('새 대화를 시작하는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content) => {
    if (!activeConversation) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/message`, {
        threadId: activeConversation.id,
        message: content,
        assistantId: activeConversation.assistant.id
      });

      const updatedConversations = conversations.map(conv => {
        if (conv.id === activeConversation.id) {
          return {
            ...conv,
            messages: [
              ...conv.messages,
              { content, isUser: true },
              { content: response.data.response, isUser: false }
            ]
          };
        }
        return conv;
      });

      setConversations(updatedConversations);
      setActiveConversation(updatedConversations.find(conv => conv.id === activeConversation.id));
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      setError('메시지 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    
    try {
      const response = await axios.get(`${API_URL}/thread/${conversation.id}/messages`);
      const updatedConversation = { ...conversation, messages: response.data.messages };
      const updatedConversations = conversations.map(conv =>
        conv.id === conversation.id ? updatedConversation : conv
      );
      setConversations(updatedConversations);
      setActiveConversation(updatedConversation);
    } catch (error) {
      console.error('대화 내용 가져오기 실패:', error);
      setError('대화 내용을 불러오는데 실패했습니다.');
    }
  };

  const renameConversation = (id, newName) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === id ? { ...conv, name: newName } : conv
    );
    setConversations(updatedConversations);
  };

  const deleteConversation = (id) => {
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    if (activeConversation && activeConversation.id === id) {
      setActiveConversation(null);
    }
  };

  const resetAll = () => {
    setConversations([]);
    setActiveConversation(null);
    localStorage.removeItem('conversations');
  };

  return (
    <div className="App">
      <h1>OpenAI Assistant API 데모</h1>
      {error && <ErrorMessage message={error} />}
      <div className="main-container">
        <div className="sidebar">
          <AssistantList
            assistants={assistants}
            onSelectAssistant={createConversation}
            isLoading={isLoading}
          />
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={selectConversation}
            onRenameConversation={renameConversation}
            onDeleteConversation={deleteConversation}
          />
          <button onClick={resetAll} className="reset-button">모두 초기화</button>
        </div>
        <ChatInterface
          conversation={activeConversation}
          sendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;