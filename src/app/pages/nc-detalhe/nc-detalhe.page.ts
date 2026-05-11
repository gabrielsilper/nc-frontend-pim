import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NonConformityService } from '../../core/services/non-conformity.service';
import { UserService } from '../../core/services/user.service';
import {
  CreateCorrectiveActionDTO,
  NcHistoryEventType,
  ResponseCorrectiveActionDTO,
  ResponseNcHistoryDTO,
  ResponseNonConformityDTO,
  STATUS_CA_LABEL,
  StatusCa,
  UpdateCorrectiveActionDTO,
} from '../../core/models/non-conformity.model';
import { Profile, PROFILE_LABEL } from '../../core/models/profile.enum';
import { ResponseUserDTO } from '../../core/models/user.model';
import { SeverityNc, SEVERITY_LABEL } from '../../core/models/severity-nc.enum';
import { allowedStatusTransitions, StatusNc, STATUS_LABEL } from '../../core/models/status-nc.enum';
import { TypeNc, TYPE_LABEL } from '../../core/models/type-nc.enum';
import { SeverityBadgeComponent } from '../../shared/components/severity-badge/severity-badge.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { OverdueBadgeComponent } from '../../shared/components/overdue-badge/overdue-badge.component';
import {
  applyBrDateMask,
  brDateToDateOnly,
  brDateToEndOfDayIso,
  isValidBrDate,
  isoToBrDateInput,
} from '../../core/utils/br-date-input.util';

const FIELD_LABEL: Record<string, string> = {
  title: 'Título',
  description: 'Descrição',
  type: 'Tipo',
  severity: 'Gravidade',
  processLine: 'Linha',
  department: 'Setor',
  rootCause: 'Causa raiz',
};

const TIMELINE_STEPS: StatusNc[] = [
  StatusNc.ABERTA,
  StatusNc.EM_TRATAMENTO,
  StatusNc.AGUARDANDO_VERIFICACAO,
  StatusNc.ENCERRADA,
];

@Component({
  selector: 'app-nc-detalhe-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    SeverityBadgeComponent,
    StatusBadgeComponent,
    OverdueBadgeComponent,
  ],
  templateUrl: './nc-detalhe.page.html',
})
export class NcDetalhePage {
  private svc = inject(NonConformityService);
  private userSvc = inject(UserService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder).nonNullable;

  nc = signal<ResponseNonConformityDTO | null>(null);
  actions = signal<ResponseCorrectiveActionDTO[]>([]);
  history = signal<ResponseNcHistoryDTO[]>([]);
  showAllHistory = signal(false);

  showEdit = signal(false);
  showActionForm = signal(false);
  showAssignForm = signal(false);
  loading = signal(false);
  savingRootCause = signal(false);
  savingDueDate = signal(false);
  assignLoading = signal(false);
  assignError = signal('');
  transitionError = signal('');
  editError = signal('');
  dueDateError = signal('');

  users = signal<ResponseUserDTO[]>([]);
  selectedUserId = '';
  assignDueDate = '';

  rootCause = signal('');
  dueDateLocal = signal('');
  editingDueDate = signal(false);

  editingDeadlineActionId = signal<string | null>(null);
  editingDeadlineDraft = '';
  savingDeadlineActionId = signal<string | null>(null);

  newActionDesc = '';
  newActionDeadline = '';
  savingAction = signal(false);
  actionError = signal('');

  editingEvidenceId = signal<string | null>(null);
  evidenceDraft = '';
  updatingActionId = signal<string | null>(null);

  showRejectionModal = signal(false);
  rejectionReason = signal('');
  submitingRejection = signal(false);

  readonly StatusNc = StatusNc;
  readonly StatusCa = StatusCa;
  readonly STATUS_LABEL = STATUS_LABEL;
  readonly STATUS_CA_LABEL = STATUS_CA_LABEL;
  readonly TYPE_LABEL = TYPE_LABEL;
  readonly SEVERITY_LABEL = SEVERITY_LABEL;
  readonly PROFILE_LABEL = PROFILE_LABEL;
  readonly timelineSteps = TIMELINE_STEPS;

  currentUser = this.auth.currentUser;

