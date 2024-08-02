const openai = require('./openai-client');

async function createThread() {
  try {
    const thread = await openai.beta.threads.create();
    return thread;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}

async function addMessage(threadId, content) {
  try {
    const message = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: content,
    });
    return message;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

async function runAssistant(threadId, assistantId) {
  try {
    console.log(`Running assistant with ID: ${assistantId} for thread: ${threadId}`);
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
    console.log(`Run created: ${run.id}`);
    return run;
  } catch (error) {
    console.error('Error running assistant:', error);
    throw error;
  }
}

async function getResponse(threadId, runId) {
  try {
    let run;
    do {
      run = await openai.beta.threads.runs.retrieve(threadId, runId);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
    } while (run.status !== 'completed');

    const messages = await openai.beta.threads.messages.list(threadId);
    return messages.data[0].content[0].text.value;
  } catch (error) {
    console.error('Error getting response:', error);
    throw error;
  }
}

module.exports = {
  createThread,
  addMessage,
  runAssistant,
  getResponse,
};