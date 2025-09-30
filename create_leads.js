const axios = require('axios');

// Token de autenticação
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0M2FjZGEyYy0yYjkxLTQ5N2ItYTQ3OS04MWI4OWMwMmY5MDUiLCJlbWFpbCI6ImFkbWluQGlhbmFyYS5jb20iLCJyb2xlIjoiQURNSU4iLCJjb21wYW55SWQiOiIzN2U1ODE2MS0xNzI3LTRiNTMtOWJjYS1iZjczOWQ4M2E0ZDQiLCJpYXQiOjE3NTg3Mjc3MjEsImV4cCI6MTc1OTMzMjUyMX0.nDWMaO-_trISgPEq3y1HpQLIUFhnD0hRK0-4a5J5Ub0';
const BASE_URL = 'http://localhost:3001';

// Configuração do axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Funis e etapas
const FUNNELS = {
  'Odontologia Estética': {
    id: 'efb33ac8-0133-4d35-a602-2821b24bde3b',
    steps: [
      { id: '765fa1f9-e896-4b37-b09a-568e6eaf29c8', name: 'Interesse Estético', valores: [1500, 2000, 2500] },
      { id: 'c1b7ba3a-0103-4c7b-8437-2a16bfbf789e', name: 'Avaliação do Sorriso', valores: [1800, 2200, 2800] },
      { id: '047a93bc-7337-4785-9ffe-1118531fe5c6', name: 'Simulação Digital', valores: [2000, 2500, 3000] },
      { id: '98ed0901-1df3-47dd-8ea4-fde9b127e602', name: 'Proposta Personalizada', valores: [2500, 3200, 4000] },
      { id: '03a957ee-8309-48a1-b921-b33ac44a7105', name: 'Aprovação do Tratamento', valores: [2200, 3000, 3800] },
      { id: '1e8d2cb9-e920-49f3-8251-3a1657fd9b3e', name: 'Início do Tratamento', valores: [2200, 3000, 3800] }
    ]
  },
  'Implantes Dentários': {
    id: 'd337ef57-e1d3-4418-b578-f0f92e4f2a98',
    steps: [
      { id: 'c225a123-eb53-402f-9ab9-24ad12097012', name: 'Consulta Implante', valores: [3000, 3500, 4000] },
      { id: 'b7a7e6d3-ead9-4694-961b-2b1a546b8ab5', name: 'Avaliação Óssea', valores: [3500, 4000, 4500] },
      { id: 'caa2f53c-2934-4d2d-a19b-939a3ca1b98b', name: 'Planejamento 3D', valores: [4000, 4800, 5500] },
      { id: '1d9217ec-7f35-48c3-ac03-101f92ede11d', name: 'Aprovação Financeira', valores: [3800, 4500, 5200] },
      { id: 'fe307a66-65b6-4d52-8dcd-3297bb58f2e8', name: 'Cirurgia Agendada', valores: [3800, 4500, 5200] }
    ]
  },
  'Ortodontia Especializada': {
    id: '433a4805-bc28-4058-9e7c-d1d94d8bc205',
    steps: [
      { id: 'ba0f0ad3-f658-40bd-8c07-56b0a3134b4d', name: 'Interesse em Ortodontia', valores: [4500, 5000, 5500] },
      { id: '6c8769a3-605c-4273-bffe-2fb1d351916c', name: 'Avaliação Inicial', valores: [5000, 5500, 6000] },
      { id: '000ce908-91d8-4711-84fd-065989405b79', name: 'Documentação Ortodôntica', valores: [5500, 6000, 6500] },
      { id: 'd544494f-394c-4dff-930c-e83b10298b9e', name: 'Plano de Tratamento', valores: [6000, 6500, 7000] },
      { id: '30f31291-944e-4fc1-9c11-ad4ac5523681', name: 'Aprovação dos Responsáveis', valores: [5800, 6200, 6800] },
      { id: '42098503-e653-4c79-a7c7-720c8636cc36', name: 'Contrato Assinado', valores: [5800, 6200, 6800] }
    ]
  },
  'Novos Contatos - Geral': {
    id: '0c1f3148-95a6-4ec2-8ce2-e1bc536a4a6d',
    steps: [
      { id: 'f2ca63b1-b4c2-4364-8f81-a50df21d7cdb', name: 'Novo Contato', valores: [1000, 2000, 3000] },
      { id: '8865d551-0905-4d82-ac9c-139478ffca8e', name: 'Primeiro Contato', valores: [1500, 2500, 3500] },
      { id: 'fa5ba0c5-1c3e-488f-89fa-39bf6f3c60f1', name: 'Interesse Demonstrado', valores: [2000, 3000, 4000] },
      { id: '695ae55e-8d6d-4aeb-ade6-395c94365d99', name: 'Consulta Agendada', valores: [2200, 3200, 4200] },
      { id: 'ca22cecc-c263-43bf-8f11-9f8c9b9fcbc4', name: 'Consulta Realizada', valores: [2500, 3500, 4500] },
      { id: '537078e4-63ff-4332-90a1-28d2c0de7510', name: 'Orçamento Enviado', valores: [2800, 3800, 4800] },
      { id: '0c1306be-3a18-437e-850f-4e2125178c28', name: 'Negociação', valores: [2600, 3600, 4600] },
      { id: 'def0a247-d83c-43c9-89c7-79fea1cb49c9', name: 'Fechado - Ganho', valores: [2600, 3600, 4600] }
    ]
  }
};

