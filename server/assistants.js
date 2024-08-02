const openai = require('./openai-client');

let assistants = [];

async function fetchAssistants() {
  try {
    const response = await openai.beta.assistants.list({
      order: "desc",
      limit: 100, // 필요에 따라 조정
    });
    assistants = response.data;
    console.log(`${assistants.length}개의 Assistant를 성공적으로 가져왔습니다.`);
  } catch (error) {
    console.error('Assistant 가져오기 오류:', error);
    assistants = [];
  }
}

function getAssistants() {
  return assistants.map(assistant => ({
    id: assistant.id,
    name: assistant.name,
    description: assistant.description
  }));
}

function getAssistantById(id) {
  return assistants.find(assistant => assistant.id === id);
}

module.exports = {
  fetchAssistants,
  getAssistants,
  getAssistantById
};