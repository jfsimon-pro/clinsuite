import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  // Listar todas as tags da empresa
  async findAll(companyId: string) {
    return this.prisma.tag.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { leads: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  // Buscar uma tag específica
  async findOne(id: string, companyId: string) {
    return this.prisma.tag.findFirst({
      where: { id, companyId },
      include: {
        leads: {
          include: {
            lead: {
              select: { id: true, name: true, phone: true }
            }
          }
        }
      }
    });
  }

  // Criar nova tag
  async create(companyId: string, data: { name: string; color?: string; icon?: string; description?: string }) {
    return this.prisma.tag.create({
      data: {
        name: data.name,
        color: data.color || '#6366F1',
        icon: data.icon,
        description: data.description,
        companyId
      }
    });
  }

  // Atualizar tag
  async update(id: string, companyId: string, data: { name?: string; color?: string; icon?: string; description?: string }) {
    // Verificar se a tag pertence à empresa
    const tag = await this.prisma.tag.findFirst({
      where: { id, companyId }
    });

    if (!tag) {
      throw new Error('Tag não encontrada');
    }

    return this.prisma.tag.update({
      where: { id },
      data
    });
  }

  // Deletar tag
  async delete(id: string, companyId: string) {
    // Verificar se a tag pertence à empresa
    const tag = await this.prisma.tag.findFirst({
      where: { id, companyId }
    });

    if (!tag) {
      throw new Error('Tag não encontrada');
    }

    // Deletar tag (relacionamentos são deletados em cascata)
    return this.prisma.tag.delete({
      where: { id }
    });
  }

  // Adicionar tag a um lead
  async addTagToLead(leadId: string, tagId: string, companyId: string, userId?: string) {
    // Verificar se o lead pertence à empresa
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId }
    });

    if (!lead) {
      throw new Error('Lead não encontrado');
    }

    // Verificar se a tag pertence à empresa
    const tag = await this.prisma.tag.findFirst({
      where: { id: tagId, companyId }
    });

    if (!tag) {
      throw new Error('Tag não encontrada');
    }

    // Verificar se já existe a relação
    const existing = await this.prisma.tagOnLead.findUnique({
      where: {
        leadId_tagId: { leadId, tagId }
      }
    });

    if (existing) {
      return existing; // Já está associada
    }

    return this.prisma.tagOnLead.create({
      data: {
        leadId,
        tagId,
        addedBy: userId
      },
      include: {
        tag: true
      }
    });
  }

  // Remover tag de um lead
  async removeTagFromLead(leadId: string, tagId: string, companyId: string) {
    // Verificar se o lead pertence à empresa
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId }
    });

    if (!lead) {
      throw new Error('Lead não encontrado');
    }

    return this.prisma.tagOnLead.delete({
      where: {
        leadId_tagId: { leadId, tagId }
      }
    });
  }

  // Buscar tags de um lead
  async getLeadTags(leadId: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!lead) {
      throw new Error('Lead não encontrado');
    }

    return lead.tags.map(t => t.tag);
  }

  // Buscar leads por tag
  async getLeadsByTag(tagId: string, companyId: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { id: tagId, companyId },
      include: {
        leads: {
          include: {
            lead: {
              select: {
                id: true,
                name: true,
                phone: true,
                statusVenda: true,
                step: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!tag) {
      throw new Error('Tag não encontrada');
    }

    return tag.leads.map(t => t.lead);
  }

  // Criar tags padrão para uma empresa (chamado na criação da empresa)
  async createDefaultTags(companyId: string) {
    const defaultTags = [
      { name: 'Quente', color: '#EF4444', icon: '🔥', description: 'Lead com alta probabilidade de conversão' },
      { name: 'Frio', color: '#3B82F6', icon: '❄️', description: 'Lead precisa ser aquecido' },
      { name: 'VIP', color: '#F59E0B', icon: '⭐', description: 'Cliente de alto valor' },
      { name: 'Orçamento Alto', color: '#10B981', icon: '💰', description: 'Orçamento acima de R$ 5.000' },
      { name: 'Urgente', color: '#DC2626', icon: '⚡', description: 'Precisa de atenção imediata' },
      { name: 'Retorno', color: '#8B5CF6', icon: '🔄', description: 'Paciente em retorno' },
    ];

    const created = await this.prisma.tag.createMany({
      data: defaultTags.map(tag => ({
        ...tag,
        companyId,
        isSystem: true
      })),
      skipDuplicates: true
    });

    return created;
  }
}
