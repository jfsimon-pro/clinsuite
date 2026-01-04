import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Request,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Res,
    StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentoService } from './documento.service';
import { multerConfig } from './multer.config';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('documentos')
export class DocumentoController {
    constructor(private readonly documentoService: DocumentoService) { }

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', multerConfig))
    async uploadDocumento(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @Request() req
    ) {
        if (!file) {
            throw new BadRequestException('Nenhum arquivo foi enviado');
        }

        // Determinar tipo baseado no mimetype
        let tipo: string;
        if (file.mimetype.startsWith('image/')) {
            tipo = body.tipo || 'FOTO'; // FOTO ou RAIO_X
        } else if (file.mimetype === 'application/pdf') {
            tipo = 'PDF';
        } else {
            tipo = 'OUTRO';
        }

        return this.documentoService.createDocumento({
            leadId: body.leadId,
            tipo,
            categoria: body.categoria,
            url: `/documentos/file/${file.filename}`,
            descricao: body.descricao || file.originalname,
            uploadedBy: req.user.id,
        }, req.user.companyId);
    }

    @Get('file/:filename')
    async serveFile(@Param('filename') filename: string, @Res() res: Response) {
        const fs = require('fs');
        const filePath = join(process.cwd(), 'uploads', 'documents', filename);

        // Verificar se o arquivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Arquivo não encontrado' });
        }

        // Obter informações do arquivo
        const stat = fs.statSync(filePath);

        // Detectar tipo do arquivo pela extensão e configurar headers
        if (filename.endsWith('.pdf')) {
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Length': stat.size.toString(),
                'Content-Disposition': `inline; filename="${filename}"`,
            });
        } else if (filename.match(/\.(jpg|jpeg|png)$/i)) {
            const ext = filename.split('.').pop()?.toLowerCase();
            res.set({
                'Content-Type': `image/${ext === 'jpg' ? 'jpeg' : ext}`,
                'Content-Length': stat.size.toString(),
            });
        }

        // Enviar o arquivo
        res.sendFile(filePath);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createDocumento(@Body() data: any, @Request() req) {
        return this.documentoService.createDocumento({
            ...data,
            uploadedBy: req.user.id,
        }, req.user.companyId);
    }

    @Get('lead/:leadId')
    @UseGuards(JwtAuthGuard)
    async getDocumentosByLead(@Param('leadId') leadId: string, @Request() req) {
        return this.documentoService.getDocumentosByLead(leadId, req.user.companyId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteDocumento(@Param('id') id: string, @Request() req) {
        return this.documentoService.deleteDocumento(id, req.user.companyId);
    }
}
