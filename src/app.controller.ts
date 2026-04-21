// 导入Controller和Get装饰器，用于定义控制器和GET请求
import { Controller, Get } from '@nestjs/common';
// 导入AppService，用于处理业务逻辑
import { AppService } from './app.service';

// 定义AppController控制器，处理根路径的请求
@Controller()
export class AppController {
  // 构造函数，注入AppService
  constructor(private readonly appService: AppService) {}

  // 处理GET /请求，返回应用状态
  @Get()
getHello(): string {
    // 调用AppService的getHello方法
    return this.appService.getHello();
  }
}