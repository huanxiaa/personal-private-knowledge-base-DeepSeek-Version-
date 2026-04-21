// 导入Controller、Post、Body、Get等装饰器，用于定义控制器和HTTP请求
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
// 导入KnowledgeBaseService和ConversationMessage，用于处理知识库业务逻辑
import { KnowledgeBaseService, ConversationMessage } from './knowledge-base.service';

// 定义KnowledgeBaseController控制器，处理知识库相关的请求
@Controller('knowledge-base')
export class KnowledgeBaseController {
  // 构造函数，注入KnowledgeBaseService
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  // 处理POST /api/knowledge-base/add-document请求，添加文档到知识库
  @Post('add-document')
  async addDocument(
    // 从请求体中获取文档内容和元数据
    @Body('content') content: string,
    @Body('metadata') metadata?: any,
  ) {
    // 调用KnowledgeBaseService的addDocument方法
    return this.knowledgeBaseService.addDocument(content, metadata);
  }

  // 处理POST /api/knowledge-base/ask请求，从知识库中检索并回答问题
  @Post('ask')
  async askQuestion(
    // 从请求体中获取问题和对话ID
    @Body('question') question: string,
    @Body('conversationId') conversationId: string = 'default',
  ) {
    // 调用KnowledgeBaseService的askQuestion方法
    return this.knowledgeBaseService.askQuestion(question, conversationId);
  }

  // 处理POST /api/knowledge-base/create-conversation请求，创建新对话
  @Post('create-conversation')
  async createConversation() {
    // 调用KnowledgeBaseService的createNewConversation方法
    return {
      success: true,
      conversationId: this.knowledgeBaseService.createNewConversation(),
    };
  }

  // 处理DELETE /api/knowledge-base/delete-conversation请求，删除对话
  @Post('delete-conversation')
  async deleteConversation(
    // 从请求体中获取对话ID
    @Body('conversationId') conversationId: string,
  ) {
    // 调用KnowledgeBaseService的deleteConversation方法
    const success = this.knowledgeBaseService.deleteConversation(conversationId);
    return {
      success,
      message: success ? '对话删除成功' : '对话不存在',
    };
  }

  // 处理GET /api/knowledge-base/conversations请求，获取所有对话
  @Get('conversations')
  async getAllConversations() {
    // 调用KnowledgeBaseService的getAllConversations方法
    return {
      success: true,
      conversations: this.knowledgeBaseService.getAllConversations(),
    };
  }

  // 处理GET /api/knowledge-base/conversation-history请求，获取对话历史
  @Get('conversation-history')
  async getConversationHistory(
    // 从查询参数中获取对话ID
    @Query('conversationId') conversationId: string,
  ) {
    // 调用KnowledgeBaseService的getConversationHistory方法
    return {
      success: true,
      history: this.knowledgeBaseService.getConversationHistory(conversationId),
    };
  }

  // 处理GET /api/knowledge-base/deepseek-account请求，获取DeepSeek账户信息
  @Get('deepseek-account')
  async getDeepSeekAccountInfo() {
    // 调用KnowledgeBaseService的getDeepSeekAccountInfo方法
    return this.knowledgeBaseService.getDeepSeekAccountInfo();
  }

  // 处理POST /api/knowledge-base/ask-deepseek请求，使用DeepSeek API回答问题
  @Post('ask-deepseek')
  async askQuestionWithDeepSeek(
    // 从请求体中获取问题
    @Body('question') question: string,
  ) {
    // 调用KnowledgeBaseService的askQuestionWithDeepSeek方法
    return this.knowledgeBaseService.askQuestionWithDeepSeek(question);
  }
}