// Dados para geração aleatória
const NOMES = [
  'Ana Silva', 'João Santos', 'Maria Oliveira', 'Pedro Costa', 'Carla Souza',
  'Lucas Ferreira', 'Juliana Lima', 'Ricardo Almeida', 'Fernanda Rocha', 'Gabriel Martins',
  'Camila Barbosa', 'Rafael Pereira', 'Larissa Cardoso', 'Thiago Nascimento', 'Beatriz Araujo',
  'Felipe Gomes', 'Natália Cruz', 'Bruno Dias', 'Amanda Ribeiro', 'Gustavo Moreira',
  'Isabella Torres', 'Daniel Silva', 'Patrícia Fernandes', 'Marcos Cavalcanti', 'Renata Melo'
];

const TELEFONES = [
  '11999887766', '11988776655', '11977665544', '11966554433', '11955443322',
  '21999887766', '21988776655', '21977665544', '21966554433', '21955443322',
  '31999887766', '31988776655', '31977665544', '31966554433', '31955443322',
  '41999887766', '41988776655', '41977665544', '41966554433', '41955443322',
  '51999887766', '51988776655', '51977665544', '51966554433', '51955443322'
];

const MEIOS_CAPTACAO = ['WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'GOOGLE_ADS', 'INDICACAO', 'SITE'];
const TIPOS_PROCURA = {
  'Odontologia Estética': ['ESTETICA', 'CLAREAMENTO'],
  'Implantes Dentários': ['IMPLANTE'],
  'Ortodontia Especializada': ['ORTODONTIA'],
  'Novos Contatos - Geral': ['ORTODONTIA', 'IMPLANTE', 'ESTETICA', 'LIMPEZA', 'CANAL']
};

const STATUS_VENDA = ['QUALIFICANDO', 'INTERESSE_DEMONSTRADO', 'CONSULTA_AGENDADA', 'CONSULTA_REALIZADA', 'ORCAMENTO_ENVIADO', 'NEGOCIACAO', 'GANHO', 'PERDIDO'];

// Função para obter valor aleatório de array
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Função para obter valor aleatório dentro de range
function randomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função para obter data aleatória nos últimos 60 dias
function randomDate() {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * 60 * 24 * 60 * 60 * 1000));
  return pastDate.toISOString();
}

// Função para criar lead
async function criarLead(leadData) {
  try {
    const response = await api.post('/crm/leads', leadData);
    console.log(`✅ Lead criado: ${leadData.name} (${leadData.phone}) - Funil: ${leadData.funnelName}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao criar lead ${leadData.name}:`, error.response?.data || error.message);
  }
}

