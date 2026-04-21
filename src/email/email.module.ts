// 导入Module装饰器，用于定义模块
import { Module } from '@nestjs/common';
// 导入EmailController，邮件控制器
import { EmailController } from './email.controller';
// 导入EmailService，邮件服务
import { EmailService } from './email.service';

// 定义EmailModule模块
@Module({
  // 控制器
  controllers: [EmailController],
  // 服务
  providers: [EmailService],
  // 导出服务，供其他模块使用
  exports: [EmailService],
})
// 导出EmailModule类
export class EmailModule {}