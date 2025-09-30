Sistema de Tarefas Automáticas
 O que é

Um módulo dentro do CRM Odonto que cria e gerencia tarefas automáticas ligadas às etapas do funil.
Quando um lead é movido para uma etapa, o sistema gera automaticamente uma sequência de tarefas personalizadas, definidas pelo dono da clínica (Admin).

⚙️ Comportamentos esperados
1. Criação de regras pelo Admin

Admin acessa uma etapa do funil e cria uma sequência de tarefas.

Exemplo:

Tarefa 1: Ligar para o lead (prazo: 2 dias, responsável: dono do lead).

Tarefa 2: Enviar orçamento (prazo: 1 dia após conclusão da Tarefa 1).

Tarefa 3: Acompanhar retorno (prazo: 3 dias após conclusão da Tarefa 2).

Admin pode adicionar, editar, excluir e reordenar as tarefas da sequência.

2. Atribuição de tarefas

Quando o lead entra na etapa → sistema gera automaticamente a primeira tarefa.

Responsável pode ser definido como:

Lead Owner (quem já cuida do lead).

Trabalhador fixo (um colaborador específico).

Round Robin (distribuição automática entre trabalhadores disponíveis).

3. Execução e continuidade

O trabalhador recebe a tarefa na sua dashboard.

Quando ele marca como concluída, o sistema:

Cria a próxima tarefa da sequência, respeitando o prazo configurado.

Se não houver próxima → a sequência termina.

4. Controle de prazos e status

Cada tarefa tem:

Prazo (dueDate) calculado automaticamente.

Status (PENDING, COMPLETED, EXPIRED).

Se o prazo expirar, a tarefa muda para EXPIRED e pode gerar notificação (popup, email, WhatsApp interno futuramente).

5. Visualização

Dashboard do colaborador:

Lista de "Minhas tarefas pendentes".

Histórico de "Minhas tarefas concluídas".

Lead view:

Todas as tarefas abertas para aquele lead.

Histórico de tarefas concluídas/expiradas.

Admin view:

Relatórios de produtividade (tarefas criadas, concluídas, expiradas por trabalhador e por funil).

📌 O que vamos precisar para implementar
1. Banco de Dados (Prisma)

Stage → Etapas do funil.

StageTaskRule → Regras de tarefas configuradas pelo admin (a sequência).

Task → Tarefas concretas que os trabalhadores recebem.

User → Colaboradores (para atribuição).

Lead → Leads vinculados às tarefas.

2. Backend (NestJS)

Serviço para gerar tarefas automaticamente quando lead entra em uma etapa.

Serviço para criar próxima tarefa quando a anterior for concluída.

Endpoints para:

CRUD de StageTaskRule (configurações feitas pelo admin).

CRUD de Task (colaborador marca como concluída, admin consulta).

Relatórios e estatísticas.

3. Frontend (Next.js)

Admin UI:

Tela de edição da etapa com lista de tarefas automáticas.

Colaborador UI:

Dashboard de tarefas com filtro (pendentes, concluídas, expiradas).

Integração no detalhe do lead para mostrar suas tarefas.

4. Automação futura

IA pode executar tarefas automaticamente (ex: mandar mensagem inicial).

Tarefas podem virar eventos no calendário (Google Calendar).

Notificações via WhatsApp interno ou email.

Ou seja, o core do sistema vai ser:

StageTaskRule (modelo) → configurado pelo admin.

Task (instância) → gerado pelo sistema para os colaboradores.