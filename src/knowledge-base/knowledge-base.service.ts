// 导入Injectable装饰器，用于定义服务
import { Injectable } from '@nestjs/common';

// 导入Document类
import { Document } from 'langchain/document';
// 导入Embeddings基类
import { Embeddings } from '@langchain/core/embeddings';
// 导入文件系统模块
import * as fs from 'fs';
import * as path from 'path';

// 自定义简单向量存储，使用本地文件存储
class SimpleVectorStore {
  private documents: Document[] = [];
  private embeddings: number[][] = [];
  private embeddingsService: Embeddings;
  private storagePath: string;

  constructor(embeddings: Embeddings, storagePath: string = './vector-store-data') {
    this.embeddingsService = embeddings;
    this.storagePath = storagePath;
    // 确保存储目录存在
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
    // 加载存储的数据
    this.loadFromDisk();
  }

  // 添加文档
  async addDocuments(documents: Document[]): Promise<string[]> {
    const texts = documents.map(doc => doc.pageContent);
    const newEmbeddings = await this.embeddingsService.embedDocuments(texts);
    
    this.documents.push(...documents);
    this.embeddings.push(...newEmbeddings);
    
    // 保存到磁盘
    this.saveToDisk();
    
    return documents.map((_, index) => (this.documents.length - documents.length + index).toString());
  }

  // 相似性搜索
  async similaritySearch(query: string, k: number = 3): Promise<Document[]> {
    const queryEmbedding = await this.embeddingsService.embedQuery(query);
    
    // 计算余弦相似度
    const similarities = this.embeddings.map((embedding, index) => {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      return { index, similarity };
    });
    
    // 按相似度排序
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // 取前k个结果，确保只返回有效的Document对象
    const topK = similarities.slice(0, k);
    return topK
      .map(item => this.documents[item.index])
      .filter((doc): doc is Document => doc !== undefined);
  }

  // 计算余弦相似度
  private cosineSimilarity(a: number[], b: number[]): number {
    // 确保向量长度相同
    const minLength = Math.min(a.length, b.length);
    const dotProduct = a.slice(0, minLength).reduce((sum, a_i, i) => sum + a_i * b[i], 0);
    const normA = Math.sqrt(a.slice(0, minLength).reduce((sum, a_i) => sum + a_i * a_i, 0));
    const normB = Math.sqrt(b.slice(0, minLength).reduce((sum, b_i) => sum + b_i * b_i, 0));
    
    // 避免除以零
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }

  // 保存到磁盘
  private saveToDisk() {
    const data = {
      documents: this.documents,
      embeddings: this.embeddings
    };
    fs.writeFileSync(
      path.join(this.storagePath, 'vector-store.json'),
      JSON.stringify(data, null, 2)
    );
  }

  // 从磁盘加载
  private loadFromDisk() {
    const filePath = path.join(this.storagePath, 'vector-store.json');
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        // 确保documents数组存在且每个文档都有pageContent属性
        if (Array.isArray(data.documents)) {
          this.documents = data.documents
            .filter((doc: any) => doc && typeof doc.pageContent === 'string')
            .map((doc: any) => new Document(doc));
        } else {
          this.documents = [];
        }
        // 确保embeddings数组存在
        this.embeddings = Array.isArray(data.embeddings) ? data.embeddings : [];
      } catch (error) {
        console.error('加载向量存储数据失败:', error);
        // 加载失败时重置数据
        this.documents = [];
        this.embeddings = [];
      }
    }
  }
}

// 自定义嵌入类，使用基于词频的嵌入
class SimpleEmbeddings extends Embeddings {
  // 实现embedDocuments方法
  async embedDocuments(documents: string[]): Promise<number[][]> {
    return documents.map(doc => this.generateEmbedding(doc));
  }

  // 实现embedQuery方法
  async embedQuery(document: string): Promise<number[]> {
    return this.generateEmbedding(document);
  }

  // 生成嵌入向量
  private generateEmbedding(text: string): number[] {
    // 简单的基于词频的嵌入
    const words = text.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    
    // 计算一些简单的特征
    const avgWordLength = wordCount > 0 ? words.reduce((sum, word) => sum + word.length, 0) / wordCount : 0;
    const uniqueWords = new Set(words).size;
    const uniqueRatio = wordCount > 0 ? uniqueWords / wordCount : 0;
    
    // 计算关键词频率
    const keywords = ['知识', '文档', '问题', '回答', '系统', '功能', '用户', '数据', '信息', '服务'];
    const keywordCount = keywords.reduce((count, keyword) => {
      return count + (text.toLowerCase().includes(keyword) ? 1 : 0);
    }, 0);
    const keywordRatio = keywordCount / keywords.length;
    
    // 返回4维嵌入向量
    return [
      avgWordLength / 10,  // 平均词长
      uniqueRatio,          // 词的唯一性比例
      wordCount / 100,      // 文本长度
      keywordRatio          // 关键词覆盖率
    ];
  }
}

