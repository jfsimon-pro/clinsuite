/**
 * Domain Events para Lead
 * Emitidos quando eventos importantes acontecem com leads
 */

export class LeadCreatedEvent {
  constructor(
    public readonly leadId: string,
    public readonly stepId: string,
    public readonly companyId: string,
    public readonly responsibleId?: string | null,
  ) {}
}

export class LeadMovedToStepEvent {
  constructor(
    public readonly leadId: string,
    public readonly previousStepId: string,
    public readonly newStepId: string,
    public readonly companyId: string,
  ) {}
}

export class LeadUpdatedEvent {
  constructor(
    public readonly leadId: string,
    public readonly companyId: string,
    public readonly changes: Record<string, any>,
  ) {}
}

export class LeadDeletedEvent {
  constructor(
    public readonly leadId: string,
    public readonly companyId: string,
  ) {}
}
