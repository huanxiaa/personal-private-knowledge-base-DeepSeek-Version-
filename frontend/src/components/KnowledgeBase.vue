<template>
  <div class="knowledge-base">
    <h2>知识库问答</h2>
    
    <!-- 对话管理 -->
    <div class="conversation-management">
      <h3>对话管理</h3>
      <div class="conversation-actions">
        <button @click="createNewConversation" :disabled="isLoading">
          创建新对话
        </button>
        <button @click="deleteCurrentConversation" :disabled="isLoading || !currentConversationId">
          删除当前对话
        </button>
      </div>
      <div class="conversation-list">
        <h4>对话列表</h4>
        <ul>
          <li 
            v-for="convId in conversations" 
            :key="convId"
            :class="{ active: convId === currentConversationId }"
            @click="switchConversation(convId)"
          >
            {{ convId }}
          </li>
        </ul>
      </div>
    </div>
    
    <!-- 添加文档到知识库 -->
    <div class="add-document">
      <h3>添加文档到知识库</h3>
      <textarea 
        v-model="documentContent" 
        placeholder="请输入文档内容..."
        rows="4"
      ></textarea>
      <button @click="addDocument">添加文档</button>
      <div v-if="addDocumentMessage" class="message" :class="addDocumentMessage.success ? 'success' : 'error'">
        {{ addDocumentMessage.message }}
      </div>
    </div>
    
    <!-- DeepSeek账户信息 -->
    <div class="deepseek-account">
      <h3>DeepSeek账户信息</h3>
      <button @click="fetchDeepSeekAccountInfo" :disabled="isLoading">
        {{ isLoading ? '加载中...' : '刷新账户信息' }}
      </button>
      <div v-if="accountInfo" class="account-info">
        <p><strong>剩余token:</strong> {{ accountInfo.remaining_tokens || 'N/A' }}</p>
        <p><strong>剩余金额:</strong> {{ accountInfo.total_balance || 'N/A' }}</p>
      </div>
    </div>
    
    <!-- 对话区域 -->
    <div class="conversation">
      <h3>对话</h3>
      
      <!-- 对话历史 -->
      <div class="chat-history">
        <div 
          v-for="(message, index) in chatHistory" 
          :key="index" 
          class="message" 
          :class="message.role === 'user' ? 'user-message' : 'assistant-message'"
        >
          <div class="message-role">{{ message.role === 'user' ? '我' : '助手' }}:</div>
          <div class="message-content" v-html="message.content.replace(/\n/g, '<br>')"></div>
          <div v-if="message.usage" class="message-usage">
            <small>使用token: {{ message.usage.total_tokens }} (提示: {{ message.usage.prompt_tokens }}, 完成: {{ message.usage.completion_tokens }})</small>
          </div>
        </div>
      </div>
      
      <!-- 提问 -->
      <div class="ask-question">
        <h4>向知识库提问</h4>
        <textarea 
          v-model="question" 
          placeholder="请输入您的问题..."
          rows="3"
        ></textarea>
        <div class="button-group">
          <button @click="askQuestion" :disabled="isLoading || !question.trim()">
            {{ isLoading ? '处理中...' : '提交问题' }}
          </button>
          <button @click="askQuestionWithDeepSeek" :disabled="isLoading || !question.trim()">
            {{ isLoading ? '处理中...' : '使用DeepSeek API' }}
          </button>
        </div>
        <div v-if="errorMessage" class="message error">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 导入axios，用于发送HTTP请求
import axios from 'axios'
// 导入ref和onMounted，用于创建响应式数据和组件挂载时执行
import { ref, onMounted } from 'vue'

// 文档内容
const documentContent = ref('')
// 问题
const question = ref('')
// 加载状态
const isLoading = ref(false)
// 添加文档消息
const addDocumentMessage = ref(null)
// 错误消息
const errorMessage = ref(null)
// 对话历史
const chatHistory = ref([])
// 当前对话ID
const currentConversationId = ref('default')
// 对话列表
const conversations = ref(['default'])
// DeepSeek账户信息
const accountInfo = ref(null)
// 账户信息消息
const accountInfoMessage = ref(null)

// 组件挂载时获取对话列表
onMounted(async () => {
  await fetchConversations();
  await fetchConversationHistory(currentConversationId.value);
});

// 获取对话列表
async function fetchConversations() {
  try {
    const response = await axios.get('/api/knowledge-base/conversations');
    if (response.data.success) {
      conversations.value = response.data.conversations;
      // 确保默认对话存在
      if (!conversations.value.includes('default')) {
        conversations.value.push('default');
      }
    }
  } catch (error) {
    console.error('获取对话列表失败:', error);
  }
}

// 获取对话历史
async function fetchConversationHistory(conversationId) {
  try {
    const response = await axios.get(`/api/knowledge-base/conversation-history?conversationId=${conversationId}`);
    if (response.data.success) {
      // 转换对话历史格式
      chatHistory.value = response.data.history.flatMap(item => [
        { role: 'user', content: item.question },
        { role: 'assistant', content: item.answer }
      ]);
    }
  } catch (error) {
    console.error('获取对话历史失败:', error);
  }
}