  visibleHistory = computed(() => {
    const all = [...this.history()].reverse();
    return this.showAllHistory() ? all : all.slice(0, 5);
  });
  hasMoreHistory = computed(() => this.history().length > 5);

  isNcClosed = computed(() => this.nc()?.status === StatusNc.ENCERRADA);
  isNcCanceled = computed(() => this.nc()?.status === StatusNc.CANCELADA);
  isGestor = computed(() => this.currentUser()?.profile === Profile.GESTOR);
  isResponsavel = computed(
    () =>
      this.currentUser()?.profile === Profile.RESPONSAVEL ||
      this.currentUser()?.profile === Profile.GESTOR,
  );
  canEditNc = computed(() => this.isResponsavel() && !this.isNcClosed() && !this.isNcCanceled());
  canEditRootCause = computed(
    () => this.isResponsavel() && !this.isNcClosed() && !this.isNcCanceled(),
  );
  canEditDueDate = computed(() => this.isGestor() && !this.isNcClosed() && !this.isNcCanceled());
  canEditAssignment = computed(() => this.isGestor() && !this.isNcClosed() && !this.isNcCanceled());
  canManageActionPlan = computed(
    () =>
      !this.isNcClosed() &&
      !this.isNcCanceled() &&
      (this.currentUser()?.profile === Profile.GESTOR ||
        (!!this.nc()?.assignedTo?.id && this.nc()?.assignedTo?.id === this.currentUser()?.id)),
  );
  canSaveRootCause = computed(() => {
    if (!this.canEditRootCause() || this.savingRootCause()) return false;
    const current = this.rootCause().trim();
    const saved = this.nc()?.rootCause?.trim() ?? '';
    return current.length > 0 && current !== saved;
  });

  canSaveDueDate = computed(() => {
    if (!this.canEditDueDate() || this.savingDueDate()) return false;
    const local = this.dueDateLocal();
    if (!isValidBrDate(local)) return false;
    return local !== isoToBrDateInput(this.nc()?.dueDate);
  });

  allowed = computed(() => {
    const s = this.nc()?.status;
    return s !== undefined ? allowedStatusTransitions(s) : [];
  });

  canCancel = computed(() => this.isResponsavel() && this.allowed().includes(StatusNc.CANCELADA));
  primaryNext = computed(() => this.allowed().find((s) => s !== StatusNc.CANCELADA) ?? null);

  canRejectVerification = computed(
    () =>
      this.nc()?.status === StatusNc.AGUARDANDO_VERIFICACAO &&
      this.isGestor() &&
      !this.submitingRejection(),
  );

  doneCount = computed(() => this.actions().filter((a) => a.status === StatusCa.CONCLUIDA).length);
  pendingActionsCount = computed(() => this.actions().length - this.doneCount());
  allCorrectiveActionsCompleted = computed(
    () => this.actions().length > 0 && this.pendingActionsCount() === 0,
  );

  isOverdue = computed(() => {
    const n = this.nc();
    if (!n?.dueDate) return false;
    return (
      new Date(n.dueDate).getTime() < Date.now() &&
      n.status !== StatusNc.ENCERRADA &&
      n.status !== StatusNc.CANCELADA
    );
  });

  timeRemaining = computed(() => {
    const n = this.nc();
    if (!n?.dueDate) return null;
    const diffMs = new Date(n.dueDate).getTime() - Date.now();
    if (diffMs <= 0) return null;
    const h = Math.floor(diffMs / 3_600_000);
    const m = Math.floor((diffMs % 3_600_000) / 60_000);
    return `${h}h ${m}m`;
  });

  editForm = this.fb.group({
    title: this.fb.control('', [Validators.required, Validators.maxLength(120)]),
    description: this.fb.control(''),
    severity: this.fb.control<SeverityNc>(SeverityNc.BAIXA, Validators.required),
    type: this.fb.control<TypeNc>(TypeNc.PRODUTO, Validators.required),
    processLine: this.fb.control('', Validators.required),
    department: this.fb.control('', Validators.required),
  });

  severities: { value: SeverityNc; label: string }[] = [
    { value: SeverityNc.BAIXA, label: 'Baixa' },
    { value: SeverityNc.MEDIA, label: 'Média' },
    { value: SeverityNc.ALTA, label: 'Alta' },
    { value: SeverityNc.CRITICA, label: 'Crítica' },
  ];

