import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { AlertsService } from './alerts.service';
import { DashboardFiltrosDto } from './dto/analytics.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly alertsService: AlertsService
  ) {}

  @Get('dashboard')
  async getDashboard(@Query() filtros: DashboardFiltrosDto, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.analyticsService.getDashboardResumo(companyId, filtros);
  }

  @Get('vendas')
  async getVendasMetrics(@Query() filtros: DashboardFiltrosDto, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.analyticsService.getVendasMetrics(companyId, filtros);
  }

  @Get('pipeline')
  async getPipelineValue(@Query() filtros: DashboardFiltrosDto, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.analyticsService.getPipelineValue(companyId, filtros);
  }

  @Get('funil/:funnelId/conversao')
  async getFunnelConversao(
    @Param('funnelId') funnelId: string,
    @Query() filtros: { startDate?: string; endDate?: string },
    @Req() req: any
  ) {
    const companyId = req.user.companyId;
    const dateRange = filtros.startDate && filtros.endDate ? {
      startDate: filtros.startDate,
      endDate: filtros.endDate,
    } : undefined;
    return this.analyticsService.getConversaoFunil(funnelId, companyId, dateRange);
  }

  @Get('performance-equipe')
  async getPerformanceEquipe(
    @Query() filtros: { startDate?: string; endDate?: string },
    @Req() req: any
  ) {
    const companyId = req.user.companyId;
    const dateRange = filtros.startDate && filtros.endDate ? {
      startDate: filtros.startDate,
      endDate: filtros.endDate,
    } : undefined;
    return this.analyticsService.getPerformanceEquipe(companyId, dateRange);
  }

  @Get('origem-leads')
  async getOrigemLeads(
    @Query() filtros: { startDate?: string; endDate?: string },
    @Req() req: any
  ) {
    const companyId = req.user.companyId;
    const dateRange = filtros.startDate && filtros.endDate ? {
      startDate: filtros.startDate,
      endDate: filtros.endDate,
    } : undefined;
    return this.analyticsService.getOrigemLeads(companyId, dateRange);
  }

  @Get('procedimentos')
  async getAnalyseProcedimentos(
    @Query() filtros: { startDate?: string; endDate?: string },
    @Req() req: any
  ) {
    const companyId = req.user.companyId;
    const dateRange = filtros.startDate && filtros.endDate ? {
      startDate: filtros.startDate,
      endDate: filtros.endDate,
    } : undefined;
    return this.analyticsService.getAnalyseProcedimentos(companyId, dateRange);
  }

  @Get('stats')
  async getGeneralStats(@Req() req: any) {
    const companyId = req.user.companyId;

    // Estatísticas gerais rápidas
    const [totalLeads, totalFunnels, totalUsers] = await Promise.all([
      this.analyticsService['prisma'].lead.count({ where: { companyId } }),
      this.analyticsService['prisma'].funnel.count({ where: { companyId } }),
      this.analyticsService['prisma'].user.count({ where: { companyId } }),
    ]);

    return {
      totalLeads,
      totalFunnels,
      totalUsers,
    };
  }

  @Get('top-performers')
  async getTopPerformers(@Req() req: any) {
    const companyId = req.user.companyId;

    // Top 5 usuários por conversão
    const usuarios = await this.analyticsService['prisma'].user.findMany({
      where: { companyId },
      include: {
        leads: {
          select: {
            statusVenda: true,
            valorVenda: true,
          },
        },
      },
    });

    const topPerformers = usuarios
      .map(user => {
        const totalLeads = user.leads.length;
        const convertidos = user.leads.filter(lead => lead.statusVenda === 'GANHO').length;
        const receita = user.leads
          .filter(lead => lead.statusVenda === 'GANHO')
          .reduce((sum, lead) => sum + (Number(lead.valorVenda) || 0), 0);

        return {
          userId: user.id,
          name: user.name,
          totalLeads,
          convertidos,
          taxaConversao: totalLeads > 0 ? (convertidos / totalLeads) * 100 : 0,
          receita,
        };
      })
      .sort((a, b) => b.taxaConversao - a.taxaConversao)
      .slice(0, 5);

    return topPerformers;
  }

  @Get('recent-activity')
  async getRecentActivity(@Req() req: any) {
    const companyId = req.user.companyId;

    // Atividades recentes
    const recentLeads = await this.analyticsService['prisma'].lead.findMany({
      where: { companyId },
      include: {
        responsible: { select: { name: true } },
        funnel: { select: { name: true } },
        step: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    const recentTasks = await this.analyticsService['prisma'].task.findMany({
      where: { companyId },
      include: {
        assigned: { select: { name: true } },
        lead: { select: { name: true, phone: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return {
      recentLeads: recentLeads.map(lead => ({
        id: lead.id,
        name: lead.name || lead.phone,
        responsibleName: lead.responsible?.name || 'Não atribuído',
        funnelName: lead.funnel.name,
        stepName: lead.step.name,
        statusVenda: lead.statusVenda,
        updatedAt: lead.updatedAt,
      })),
      recentTasks: recentTasks.map(task => ({
        id: task.id,
        title: task.title,
        assignedName: task.assigned.name,
        leadName: task.lead.name || task.lead.phone,
        status: task.status,
        dueDate: task.dueDate,
        updatedAt: task.updatedAt,
      })),
    };
  }

  @Get('alerts')
  async getAlerts(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.alertsService.getCompanyAlerts(companyId);
  }

  @Get('alerts/summary')
  async getAlertsSummary(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.alertsService.getAlertsSummary(companyId);
  }

  @Get('conversao-universal')
  async getConversaoUniversal(
    @Query() filtros: { startDate?: string; endDate?: string },
    @Req() req: any
  ) {
    const companyId = req.user.companyId;
    const dateRange = filtros.startDate && filtros.endDate ? {
      startDate: filtros.startDate,
      endDate: filtros.endDate,
    } : undefined;
    return this.analyticsService.getConversaoUniversal(companyId, dateRange);
  }

  @Get('receita-diaria')
  async getReceitaDiaria(
    @Query() filtros: { startDate?: string; endDate?: string },
    @Req() req: any
  ) {
    const companyId = req.user.companyId;
    const dateRange = filtros.startDate && filtros.endDate ? {
      startDate: filtros.startDate,
      endDate: filtros.endDate,
    } : undefined;
    return this.analyticsService.getReceitaDiaria(companyId, dateRange);
  }
}