// 定义对话历史接口
export interface ConversationMessage {
  question: string;
  answer: string;
  timestamp: number;
}

// 定义KnowledgeBaseService服务
@Injectable()
export class KnowledgeBaseService {
  // 向量数据库实例
  private vectorStore: SimpleVectorStore | null = null;
  // 初始化状态
  private initialized = false;
  // 对话历史，使用Map存储，键为对话ID，值为对话消息数组
  private conversations: Map<string, ConversationMessage[]> = new Map();
  // 对话历史长度限制
  private readonly MAX_HISTORY_LENGTH = 10;

  // 构造函数，初始化知识库
  constructor() {
    // 异步初始化向量数据库
    this.initializeVectorStore();
  }

  // 创建新对话
  createNewConversation(): string {
    // 生成唯一对话ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // 初始化对话历史
    this.conversations.set(conversationId, []);
    return conversationId;
  }

  // 删除对话
  deleteConversation(conversationId: string): boolean {
    return this.conversations.delete(conversationId);
  }

  // 获取所有对话ID
  getAllConversations(): string[] {
    return Array.from(this.conversations.keys());
  }

  // 获取对话历史
  getConversationHistory(conversationId: string): ConversationMessage[] {
    return this.conversations.get(conversationId) || [];
  }

  // 初始化向量数据库
  private async initializeVectorStore() {
    try {
      // 检查是否已经初始化
      if (this.initialized) {
        return;
      }

      // 创建简单嵌入实例
      const embeddings = new SimpleEmbeddings({});

      // 创建简单向量存储实例，使用本地存储
      this.vectorStore = new SimpleVectorStore(embeddings, './vector-store-data');

      // 如果没有数据，添加示例文档
      if (this.vectorStore['documents']?.length === 0) {
        await this.vectorStore.addDocuments([
          new Document({
            pageContent: '这是一个示例文档，用于测试知识库功能。',
            metadata: { source: 'example' },
          }),
        ]);
      }

      this.initialized = true;
      console.log('向量数据库初始化成功');
    } catch (error) {
      console.error('向量数据库初始化失败:', error);
      this.initialized = true; // 即使失败也标记为已初始化，避免重复尝试
    }
  }

