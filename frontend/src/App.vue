<template>
  <div class="app-container">
    <header class="app-header">
      <h1>私有知识库问答系统</h1>
    </header>
    <main class="app-main">
      <nav class="app-nav">
        <button 
          :class="{ active: activeTab === 'knowledge-base' }" 
          @click="activeTab = 'knowledge-base'"
        >
          知识库问答
        </button>
        <button 
          :class="{ active: activeTab === 'email' }" 
          @click="activeTab = 'email'"
        >
          邮件发送
        </button>
      </nav>
      <div class="app-content">
        <KnowledgeBase v-if="activeTab === 'knowledge-base'" />
        <Email v-if="activeTab === 'email'" />
      </div>
    </main>
    <footer class="app-footer">
      <p>© 2026 私有知识库问答系统</p>
    </footer>
  </div>
</template>

<script>
// 导入知识库组件
import KnowledgeBase from './components/KnowledgeBase.vue'
// 导入邮件组件
import Email from './components/Email.vue'

export default {
  name: 'App',
  components: {
    KnowledgeBase,
    Email
  },
  data() {
    return {
      // 当前激活的标签页
      activeTab: 'knowledge-base'
    }
  }
}
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

/* 应用容器 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 应用头部 */
.app-header {
  background-color: #4CAF50;
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 应用主体 */
.app-main {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 1rem;
  gap: 1rem;
}

/* 导航栏 */
.app-nav {
  flex: 0 0 200px;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-nav button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: none;
  border-radius: 4px;
  background-color: #f0f0f0;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.app-nav button:hover {
  background-color: #e0e0e0;
}

.app-nav button.active {
  background-color: #4CAF50;
  color: white;
}

/* 内容区域 */
.app-content {
  flex: 1;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 应用底部 */
.app-footer {
  background-color: #333;
  color: white;
  padding: 1rem;
  text-align: center;
  margin-top: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-main {
    flex-direction: column;
  }
  
  .app-nav {
    flex: 0 0 auto;
    display: flex;
    gap: 0.5rem;
  }
  
  .app-nav button {
    flex: 1;
    margin-bottom: 0;
  }
}
</style>