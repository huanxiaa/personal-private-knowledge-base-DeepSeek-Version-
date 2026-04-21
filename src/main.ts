// 导入NestFactory，用于创建NestJS应用实例
import { NestFactory } from '@nestjs/core';
// 导入AppModule，应用的根模块
import { AppModule } from './app.module';

// 定义异步函数bootstrap，用于启动应用
async function bootstrap() {
  // 创建NestJS应用实例，传入AppModule
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS，允许跨域请求
  app.enableCors();
  
  // 监听3000端口
  await app.listen(3000);
  
  // 输出启动信息
  console.log('Application is running on: http://localhost:3000');
}

// 调用bootstrap函数启动应用
bootstrap();