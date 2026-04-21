// 导入Controller、Post、Body装饰器，用于定义控制器和POST请求
import { Controller, Post, Body } from '@nestjs/common';
// 导入EmailService，用于处理邮件业务逻辑
import { EmailService } from './email.service';

// 定义EmailController控制器，处理邮件相关的请求
@Controller('email')
export class EmailController {
  // 构造函数，注入EmailService
  constructor(private readonly emailService: EmailService) {}

  // 处理POST /api/email/send请求，发送邮件
  @Post('send')
  async sendEmail(
    // 从请求体中获取收件人、主题和内容
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('content') content: string,
  ) {
    // 调用EmailService的sendEmail方法
    return this.emailService.sendEmail(to, subject, content);
  }

  // 处理POST /api/email/send-answer请求，发送知识库问答结果邮件
  @Post('send-answer')
  async sendKnowledgeBaseAnswer(
    // 从请求体中获取收件人、问题和回答
    @Body('to') to: string,
    @Body('question') question: string,
    @Body('answer') answer: string,
  ) {
    // 调用EmailService的sendKnowledgeBaseAnswer方法
    return this.emailService.sendKnowledgeBaseAnswer(to, question, answer);
  }
}