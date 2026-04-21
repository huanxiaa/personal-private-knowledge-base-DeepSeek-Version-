// 导入Module装饰器，用于定义模块
import { Module } from '@nestjs/common';
// 导入ConfigModule，用于管理配置
import { ConfigModule } from '@nestjs/config';
// 导入MailerModule，用于发送邮件
// import { MailerModule } from '@nestjs/mailer';
// 导入AppController，应用的控制器
import { AppController } from './app.controller';
// 导入AppService，应用的服务
import { AppService } from './app.service';
// 导入KnowledgeBaseModule，知识库模块
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
// 导入EmailModule，邮件模块
import { EmailModule } from './email/email.module';

// 定义AppModule模块
@Module({
  // 导入其他模块
  imports: [
    // 配置模块，加载环境变量
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
    }),
    // 邮件模块配置
    // MailerModule.forRoot({
    //   transport: {
    //     service: 'Gmail', // 邮件服务提供商
    //     auth: {
    //       user: process.env.EMAIL_USER, // 邮箱用户名
    //       pass: process.env.EMAIL_PASS, // 邮箱密码或授权码
    //     },
    //   },
    //   defaults: {
    //     from: process.env.EMAIL_USER, // 默认发件人
    //   },
    // }),
    // 知识库模块
    KnowledgeBaseModule,
    // 邮件模块
    EmailModule,
  ],
  // 控制器
  controllers: [AppController],
  // 服务
  providers: [AppService],
})
// 导出AppModule类
export class AppModule {}