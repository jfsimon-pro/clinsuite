import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TagService } from './tag.service';

@Controller('crm/tags')
@UseGuards(JwtAuthGuard)
export class TagController {
    constructor(private readonly tagService: TagService) { }

    // GET /crm/tags - Listar todas as tags
    @Get()
    async findAll(@Request() req) {
        return this.tagService.findAll(req.user.companyId);
    }

    // GET /crm/tags/:id - Buscar uma tag
    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        return this.tagService.findOne(id, req.user.companyId);
    }

    // POST /crm/tags - Criar nova tag
    @Post()
    async create(
        @Body() body: { name: string; color?: string; icon?: string; description?: string },
        @Request() req,
    ) {
        return this.tagService.create(req.user.companyId, body);
    }

    // PUT /crm/tags/:id - Atualizar tag
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: { name?: string; color?: string; icon?: string; description?: string },
        @Request() req,
    ) {
        return this.tagService.update(id, req.user.companyId, body);
    }

    // DELETE /crm/tags/:id - Deletar tag
    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req) {
        return this.tagService.delete(id, req.user.companyId);
    }

    // POST /crm/tags/:tagId/leads/:leadId - Adicionar tag a um lead
    @Post(':tagId/leads/:leadId')
    async addTagToLead(
        @Param('tagId') tagId: string,
        @Param('leadId') leadId: string,
        @Request() req,
    ) {
        return this.tagService.addTagToLead(leadId, tagId, req.user.companyId, req.user.id);
    }

    // DELETE /crm/tags/:tagId/leads/:leadId - Remover tag de um lead
    @Delete(':tagId/leads/:leadId')
    async removeTagFromLead(
        @Param('tagId') tagId: string,
        @Param('leadId') leadId: string,
        @Request() req,
    ) {
        return this.tagService.removeTagFromLead(leadId, tagId, req.user.companyId);
    }

    // GET /crm/tags/lead/:leadId - Buscar tags de um lead
    @Get('lead/:leadId')
    async getLeadTags(@Param('leadId') leadId: string, @Request() req) {
        return this.tagService.getLeadTags(leadId, req.user.companyId);
    }

    // GET /crm/tags/:id/leads - Buscar leads de uma tag
    @Get(':id/leads')
    async getLeadsByTag(@Param('id') tagId: string, @Request() req) {
        return this.tagService.getLeadsByTag(tagId, req.user.companyId);
    }

    // POST /crm/tags/create-defaults - Criar tags padrão
    @Post('create-defaults')
    async createDefaultTags(@Request() req) {
        return this.tagService.createDefaultTags(req.user.companyId);
    }
}
