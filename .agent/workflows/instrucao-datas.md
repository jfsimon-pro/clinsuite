---
description: Instruções para tratamento de datas no sistema IanaraERP
---

# Tratamento de Datas no Sistema

## 🔴 Problema Identificado

O sistema usa:
- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js + React

Quando o Prisma retorna datas do banco de dados, ele retorna objetos `Date` do JavaScript. 
Ao serializar para JSON, o NestJS converte automaticamente para ISO string, **porém** isso nem sempre funciona corretamente quando:

1. A data é `null` ou `undefined`
2. O objeto Date vem de uma consulta complexa (joins, includes)
3. O campo foi definido incorretamente no schema

No frontend, tentar criar `new Date(undefined)` ou `new Date(null)` resulta em `Invalid Date`, 
o que causa o erro: **"Invalid time value"**.

---

## ✅ Regras Obrigatórias

### 1. Backend - Sempre converter datas para ISO String

Ao retornar dados que contêm datas em endpoints da API, **SEMPRE** converta explicitamente:

```typescript
// ❌ ERRADO - Retornar diretamente do Prisma
async getData() {
  return this.prisma.model.findMany();
}

// ✅ CORRETO - Converter datas explicitamente
async getData() {
  const data = await this.prisma.model.findMany();
  
  return data.map(item => ({
    ...item,
    createdAt: item.createdAt?.toISOString(),
    dataConsulta: item.dataConsulta?.toISOString(),
    // ... outras datas
  }));
}
```

### 2. Frontend - NUNCA usar `new Date()` diretamente

Sempre use um helper function para formatar datas:

```typescript
// ✅ CORRETO - Helper para formatar datas com segurança
const formatDate = (dateValue: any, formatStr: string = 'dd/MM/yyyy') => {
  if (!dateValue) return 'Data não definida';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Data inválida';
    return format(date, formatStr, { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
};

// Uso no JSX
<p>{formatDate(item.createdAt)}</p>
<p>{formatDate(item.dataConsulta, "dd/MM/yyyy 'às' HH:mm")}</p>
```

### 3. Verificação de data para lógica condicional

```typescript
// ❌ ERRADO - Comparar diretamente
if (new Date(item.dataConsulta) < new Date()) { ... }

// ✅ CORRETO - Verificar validade primeiro
const isValidDate = (dateValue: any): boolean => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  return !isNaN(date.getTime());
};

if (isValidDate(item.dataConsulta) && new Date(item.dataConsulta) < new Date()) { ... }
```

---

## 📋 Checklist para novos endpoints

Ao criar um novo endpoint que retorna datas:

- [ ] Identificar todos os campos de data no retorno
- [ ] Converter cada campo com `?.toISOString()`
- [ ] Testar o endpoint com `curl` para verificar formato JSON
- [ ] No frontend, usar helper `formatDate` para exibição
- [ ] Verificar validade antes de usar em lógica condicional

---

## 🔧 Exemplo Completo

### Backend (patient-auth.service.ts)
```typescript
async getAppointments(patientId: string) {
  const lead = await this.prisma.lead.findUnique({
    where: { id: patientId },
    include: { dentistUser: { select: { id: true, name: true } } },
  });

  const appointments = [];

  if (lead?.dataConsulta) {
    appointments.push({
      id: `lead-${lead.id}`,
      dataConsulta: lead.dataConsulta.toISOString(), // ✅ Converter!
      dentista: lead.dentistUser,
    });
  }

  return appointments;
}
```

### Frontend (page.tsx)
```tsx
// Helper
const formatDate = (dateValue: any) => {
  if (!dateValue) return 'Data não definida';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Data inválida';
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
};

// JSX
<p className="font-semibold">{formatDate(apt.dataConsulta)}</p>
```

---

## 📁 Arquivos de referência

Veja implementações corretas em:
- `backend/src/modules/patient-auth/patient-auth.service.ts` - Métodos getAppointments, getDocuments, getPayments
- `frontend/src/app/patient/appointments/page.tsx` - Helper formatDate
- `frontend/src/app/patient/documents/page.tsx` - Helper formatDate
- `frontend/src/app/patient/payments/page.tsx` - Helper formatDate
