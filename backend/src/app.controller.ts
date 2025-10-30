import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { FUNNEL_TEMPLATES } from './modules/crm/templates/funnel-templates';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  getTest(): object {
    return { 
      status: 'OK', 
      message: 'Backend funcionando!', 
      timestamp: new Date().toISOString() 
    };
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }

  @Get('funnel-templates')
  getFunnelTemplates() {
    return {
      message: 'Templates de funil disponíveis',
      count: FUNNEL_TEMPLATES.length,
      templates: FUNNEL_TEMPLATES.map(t => ({
        name: t.name,
        description: t.description,
        stepsCount: t.steps.length,
        steps: t.steps.map(s => ({
          name: s.name,
          tipoEtapa: s.tipoEtapa,
          cor: s.corEtapa,
          icone: s.iconEtapa
        }))
      }))
    };
  }
}
