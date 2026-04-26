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
  ResponseCorrectiveActionDTO,
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
  creator = signal<ResponseUserDTO | null>(null);
  assignee = signal<ResponseUserDTO | null>(null);

  showEdit = signal(false);
  showActionForm = signal(false);
  showAssignForm = signal(false);
  loading = signal(false);
  savingRootCause = signal(false);
  savingDueDate = signal(false);
  assignLoading = signal(false);
  transitionError = signal('');
  editError = signal('');

  users = signal<ResponseUserDTO[]>([]);
  selectedUserId = '';

  rootCause = '';
  dueDateLocal = '';

  newActionDesc = '';
  newActionDeadline = '';
  savingAction = signal(false);
  actionError = signal('');

  editingEvidenceId = signal<string | null>(null);
  evidenceDraft = '';
  updatingActionId = signal<string | null>(null);

  readonly StatusNc = StatusNc;
  readonly StatusCa = StatusCa;
  readonly STATUS_LABEL = STATUS_LABEL;
  readonly STATUS_CA_LABEL = STATUS_CA_LABEL;
  readonly TYPE_LABEL = TYPE_LABEL;
  readonly SEVERITY_LABEL = SEVERITY_LABEL;
  readonly PROFILE_LABEL = PROFILE_LABEL;
  readonly timelineSteps = TIMELINE_STEPS;

  currentUser = this.auth.currentUser;

  isGestor = computed(() => this.currentUser()?.profile === Profile.GESTOR);
  isResponsavel = computed(
    () =>
      this.currentUser()?.profile === Profile.RESPONSAVEL ||
      this.currentUser()?.profile === Profile.GESTOR,
  );

  allowed = computed(() => {
    const s = this.nc()?.status;
    return s !== undefined ? allowedStatusTransitions(s) : [];
  });

  canCancel = computed(() => this.allowed().includes(StatusNc.CANCELADA));
  primaryNext = computed(() => this.allowed().find((s) => s !== StatusNc.CANCELADA) ?? null);

  doneCount = computed(() => this.actions().filter((a) => a.status === StatusCa.CONCLUIDA).length);

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

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.svc.byId(id).subscribe((n) => {
        this.nc.set(n);
        this.rootCause = n.rootCause ?? '';
        this.dueDateLocal = n.dueDate ? n.dueDate.slice(0, 10) : '';

        this.userSvc.byId(n.createdById).subscribe((u) => this.creator.set(u));

        if (n.assignedToId) {
          this.userSvc.byId(n.assignedToId).subscribe((u) => this.assignee.set(u));
        }
      });
      this.svc.correctiveActions(id).subscribe((a) => this.actions.set(a));
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
    if (!n) return;
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
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;

    const n = this.nc();
    if (!n) return;

    this.loading.set(true);
    this.editError.set('');

    const { title, description, severity, type, processLine, department } =
      this.editForm.getRawValue();

    this.svc.update(n.id, { title, description, severity, type, processLine, department }).subscribe({
      next: (updated) => {
        this.nc.set(updated);
        this.showEdit.set(false);
        this.loading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.editError.set(
          e.status === 400 ? 'Dados inválidos. Verifique os campos.' : 'Erro ao salvar. Tente novamente.',
        );
        this.loading.set(false);
      },
    });
  }

  saveRootCause() {
    const n = this.nc();
    if (!n || !this.rootCause.trim()) return;

    this.savingRootCause.set(true);
    this.svc.update(n.id, { rootCause: this.rootCause }).subscribe({
      next: (updated) => {
        this.nc.set(updated);
        this.savingRootCause.set(false);
      },
      error: () => this.savingRootCause.set(false),
    });
  }

  saveDueDate() {
    const n = this.nc();
    if (!n || !this.dueDateLocal) return;

    this.savingDueDate.set(true);
    this.svc.updateDueDate(n.id, this.dueDateLocal).subscribe({
      next: (updated) => {
        this.nc.set(updated);
        this.savingDueDate.set(false);
      },
      error: () => this.savingDueDate.set(false),
    });
  }

  transition(next: StatusNc) {
    const n = this.nc();
    if (!n) return;

    if (next === StatusNc.ENCERRADA && !this.rootCause.trim()) {
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

  openAssign() {
    this.selectedUserId = this.assignee()?.id ?? '';
    this.userSvc.listAll().subscribe((list) => {
      this.users.set(list);
      this.showAssignForm.set(true);
    });
  }

  closeAssign() {
    this.showAssignForm.set(false);
    this.selectedUserId = '';
  }

  confirmAssign() {
    const n = this.nc();
    if (!n || !this.selectedUserId) return;

    this.assignLoading.set(true);
    this.svc.assign(n.id, this.selectedUserId).subscribe({
      next: (updated) => {
        this.nc.set(updated);
        this.userSvc.byId(this.selectedUserId).subscribe((u) => {
          this.assignee.set(u);
          this.assignLoading.set(false);
          this.showAssignForm.set(false);
          this.selectedUserId = '';
        });
      },
      error: () => this.assignLoading.set(false),
    });
  }

  addAction() {
    const n = this.nc();
    if (!n || !this.newActionDesc.trim() || !this.newActionDeadline) return;

    if (!n.assignedToId) {
      this.actionError.set('Atribua um responsável à NC antes de criar ações.');
      return;
    }

    const dto: CreateCorrectiveActionDTO = {
      description: this.newActionDesc,
      status: StatusCa.PENDENTE,
      deadline: new Date(this.newActionDeadline).toISOString(),
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

  canEditAction(a: ResponseCorrectiveActionDTO): boolean {
    return this.currentUser()?.id === a.assigneeId;
  }

  startEvidence(a: ResponseCorrectiveActionDTO) {
    this.evidenceDraft = a.evidence ?? '';
    this.editingEvidenceId.set(a.id);
    this.actionError.set('');
  }

  cancelEvidence() {
    this.editingEvidenceId.set(null);
    this.evidenceDraft = '';
  }

  startAction(a: ResponseCorrectiveActionDTO) {
    this.updateAction(a, { status: StatusCa.EM_ANDAMENTO });
  }

  saveEvidenceAndComplete(a: ResponseCorrectiveActionDTO) {
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
      },
    });
  }

  actionIndex(id: string): string {
    const idx = this.actions().findIndex((a) => a.id === id);
    return `CA-${String(idx + 1).padStart(2, '0')}`;
  }
}