  types: { value: TypeNc; label: string }[] = [
    { value: TypeNc.PRODUTO, label: 'Produto' },
    { value: TypeNc.PROCESSO, label: 'Processo' },
    { value: TypeNc.MATERIAL, label: 'Material' },
    { value: TypeNc.SEGURANCA, label: 'Segurança' },
    { value: TypeNc.OUTRO, label: 'Outro' },
  ];

  readonly NcHistoryEventType = NcHistoryEventType;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.svc.byId(id).subscribe((n) => this.applyNcState(n));
      this.svc.correctiveActions(id).subscribe((a) => this.actions.set(a));
      this.svc.history(id).subscribe((h) => this.history.set(h));
    }
  }

  timelineStepStatus(step: StatusNc): 'done' | 'current' | 'pending' {
    const ncStatus = this.nc()?.status;
    if (ncStatus === undefined) return 'pending';
    if (step === ncStatus) return 'current';
    if (step < ncStatus && ncStatus !== StatusNc.CANCELADA) return 'done';
    return 'pending';
  }

  openEdit() {
    const n = this.nc();
    if (!n || !this.canEditNc()) return;
    this.editForm.setValue({
      title: n.title,
      description: n.description,
      severity: n.severity,
      type: n.type,
      processLine: n.processLine,
      department: n.department,
    });
    this.editError.set('');
    this.showEdit.set(true);
  }

  cancelEdit() {
    this.showEdit.set(false);
  }

  saveEdit() {
    if (!this.canEditNc()) return;

    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;

    const n = this.nc();
    if (!n) return;

    this.loading.set(true);
    this.editError.set('');

    const { title, description, severity, type, processLine, department } =
      this.editForm.getRawValue();

    this.svc
      .update(n.id, { title, description, severity, type, processLine, department })
      .subscribe({
        next: (updated) => {
          this.applyNcState(updated);
          this.showEdit.set(false);
          this.loading.set(false);
        },
        error: (e: HttpErrorResponse) => {
          this.editError.set(
            e.status === 400
              ? 'Dados inválidos. Verifique os campos.'
              : 'Erro ao salvar. Tente novamente.',
          );
          this.loading.set(false);
        },
      });
  }

  saveRootCause() {
    const n = this.nc();
    if (!n || !this.canSaveRootCause()) return;

    this.savingRootCause.set(true);
    this.svc.update(n.id, { rootCause: this.rootCause() }).subscribe({
      next: (updated) => {
        this.applyNcState(updated);
        this.savingRootCause.set(false);
      },
      error: () => this.savingRootCause.set(false),
    });
  }

  dueDateForPicker(): string {
    return brDateToDateOnly(this.dueDateLocal()) ?? '';
  }

  deadlineDraftForPicker(): string {
    return brDateToDateOnly(this.editingDeadlineDraft) ?? '';
  }

  openDueDateEdit() {
    this.dueDateLocal.set(isoToBrDateInput(this.nc()?.dueDate));
    this.dueDateError.set('');
    this.editingDueDate.set(true);
  }

  cancelDueDateEdit() {
    this.editingDueDate.set(false);
    this.dueDateError.set('');
  }

  saveDueDate() {
    const n = this.nc();
    if (!n || !this.canEditDueDate()) return;

    const dateTime = brDateToEndOfDayIso(this.dueDateLocal());
    if (!dateTime) {
      this.dueDateError.set('Informe uma data válida no formato dd/MM/aaaa.');
      return;
    }

    this.dueDateError.set('');
    this.savingDueDate.set(true);
    this.svc.updateDueDate(n.id, dateTime).subscribe({
      next: (updated) => {
        this.applyNcState(updated);
        this.savingDueDate.set(false);
        this.editingDueDate.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.dueDateError.set(e.error?.message ?? 'Erro ao atualizar prazo.');
        this.savingDueDate.set(false);
      },
    });
  }

  transition(next: StatusNc) {
    const n = this.nc();
    if (!n) return;

    if (!this.canTransition(next)) {
      this.transitionError.set(this.transitionBlockReason(next));
      return;
    }

    if (next === StatusNc.ENCERRADA && !this.rootCause().trim()) {
      this.transitionError.set('Preencha e salve a causa raiz antes de encerrar a NC.');
      return;
    }

    this.transitionError.set('');
    this.svc.updateStatus(n.id, next).subscribe({
      next: (updated) => this.nc.set(updated),
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.message ?? 'Erro ao atualizar status.';
        this.transitionError.set(msg);
      },
    });
  }

  openRejectionModal() {
    if (!this.canRejectVerification()) return;
    this.rejectionReason.set('');
    this.transitionError.set('');
    this.showRejectionModal.set(true);
  }

  closeRejectionModal() {
    this.showRejectionModal.set(false);
    this.rejectionReason.set('');
  }

  submitRejection() {
    const n = this.nc();
    const reason = this.rejectionReason().trim();

    if (!n || !reason || reason.length < 5) {
      this.transitionError.set('Informe uma justificativa com pelo menos 5 caracteres.');
      return;
    }

    this.submitingRejection.set(true);
    this.svc
      .updateStatus(n.id, StatusNc.EM_TRATAMENTO, { rejectionReason: reason } as any)
      .subscribe({
        next: (updated) => {
          this.nc.set(updated);
          this.closeRejectionModal();
          this.submitingRejection.set(false);
        },
        error: (e: HttpErrorResponse) => {
          this.transitionError.set(e.error?.message ?? 'Erro ao rejeitar NC.');
          this.submitingRejection.set(false);
        },
      });
  }

  openAssign() {
    if (!this.canEditAssignment()) return;
    this.selectedUserId = this.nc()?.assignedTo?.id ?? '';
    this.assignDueDate = isoToBrDateInput(this.nc()?.dueDate);
    this.assignError.set('');
    this.userSvc.listAll({ profile: Profile.RESPONSAVEL }).subscribe((list) => {
      this.users.set(list);
      this.showAssignForm.set(true);
    });
  }

  closeAssign() {
    this.showAssignForm.set(false);
    this.selectedUserId = '';
    this.assignDueDate = '';
    this.assignError.set('');
  }

  confirmAssign() {
    const n = this.nc();
    const dueDate = brDateToEndOfDayIso(this.assignDueDate);

    if (!this.canEditAssignment() || !n || !this.selectedUserId || !dueDate) {
      this.assignError.set('Informe um responsável e um prazo válido antes de confirmar.');
      return;
    }

    this.assignError.set('');
    this.assignLoading.set(true);
    this.svc.assign(n.id, { assignedToId: this.selectedUserId, dueDate }).subscribe({
      next: (updated) => {
        this.applyNcState(updated);
        this.assignLoading.set(false);
        this.showAssignForm.set(false);
        this.selectedUserId = '';
        this.assignDueDate = '';
      },
      error: (e: HttpErrorResponse) => {
        this.assignError.set(e.error?.message ?? 'Erro ao atribuir responsável.');
        this.assignLoading.set(false);
      },
    });
  }

  addAction() {
    const n = this.nc();
    const deadline = brDateToEndOfDayIso(this.newActionDeadline);

    if (!this.canManageActionPlan()) {
      this.actionError.set('NC encerrada nao permite alterar o plano de ação.');
      return;
    }

    if (!n || !this.newActionDesc.trim() || !deadline) {
      this.actionError.set('Informe uma descrição e um prazo válido no formato dd/MM/aaaa.');
      return;
    }

    if (!n.assignedTo) {
      this.actionError.set('Atribua um responsável à NC antes de criar ações.');
      return;
    }

    const dto: CreateCorrectiveActionDTO = {
      description: this.newActionDesc,
      status: StatusCa.PENDENTE,
      deadline,
    };

    this.actionError.set('');
    this.savingAction.set(true);
    this.svc.createCorrectiveAction(n.id, dto).subscribe({
      next: () => {
        this.svc.correctiveActions(n.id).subscribe((list) => this.actions.set(list));
        this.newActionDesc = '';
        this.newActionDeadline = '';
        this.showActionForm.set(false);
        this.savingAction.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.actionError.set(e.error?.message ?? 'Erro ao criar ação corretiva.');
        this.savingAction.set(false);
      },
    });
  }

  canEditAction(_a: ResponseCorrectiveActionDTO): boolean {
    return this.canManageActionPlan();
  }

  startEvidence(a: ResponseCorrectiveActionDTO) {
    if (!this.canManageActionPlan()) return;
    this.evidenceDraft = a.evidence ?? '';
    this.editingEvidenceId.set(a.id);
    this.actionError.set('');
  }

  cancelEvidence() {
    this.editingEvidenceId.set(null);
    this.evidenceDraft = '';
  }

  startAction(a: ResponseCorrectiveActionDTO) {
    if (!this.canManageActionPlan()) return;
    this.updateAction(a, { status: StatusCa.EM_ANDAMENTO });
  }

  saveEvidenceAndComplete(a: ResponseCorrectiveActionDTO) {
    if (!this.canManageActionPlan()) return;
    const text = this.evidenceDraft.trim();
    if (text.length < 3) {
      this.actionError.set('Evidência deve ter no mínimo 3 caracteres.');
      return;
    }
    this.updateAction(a, { status: StatusCa.CONCLUIDA, evidence: text }, () => {
      this.editingEvidenceId.set(null);
      this.evidenceDraft = '';
    });
  }

  reopenAction(a: ResponseCorrectiveActionDTO) {
    if (!this.canManageActionPlan()) return;
    this.updateAction(a, { status: StatusCa.EM_ANDAMENTO });
  }

  private updateAction(
    a: ResponseCorrectiveActionDTO,
    dto: UpdateCorrectiveActionDTO,
    onSuccess?: () => void,
  ) {
    const n = this.nc();
    if (!n) return;

    this.actionError.set('');
    this.updatingActionId.set(a.id);
    this.svc.updateCorrectiveAction(n.id, a.id, dto).subscribe({
      next: (updated) => {
        this.actions.update((list) => list.map((x) => (x.id === updated.id ? updated : x)));
        this.updatingActionId.set(null);
        onSuccess?.();
      },
      error: (e: HttpErrorResponse) => {
        this.actionError.set(e.error?.message ?? 'Erro ao atualizar ação corretiva.');
        this.updatingActionId.set(null);
        this.savingDeadlineActionId.set(null);
      },
    });
  }

  actionIndex(id: string): string {
    const idx = this.actions().findIndex((a) => a.id === id);
    return `CA-${String(idx + 1).padStart(2, '0')}`;
  }

  onAssignDueDateChange(value: string) {
    this.assignDueDate = applyBrDateMask(value);
    this.assignError.set('');
  }

  onNcDueDateChange(value: string) {
    if (!this.canEditDueDate()) return;
    this.dueDateLocal.set(applyBrDateMask(value));
    this.dueDateError.set('');
  }

  onActionDeadlineChange(value: string) {
    this.newActionDeadline = applyBrDateMask(value);
    this.actionError.set('');
  }

  onAssignDueDatePicked(value: string) {
    this.assignDueDate = isoToBrDateInput(value);
    this.assignError.set('');
  }

  onNcDueDatePicked(value: string) {
    if (!this.canEditDueDate()) return;
    this.dueDateLocal.set(isoToBrDateInput(value));
    this.dueDateError.set('');
  }

  onActionDeadlinePicked(value: string) {
    this.newActionDeadline = isoToBrDateInput(value);
    this.actionError.set('');
  }

  openDeadlineEdit(a: ResponseCorrectiveActionDTO) {
    this.editingDeadlineDraft = isoToBrDateInput(a.deadline);
    this.actionError.set('');
    this.editingDeadlineActionId.set(a.id);
  }

  cancelDeadlineEdit() {
    this.editingDeadlineActionId.set(null);
    this.editingDeadlineDraft = '';
  }

  onDeadlineDraftChange(value: string) {
    this.editingDeadlineDraft = applyBrDateMask(value);
    this.actionError.set('');
  }

  onDeadlineDraftPicked(value: string) {
    this.editingDeadlineDraft = isoToBrDateInput(value);
    this.actionError.set('');
  }

  canSaveDeadline(a: ResponseCorrectiveActionDTO): boolean {
    if (this.savingDeadlineActionId() === a.id) return false;
    if (!isValidBrDate(this.editingDeadlineDraft)) return false;
    return this.editingDeadlineDraft !== isoToBrDateInput(a.deadline);
  }

  saveDeadline(a: ResponseCorrectiveActionDTO) {
    const dateTime = brDateToEndOfDayIso(this.editingDeadlineDraft);
    if (!dateTime) {
      this.actionError.set('Informe uma data válida no formato dd/MM/aaaa.');
      return;
    }
    this.savingDeadlineActionId.set(a.id);
    this.actionError.set('');
    this.updateAction(a, { deadline: dateTime }, () => {
      this.editingDeadlineActionId.set(null);
      this.editingDeadlineDraft = '';
      this.savingDeadlineActionId.set(null);
    });
  }

  canConfirmAssign(): boolean {
    return this.canEditAssignment() && !!this.selectedUserId && isValidBrDate(this.assignDueDate);
  }

  canSaveAction(): boolean {
    return (
      this.canManageActionPlan() &&
      !!this.newActionDesc.trim() &&
      !!this.nc()?.assignedTo &&
      isValidBrDate(this.newActionDeadline)
    );
  }

  canTransition(next: StatusNc): boolean {
    const n = this.nc();
    if (!n || !this.isResponsavel()) return false;

    if (next === StatusNc.EM_TRATAMENTO) {
      return !!n.assignedTo && !!n.dueDate;
    }

    if (next === StatusNc.AGUARDANDO_VERIFICACAO) {
      return this.allCorrectiveActionsCompleted();
    }

    if (next === StatusNc.ENCERRADA) {
      return this.isGestor() && !!this.rootCause().trim();
    }

    return true;
  }

  transitionBlockReason(next: StatusNc): string {
    if (next === StatusNc.EM_TRATAMENTO) {
      return 'Atribua um responsável e um prazo antes de iniciar o tratamento.';
    }

    if (next === StatusNc.AGUARDANDO_VERIFICACAO) {
      return 'Conclua todas as ações corretivas antes de enviar para verificação.';
    }

    if (next === StatusNc.ENCERRADA && !this.isGestor()) {
      return 'Somente um gestor pode encerrar uma NC em verificação.';
    }

    if (next === StatusNc.ENCERRADA) {
      return 'Preencha e salve a causa raiz antes de encerrar a NC.';
    }

    return 'Você não tem permissão para avançar este status.';
  }

  historyEventDescription(event: ResponseNcHistoryDTO): string {
    const m = event.metadata;
    switch (event.eventType) {
      case NcHistoryEventType.CREATED:
        return 'Registrou a não conformidade';
      case NcHistoryEventType.STATUS_CHANGED:
        return `Alterou status de ${STATUS_LABEL[m?.['previousStatus'] as StatusNc]} para ${STATUS_LABEL[m?.['newStatus'] as StatusNc]}`;
      case NcHistoryEventType.ASSIGNEE_SET:
        return `Atribuiu ${m?.['assigneeName']} como responsável`;
      case NcHistoryEventType.ASSIGNEE_CHANGED:
        return `Transferiu responsabilidade para ${m?.['newAssigneeName']}`;
      case NcHistoryEventType.DUE_DATE_UPDATED:
        return 'Atualizou o prazo da NC';
      case NcHistoryEventType.FIELDS_UPDATED: {
        const labels = ((m?.['fields'] as string[]) ?? [])
          .map((f) => FIELD_LABEL[f] ?? f)
          .join(', ');
        return `Editou: ${labels}`;
      }
      default:
        return 'Evento registrado';
    }
  }

  historyEventDotClass(eventType: NcHistoryEventType): string {
    switch (eventType) {
      case NcHistoryEventType.CREATED:
        return 'bg-nc-ok';
      case NcHistoryEventType.STATUS_CHANGED:
        return 'bg-nc-accent';
      default:
        return 'bg-nc-line-strong';
    }
  }

  private applyNcState(n: ResponseNonConformityDTO) {
    this.nc.set(n);
    this.rootCause.set(n.rootCause ?? '');
    this.dueDateLocal.set(isoToBrDateInput(n.dueDate));

    if (n.status === StatusNc.ENCERRADA) {
      this.showEdit.set(false);
      this.showAssignForm.set(false);
      this.showActionForm.set(false);
      this.cancelEvidence();
    }
  }
}
