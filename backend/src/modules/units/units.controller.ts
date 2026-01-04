import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto } from './units.dto';

@Controller('units')
@UseGuards(JwtAuthGuard)
export class UnitsController {
    constructor(private readonly unitsService: UnitsService) { }

    @Post()
    async createUnit(@Body() data: CreateUnitDto, @Request() req) {
        // Apenas ADMIN pode criar unidades
        if (req.user.role !== 'ADMIN') {
            throw new Error('Apenas administradores podem criar unidades');
        }

        return this.unitsService.createUnit(data, req.user.companyId, req.user.id);
    }

    @Get()
    async getUnits(@Request() req) {
        return this.unitsService.getUnits(req.user.companyId, req.user.id, req.user.role);
    }

    @Get(':id')
    async getUnitById(@Param('id') id: string, @Request() req) {
        return this.unitsService.getUnitById(id, req.user.companyId, req.user.id, req.user.role);
    }

    @Patch(':id')
    async updateUnit(@Param('id') id: string, @Body() data: UpdateUnitDto, @Request() req) {
        return this.unitsService.updateUnit(id, data, req.user.companyId, req.user.id, req.user.role);
    }

    @Delete(':id')
    async deleteUnit(@Param('id') id: string, @Request() req) {
        return this.unitsService.deleteUnit(id, req.user.companyId, req.user.role);
    }
}
