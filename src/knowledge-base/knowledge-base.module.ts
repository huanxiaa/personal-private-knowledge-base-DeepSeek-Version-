// 导入Module装饰器，用于定义模块
import { Module } from '@nestjs/common';
// 导入KnowledgeBaseController，知识库控制器
import { KnowledgeBaseController } from './knowledge-base.controller';
// 导入KnowledgeBaseService，知识库服务
import { KnowledgeBaseService } from './knowledge-base.service';

// 定义KnowledgeBaseModule模块
@Module({
  // 控制器
  controllers: [KnowledgeBaseController],
  // 服务
  providers: [KnowledgeBaseService],
  // 导出服务，供其他模块使用
  exports: [KnowledgeBaseService],
})
// 导出KnowledgeBaseModule类
export class KnowledgeBaseModule {}