// 创建新对话
async function createNewConversation() {
  try {
    const response = await axios.post('/api/knowledge-base/create-conversation');
    if (response.data.success) {
      const newConversationId = response.data.conversationId;
      currentConversationId.value = newConversationId;
      conversations.value.push(newConversationId);
      chatHistory.value = [];
    }
  } catch (error) {
    console.error('创建新对话失败:', error);
  }
}

// 删除当前对话
async function deleteCurrentConversation() {
  if (!currentConversationId.value || currentConversationId.value === 'default') {
    return;
  }
  
  try {
    const response = await axios.post('/api/knowledge-base/delete-conversation', {
      conversationId: currentConversationId.value
    });
    if (response.data.success) {
      // 从对话列表中移除
      conversations.value = conversations.value.filter(id => id !== currentConversationId.value);
      // 切换到默认对话
      currentConversationId.value = 'default';
      // 获取默认对话的历史
      await fetchConversationHistory('default');
    }
  } catch (error) {
    console.error('删除对话失败:', error);
  }
}

// 切换对话
async function switchConversation(conversationId) {
  currentConversationId.value = conversationId;
  await fetchConversationHistory(conversationId);
}

// 获取DeepSeek账户信息
async function fetchDeepSeekAccountInfo() {
  isLoading.value = true;
  accountInfoMessage.value = null;
  
  try {
    const response = await axios.get('/api/knowledge-base/deepseek-account');
    console.log('获取DeepSeek账户信息成功:', response.data);
    // accountInfoMessage.value = response.data.accountInfo;
    if (response.data.success) {
      accountInfo.value = response.data.accountInfo[0];
    }
  } catch (error) {
    // accountInfoMessage.value = { success: false, message: '获取账户信息失败' };
    console.error('获取账户信息失败:', error);
  } finally {
    isLoading.value = false;
  }
}

// 添加文档到知识库
async function addDocument() {
  if (!documentContent.value.trim()) {
    addDocumentMessage.value = { success: false, message: '请输入文档内容' }
    return
  }
  
  try {
    const response = await axios.post('/api/knowledge-base/add-document', {
      content: documentContent.value
    })
    addDocumentMessage.value = response.data
    if (response.data.success) {
      documentContent.value = ''
    }
  } catch (error) {
    addDocumentMessage.value = { success: false, message: '添加文档失败' }
    console.error('添加文档失败:', error)
  }
}

// 向知识库提问
async function askQuestion() {
  if (!question.value.trim()) {
    errorMessage.value = '请输入问题'
    return
  }
  
  // 添加用户问题到对话历史
  chatHistory.value.push({
    role: 'user',
    content: question.value
  })
  
  isLoading.value = true
  errorMessage.value = null
  
  try {
    const response = await axios.post('/api/knowledge-base/ask', {
      question: question.value,
      conversationId: currentConversationId.value
    })
    
    if (response.data.success) {
      // 添加助手回答到对话历史
      chatHistory.value.push({
        role: 'assistant',
        content: response.data.answer,
        usage: response.data.usage,
        accountInfo: response.data.accountInfo
      })
      
      // 更新账户信息
      if (response.data.accountInfo) {
        accountInfo.value = response.data.accountInfo;
      }
    } else {
      errorMessage.value = response.data.message
    }
    
    // 清空问题输入框
    question.value = ''
  } catch (error) {
    errorMessage.value = '提问失败'
    console.error('提问失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 使用DeepSeek API提问
async function askQuestionWithDeepSeek() {
  if (!question.value.trim()) {
    errorMessage.value = '请输入问题'
    return
  }
  
  // 添加用户问题到对话历史
  chatHistory.value.push({
    role: 'user',
    content: question.value
  })
  
  isLoading.value = true
  errorMessage.value = null
  
  try {
    const response = await axios.post('/api/knowledge-base/ask-deepseek', {
      question: question.value
    })
    
    if (response.data.success) {
      // 添加助手回答到对话历史
      chatHistory.value.push({
        role: 'assistant',
        content: response.data.answer,
        usage: response.data.usage,
        accountInfo: response.data.accountInfo
      })
      
      // 更新账户信息
      if (response.data.accountInfo) {
        accountInfo.value = response.data.accountInfo[0];
      }
    } else {
      errorMessage.value = response.data.message
    }
    
    // 清空问题输入框
    question.value = ''
  } catch (error) {
    errorMessage.value = 'DeepSeek API调用失败'
    console.error('DeepSeek API调用失败:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.knowledge-base {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.conversation-management {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.conversation-actions {
  display: flex;
  gap: 1rem;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.conversation-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 150px;
  overflow-y: auto;
}

.conversation-list li {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.conversation-list li:hover {
  background-color: #e3f2fd;
}

.conversation-list li.active {
  background-color: #bbdefb;
  font-weight: bold;
}

.add-document,
.conversation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ask-question {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.chat-history {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.user-message,
.assistant-message {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-message {
  align-self: flex-end;
  max-width: 80%;
}

.assistant-message {
  align-self: flex-start;
  max-width: 80%;
}

.message-role {
  font-weight: bold;
  font-size: 0.875rem;
}

.message-content {
  padding: 0.75rem;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.user-message .message-content {
  background-color: #e3f2fd;
}

.message-usage {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
  text-align: right;
}

.deepseek-account {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.account-info {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.account-info p {
  margin: 0.25rem 0;
}

.message {
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>