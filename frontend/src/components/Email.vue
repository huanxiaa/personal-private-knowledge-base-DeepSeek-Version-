<template>
  <div class="email">
    <h2>邮件发送</h2>
    
    <!-- 基本邮件发送 -->
    <div class="send-email">
      <h3>基本邮件发送</h3>
      <div class="form-group">
        <label for="to">收件人:</label>
        <input 
          type="email" 
          id="to" 
          v-model="emailTo"
          placeholder="请输入收件人邮箱"
        />
      </div>
      <div class="form-group">
        <label for="subject">主题:</label>
        <input 
          type="text" 
          id="subject" 
          v-model="emailSubject"
          placeholder="请输入邮件主题"
        />
      </div>
      <div class="form-group">
        <label for="content">内容:</label>
        <textarea 
          id="content" 
          v-model="emailContent" 
          placeholder="请输入邮件内容..."
          rows="4"
        ></textarea>
      </div>
      <button @click="sendEmail" :disabled="isLoading">
        {{ isLoading ? '发送中...' : '发送邮件' }}
      </button>
      <div v-if="emailMessage" class="message" :class="emailMessage.success ? 'success' : 'error'">
        {{ emailMessage.message }}
      </div>
    </div>
    
    <!-- 发送知识库问答结果邮件 -->
    <div class="send-answer-email">
      <h3>发送知识库问答结果邮件</h3>
      <div class="form-group">
        <label for="answer-to">收件人:</label>
        <input 
          type="email" 
          id="answer-to" 
          v-model="answerEmailTo"
          placeholder="请输入收件人邮箱"
        />
      </div>
      <div class="form-group">
        <label for="answer-question">问题:</label>
        <textarea 
          id="answer-question" 
          v-model="answerQuestion" 
          placeholder="请输入问题..."
          rows="2"
        ></textarea>
      </div>
      <div class="form-group">
        <label for="answer-content">回答:</label>
        <textarea 
          id="answer-content" 
          v-model="answerContent" 
          placeholder="请输入回答..."
          rows="3"
        ></textarea>
      </div>
      <button @click="sendKnowledgeBaseAnswer" :disabled="isLoading">
        {{ isLoading ? '发送中...' : '发送问答结果' }}
      </button>
      <div v-if="answerEmailMessage" class="message" :class="answerEmailMessage.success ? 'success' : 'error'">
        {{ answerEmailMessage.message }}
      </div>
    </div>
  </div>
</template>

<script>
// 导入axios，用于发送HTTP请求
import axios from 'axios'

export default {
  name: 'Email',
  data() {
    return {
      // 基本邮件信息
      emailTo: '',
      emailSubject: '',
      emailContent: '',
      // 知识库问答结果邮件信息
      answerEmailTo: '',
      answerQuestion: '',
      answerContent: '',
      // 加载状态
      isLoading: false,
      // 邮件发送消息
      emailMessage: null,
      // 问答结果邮件发送消息
      answerEmailMessage: null
    }
  },
  methods: {
    // 发送基本邮件
    async sendEmail() {
      if (!this.emailTo.trim() || !this.emailSubject.trim() || !this.emailContent.trim()) {
        this.emailMessage = { success: false, message: '请填写所有必填字段' }
        return
      }
      
      this.isLoading = true
      this.emailMessage = null
      
      try {
        const response = await axios.post('/api/email/send', {
          to: this.emailTo,
          subject: this.emailSubject,
          content: this.emailContent
        })
        this.emailMessage = response.data
        if (response.data.success) {
          this.emailTo = ''
          this.emailSubject = ''
          this.emailContent = ''
        }
      } catch (error) {
        this.emailMessage = { success: false, message: '邮件发送失败' }
        console.error('邮件发送失败:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    // 发送知识库问答结果邮件
    async sendKnowledgeBaseAnswer() {
      if (!this.answerEmailTo.trim() || !this.answerQuestion.trim() || !this.answerContent.trim()) {
        this.answerEmailMessage = { success: false, message: '请填写所有必填字段' }
        return
      }
      
      this.isLoading = true
      this.answerEmailMessage = null
      
      try {
        const response = await axios.post('/api/email/send-answer', {
          to: this.answerEmailTo,
          question: this.answerQuestion,
          answer: this.answerContent
        })
        this.answerEmailMessage = response.data
        if (response.data.success) {
          this.answerEmailTo = ''
          this.answerQuestion = ''
          this.answerContent = ''
        }
      } catch (error) {
        this.answerEmailMessage = { success: false, message: '问答结果邮件发送失败' }
        console.error('问答结果邮件发送失败:', error)
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.email {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.send-email,
.send-answer-email {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: bold;
  font-size: 0.9rem;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
}

input[type="email"] {
  width: 100%;
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
  align-self: flex-start;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.message {
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  max-width: 500px;
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