  // 确保初始化完成
  private async ensureInitialized() {
    // 等待初始化完成
    while (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // 添加文档到知识库
  async addDocument(content: string, metadata?: any) {
    try {
      // 确保初始化完成
      await this.ensureInitialized();

      // 检查向量数据库是否初始化
      if (!this.vectorStore) {
        return { success: false, message: '向量数据库未初始化' };
      }

      // 创建文档实例
      const document = new Document({
        pageContent: content,
        metadata: metadata || { source: 'user' },
      });

      // 添加文档到向量数据库
      await this.vectorStore.addDocuments([document]);
      return { success: true, message: '文档添加成功' };
    } catch (error) {
      console.error('添加文档失败:', error);
      return { success: false, message: '文档添加失败' };
    }
  }

  // 从知识库中检索并使用LLM生成回答
  async askQuestion(question: string, conversationId: string = 'default') {
    try {
      // 确保初始化完成
      await this.ensureInitialized();

      // 检查向量数据库是否初始化
      if (!this.vectorStore) {
        return { success: false, message: '向量数据库未初始化' };
      }

      // 确保对话存在
      if (!this.conversations.has(conversationId)) {
        this.conversations.set(conversationId, []);
      }

      // 使用向量数据库进行相似性搜索，获取多个相关文档
      const results = await this.vectorStore.similaritySearch(question);

      if (results.length > 0) {
        // 检查是否配置了DeepSeek API密钥
        if (process.env.DEEPSEEK_API_KEY) {
          // 构建上下文
          const context = results.map((doc, index) => `文档 ${index + 1}: ${doc.pageContent}`).join('\n\n');
          
          // 获取对话历史
          const conversationHistory = this.conversations.get(conversationId) || [];
          
          // 构建对话历史字符串
          const historyString = conversationHistory.map(item => 
            `用户: ${item.question}\n助手: ${item.answer}`
          ).join('\n\n');
          
          // 构建提示词，包含对话历史
          const prompt = `你是一个基于知识库的问答助手，只能基于提供的上下文回答问题，不能使用上下文之外的信息。\n\n上下文：\n${context}\n\n对话历史：\n${historyString}\n\n最新问题：${question}\n\n请基于上下文和对话历史回答问题，不要添加任何上下文之外的信息：`;
          console.log(prompt,'查看上下文');
          
          // 调用DeepSeek API
          const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 1.3,
              max_tokens: 1000,
            }),
          });

          // 解析响应
          const data = await response.json();

          if (response.ok) {
            const answer = data.choices[0].message.content;
            
            // 提取token使用量
            const usage = data.usage || {};
            
            // 获取账户信息
            const accountInfoResponse = await this.getDeepSeekAccountInfo();
            const accountInfo = accountInfoResponse.success ? accountInfoResponse.accountInfo : null;
            
            // 更新对话历史
            this.updateConversationHistory(conversationId, question, answer);
            
            // 将回答内容添加到向量数据库中
            const answerDocument = new Document({
              pageContent: answer,
              metadata: { 
                source: 'deepseek-answer',
                question: question,
                timestamp: Date.now()
              },
            });
            await this.vectorStore.addDocuments([answerDocument]);
            
            return {
              success: true,
              answer,
              usage: {
                prompt_tokens: usage.prompt_tokens || 0,
                completion_tokens: usage.completion_tokens || 0,
                total_tokens: usage.total_tokens || 0,
              },
              accountInfo,
            };
          } else {
            console.error('DeepSeek API调用失败:', data);
            // 如果API调用失败，回退到直接返回文档内容
            const answer = `基于知识库回答: ${results[0].pageContent}`;
            
            // 更新对话历史
            this.updateConversationHistory(conversationId, question, answer);
            
            return {
              success: true,
              answer,
            };
          }
        } else {
          // 如果没有配置API密钥，直接返回文档内容
          const answer = `基于知识库回答: ${results[0].pageContent}`;
          
          // 更新对话历史
          this.updateConversationHistory(conversationId, question, answer);
          
          return {
            success: true,
            answer,
          };
        }
      } else {
        const answer = '知识库中没有找到相关信息。';
        
        // 更新对话历史
        this.updateConversationHistory(conversationId, question, answer);
        
        return {
          success: true,
          answer,
        };
      }
    } catch (error) {
      console.error('回答问题失败:', error);
      return { success: false, message: '回答问题失败' };
    }
  }

  // 更新对话历史
  private updateConversationHistory(conversationId: string, question: string, answer: string) {
    const conversationHistory = this.conversations.get(conversationId) || [];
    
    // 添加新消息
    conversationHistory.push({
      question,
      answer,
      timestamp: Date.now(),
    });
    
    // 限制对话历史长度
    if (conversationHistory.length > this.MAX_HISTORY_LENGTH) {
      conversationHistory.shift(); // 移除最早的消息
    }
    
    // 更新对话历史
    this.conversations.set(conversationId, conversationHistory);
  }

  // 获取DeepSeek账户信息
  async getDeepSeekAccountInfo() {
    try {
      // 检查是否配置了DeepSeek API密钥
      if (!process.env.DEEPSEEK_API_KEY) {
        return {
          success: false,
          message: 'DeepSeek API密钥未配置',
        };
      }

      // 调用DeepSeek API获取账户信息
      // 注意：这里的API端点可能需要根据DeepSeek的实际API文档进行调整
      const response = await fetch('https://api.deepseek.com/user/balance', {
        method: 'GET',
        headers: {
           'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      });

      // 解析响应
      const data = await response.json();
      console.log(data,'chak');

      // 检查响应是否成功
      if (!response.ok) {
        console.error('获取DeepSeek账户信息失败:', data);
        return {
          success: false,
          message: `获取DeepSeek账户信息失败: ${data.error?.message || '未知错误'}`,
        };
      }

      // 返回账户信息
      return {
        success: true,
        accountInfo: data.balance_infos,
      };
    } catch (error) {
      console.error('获取DeepSeek账户信息失败:', error);
      return { success: false, message: '获取DeepSeek账户信息失败' };
    }
  }

  // 预留DeepSeek API接口
  async askQuestionWithDeepSeek(question: string) {
    try {
      // 检查是否配置了DeepSeek API密钥
      if (!process.env.DEEPSEEK_API_KEY) {
        return {
          success: false,
          message: 'DeepSeek API密钥未配置',
        };
      }

      // 实际调用DeepSeek API
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: question,
            },
          ],
          temperature: 1.3,
          max_tokens: 1000,
        }),
      });

      // 解析响应
      const data = await response.json();

      // 检查响应是否成功
      if (!response.ok) {
        console.error('DeepSeek API调用失败:', data);
        return {
          success: false,
          message: `DeepSeek API调用失败: ${data.error?.message || '未知错误'}`,
        };
      }

      // 提取token使用量
      const usage = data.usage || {};

      // 获取账户信息
      const accountInfoResponse = await this.getDeepSeekAccountInfo();
      const accountInfo = accountInfoResponse.success ? accountInfoResponse.accountInfo : null;

      // 将回答内容添加到向量数据库中
      const answer = data.choices[0].message.content;
      const answerDocument = new Document({
        pageContent: answer,
        metadata: { 
          source: 'deepseek-answer',
          question: question,
          timestamp: Date.now()
        },
      });
      await this.vectorStore.addDocuments([answerDocument]);

      // 返回DeepSeek API的回答、token使用量和账户信息
      return {
        success: true,
        answer,
        message: 'DeepSeek API调用成功',
        usage: {
          prompt_tokens: usage.prompt_tokens || 0,
          completion_tokens: usage.completion_tokens || 0,
          total_tokens: usage.total_tokens || 0,
        },
        accountInfo,
      };
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      return { success: false, message: 'DeepSeek API调用失败' };
    }
  }
}