// Função principal para gerar leads
async function gerarLeads() {
  console.log('🚀 Iniciando geração de leads para teste do analytics...');
  console.log('');

  let totalLeads = 0;

  for (const [funnelName, funnel] of Object.entries(FUNNELS)) {
    console.log(`📊 Criando leads para: ${funnelName}`);

    // Definir quantos leads criar por etapa (simulando funil realista)
    const leadsDistribution = {
      0: 15, // Primeira etapa - mais leads
      1: 12, // Segunda etapa
      2: 8,  // Terceira etapa
      3: 6,  // Quarta etapa
      4: 4,  // Quinta etapa
      5: 2,  // Sexta etapa (se existir)
      6: 1,  // Sétima etapa (se existir)
      7: 1   // Oitava etapa (se existir)
    };

    for (let stepIndex = 0; stepIndex < funnel.steps.length; stepIndex++) {
      const step = funnel.steps[stepIndex];
      const numLeads = leadsDistribution[stepIndex] || 1;

      for (let i = 0; i < numLeads; i++) {
        const nome = randomChoice(NOMES);
        const telefone = randomChoice(TELEFONES);
        const createdAt = randomDate();

        // Definir valores baseados na etapa
        const valores = step.valores;
        const valorOrcamento = randomChoice(valores);
        const valorVenda = Math.floor(valorOrcamento * (0.85 + Math.random() * 0.15)); // 85% a 100% do orçamento

        // Definir status baseado na posição no funil
        let statusVenda;
        if (stepIndex === 0) statusVenda = randomChoice(['QUALIFICANDO', 'INTERESSE_DEMONSTRADO']);
        else if (stepIndex === 1) statusVenda = randomChoice(['INTERESSE_DEMONSTRADO', 'CONSULTA_AGENDADA']);
        else if (stepIndex === 2) statusVenda = randomChoice(['CONSULTA_AGENDADA', 'CONSULTA_REALIZADA']);
        else if (stepIndex === 3) statusVenda = randomChoice(['CONSULTA_REALIZADA', 'ORCAMENTO_ENVIADO']);
        else if (stepIndex === 4) statusVenda = randomChoice(['ORCAMENTO_ENVIADO', 'NEGOCIACAO']);
        else if (stepIndex >= 5) {
          // Etapas finais - alguns ganhos, alguns perdidos
          statusVenda = Math.random() > 0.3 ? 'GANHO' : randomChoice(['NEGOCIACAO', 'PERDIDO']);
        }

        // Data de fechamento se foi ganho ou perdido
        let dataFechamento = null;
        if (statusVenda === 'GANHO' || statusVenda === 'PERDIDO') {
          const baseDate = new Date(createdAt);
          dataFechamento = new Date(baseDate.getTime() + (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString();
        }

        const leadData = {
          phone: `${telefone}_${i}_${stepIndex}`, // Tornar único
          name: `${nome} ${i}`,
          funnelId: funnel.id,
          stepId: step.id,
          meioCaptacao: randomChoice(MEIOS_CAPTACAO),
          tipoProcura: randomChoice(TIPOS_PROCURA[funnelName]),
          statusVenda: statusVenda,
          valorOrcamento: valorOrcamento,
          valorVenda: statusVenda === 'GANHO' ? valorVenda : null,
          dataOrcamento: createdAt,
          dataFechamento: dataFechamento,
          probabilidadeFecho: stepIndex === 0 ? 20 : stepIndex === 1 ? 40 : stepIndex === 2 ? 60 : stepIndex === 3 ? 75 : 90,
          createdAt: createdAt,
          funnelName: funnelName // Só para log
        };

        await criarLead(leadData);
        totalLeads++;
      }
    }

    console.log(`✅ ${funnelName}: leads criados`);
    console.log('');
  }

  console.log(`🎉 Concluído! Total de ${totalLeads} leads criados.`);
  console.log('');
  console.log('📊 Agora você pode testar o /analytics com dados realistas!');
  console.log('🌐 Acesse: http://localhost:3000/analytics');
}

// Executar
gerarLeads().catch(console.error);