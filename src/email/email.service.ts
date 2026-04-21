// 导入Injectable装饰器，用于定义服务
import { Injectable } from '@nestjs/common';
// 导入nodemailer，用于发送邮件
import * as nodemailer from 'nodemailer';

// 定义EmailService服务
@Injectable()
export class EmailService {
  // 创建邮件传输器
  private transporter = nodemailer.createTransport({
      host: 'smtp.qq.com', // ✅ 腾讯邮箱服务器
      port: 465,           // SSL端口
      secure: true,        // 使用SSL
      auth: {
        user: process.env.EMAIL_USER, // QQ邮箱：123456@qq.com
        pass: process.env.EMAIL_PASS, // ⚠️ 必须是QQ邮箱的"授权码"
      },
    });

  // 发送邮件方法
  async sendEmail(to: string, subject: string, content: string) {
    try {
      console.log('发送邮件:',process.env.EMAIL_USER);
      // 使用nodemailer发送邮件
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER, // 发件人
        to, // 收件人
        subject, // 邮件主题
        html: content, // 邮件内容（HTML格式）
      });
      return { success: true, message: '邮件发送成功' };
    } catch (error) {
      console.error('邮件发送失败:', error);
      return { success: false, message: '邮件发送失败' };
    }
  }

  // 发送知识库问答结果邮件
  async sendKnowledgeBaseAnswer(to: string, question: string, answer: string) {
    try {
      // 构建邮件内容
      const content = `
        <h1>知识库问答结果</h1>
        <p><strong>问题:</strong> ${question}</p>
        <p><strong>回答:</strong> ${answer}</p>
        <p>此邮件由私有知识库系统自动发送。</p>
      `;

      // 发送邮件
      await this.sendEmail(to, '知识库问答结果', content);
      return { success: true, message: '问答结果邮件发送成功' };
    } catch (error) {
      console.error('发送问答结果邮件失败:', error);
      return { success: false, message: '发送问答结果邮件失败' };
    }
  }
}