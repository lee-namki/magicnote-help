const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { fetchAssistants, getAssistants } = require('./assistants');
const { createThread, addMessage, runAssistant, getResponse } = require('./threads');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Thread 저장소 (실제 구현에서는 데이터베이스를 사용하는 것이 좋습니다)
const threads = new Map();

// Assistant 초기화
(async () => {
  await fetchAssistants();
})();

// Assistant 목록 가져오기
app.get('/assistants', (req, res) => {
  const assistants = getAssistants();
  res.json(assistants);
});

// 대화 시작 (Thread 생성)
app.post('/conversation', async (req, res) => {
  const { assistantId } = req.body;
  try {
    const thread = await createThread();
    threads.set(thread.id, { assistantId, messages: [] });
    res.json({ threadId: thread.id });
  } catch (error) {
    res.status(500).json({ error: '대화 생성 실패', details: error.message });
  }
});

// 메시지 전송 및 응답 받기
app.post('/message', async (req, res) => {
  const { threadId, message, assistantId } = req.body;
  try {
    await addMessage(threadId, message);
    const run = await runAssistant(threadId, assistantId);
    const response = await getResponse(threadId, run.id);
    
    if (!threads.has(threadId)) {
      threads.set(threadId, { assistantId, messages: [] });
    }
    threads.get(threadId).messages.push({ content: message, isUser: true });
    threads.get(threadId).messages.push({ content: response, isUser: false });

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: '메시지 처리 실패', details: error.message });
  }
});

// Thread의 메시지 기록 가져오기
app.get('/thread/:threadId/messages', (req, res) => {
  const { threadId } = req.params;
  if (threads.has(threadId)) {
    const thread = threads.get(threadId);
    res.json({ messages: thread.messages });
  } else {
    res.status(404).json({ error: '대화를 찾을 수 없습니다.' });
  }
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류 발생', details: err.message });
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});