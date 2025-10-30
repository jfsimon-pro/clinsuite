import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar empresa de teste
  const company = await prisma.company.upsert({
    where: { cnpj: '12345678000199' },
    update: {},
    create: {
      name: 'Clínica Ianara Pinho',
      cnpj: '12345678000199',
      logoUrl: null,
      primaryColor: '#3b82f6',
    },
  });

  console.log('✅ Empresa criada:', company.name);

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ianara.com' },
    update: {},
    create: {
      email: 'admin@ianara.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  console.log('✅ Admin criado:', admin.email);

  // Criar usuário worker
  const workerPassword = await bcrypt.hash('worker123', 10);
  const worker = await prisma.user.upsert({
    where: { email: 'worker@ianara.com' },
    update: {},
    create: {
      email: 'worker@ianara.com',
      password: workerPassword,
      name: 'Funcionário',
      role: 'WORKER',
      companyId: company.id,
    },
  });

  console.log('✅ Worker criado:', worker.email);

  // Criar funil de exemplo
  const funnel = await prisma.funnel.upsert({
    where: { id: 'funnel-seed-id' },
    update: {},
    create: {
      id: 'funnel-seed-id',
      name: 'Captação Ortodontia',
      companyId: company.id,
    },
  });

  console.log('✅ Funil criado:', funnel.name);

  // Criar etapas do funil
  const steps = await Promise.all([
    prisma.funnelStep.upsert({
      where: { id: 'step-1-id' },
      update: {},
      create: {
        id: 'step-1-id',
        name: 'Lead Novo',
        order: 1,
        funnelId: funnel.id,
        tipoConceitual: 'CAPTACAO',
      },
    }),
    prisma.funnelStep.upsert({
      where: { id: 'step-2-id' },
      update: {},
      create: {
        id: 'step-2-id',
        name: 'Primeiro Contato',
        order: 2,
        funnelId: funnel.id,
        tipoConceitual: 'QUALIFICACAO',
      },
    }),
    prisma.funnelStep.upsert({
      where: { id: 'step-3-id' },
      update: {},
      create: {
        id: 'step-3-id',
        name: 'Agendamento',
        order: 3,
        funnelId: funnel.id,
        tipoConceitual: 'APRESENTACAO',
      },
    }),
    prisma.funnelStep.upsert({
      where: { id: 'step-4-id' },
      update: {},
      create: {
        id: 'step-4-id',
        name: 'Consulta Realizada',
        order: 4,
        funnelId: funnel.id,
        tipoConceitual: 'FECHAMENTO',
      },
    }),
  ]);

  console.log('✅ Etapas criadas:', steps.length);

  // Criar regras de tarefas para a etapa "Primeiro Contato"
  const taskRules = await Promise.all([
    prisma.stageTaskRule.upsert({
      where: { id: 'task-rule-1-id' },
      update: {},
      create: {
        id: 'task-rule-1-id',
        stepId: steps[1].id, // Primeiro Contato
        name: 'Ligar para o lead',
        description: 'Fazer primeiro contato telefônico com o lead para entender a necessidade',
        order: 1,
        delayDays: 1,
        delayType: 'ABSOLUTE',
        assignType: 'LEAD_OWNER',
        companyId: company.id,
      },
    }),
    prisma.stageTaskRule.upsert({
      where: { id: 'task-rule-2-id' },
      update: {},
      create: {
        id: 'task-rule-2-id',
        stepId: steps[1].id, // Primeiro Contato
        name: 'Enviar orçamento',
        description: 'Enviar orçamento detalhado via WhatsApp com valores e formas de pagamento',
        order: 2,
        delayDays: 1,
        delayType: 'AFTER_PREVIOUS',
        assignType: 'LEAD_OWNER',
        companyId: company.id,
      },
    }),
  ]);

  console.log('✅ Regras de tarefas criadas:', taskRules.length);

  // Criar regras de tarefas para a etapa "Agendamento"
  const agendamentoTaskRules = await Promise.all([
    prisma.stageTaskRule.upsert({
      where: { id: 'task-rule-3-id' },
      update: {},
      create: {
        id: 'task-rule-3-id',
        stepId: steps[2].id, // Agendamento
        name: 'Confirmar agendamento',
        description: 'Ligar para confirmar data e horário da consulta com o paciente',
        order: 1,
        delayDays: 1,
        delayType: 'ABSOLUTE',
        assignType: 'FIXED_USER',
        assignedUserId: worker.id,
        companyId: company.id,
      },
    }),
    prisma.stageTaskRule.upsert({
      where: { id: 'task-rule-4-id' },
      update: {},
      create: {
        id: 'task-rule-4-id',
        stepId: steps[2].id, // Agendamento
        name: 'Enviar lembrete 1 dia antes',
        description: 'Enviar mensagem de lembrete da consulta via WhatsApp',
        order: 2,
        delayDays: 2,
        delayType: 'AFTER_PREVIOUS',
        assignType: 'FIXED_USER',
        assignedUserId: worker.id,
        companyId: company.id,
      },
    }),
  ]);

  console.log('✅ Regras de agendamento criadas:', agendamentoTaskRules.length);

  // Criar alguns leads de exemplo
  const leads = await Promise.all([
    prisma.lead.upsert({
      where: { id: 'lead-1-id' },
      update: {},
      create: {
        id: 'lead-1-id',
        phone: '11999887766',
        name: 'Maria Silva',
        funnelId: funnel.id,
        stepId: steps[0].id, // Lead Novo
        responsibleId: worker.id,
        companyId: company.id,
        tipoProcura: 'ORTODONTIA',
        meioCaptacao: 'WHATSAPP',
      },
    }),
    prisma.lead.upsert({
      where: { id: 'lead-2-id' },
      update: {},
      create: {
        id: 'lead-2-id',
        phone: '11988776655',
        name: 'João Santos',
        funnelId: funnel.id,
        stepId: steps[1].id, // Primeiro Contato
        responsibleId: worker.id,
        companyId: company.id,
        tipoProcura: 'IMPLANTE',
        meioCaptacao: 'INSTAGRAM',
      },
    }),
  ]);

  console.log('✅ Leads criados:', leads.length);

  // Criar tarefas de exemplo para o lead no "Primeiro Contato"
  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { id: 'task-1-id' },
      update: {},
      create: {
        id: 'task-1-id',
        leadId: leads[1].id, // João Santos
        ruleId: taskRules[0].id, // Ligar para o lead
        assignedId: worker.id,
        title: 'Ligar para o lead',
        description: 'Fazer primeiro contato telefônico com João Santos para entender a necessidade de implante',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
        status: 'PENDING',
        companyId: company.id,
      },
    }),
  ]);

  console.log('✅ Tarefas de exemplo criadas:', tasks.length);

  console.log('');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📋 Credenciais de teste:');
  console.log('👤 Admin: admin@ianara.com / admin123');
  console.log('👷 Worker: worker@ianara.com / worker123');
  console.log('');
  console.log('📊 Dados criados:');
  console.log(`📁 ${steps.length} etapas no funil`);
  console.log(`📋 ${taskRules.length + agendamentoTaskRules.length} regras de tarefas`);
  console.log(`👥 ${leads.length} leads de exemplo`);
  console.log(`✅ ${tasks.length} tarefa pendente`);
  console.log('');
  console.log('🚀 Sistema pronto para uso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 