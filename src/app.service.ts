// 导入Injectable装饰器，用于定义服务
import { Injectable } from '@nestjs/common';

// 定义AppService服务
@Injectable()
export class AppService {
  // getHello方法，返回应用状态信息
  getHello(): string {
    return 'Private Knowledge Base Q&A System is running!';
  }
}