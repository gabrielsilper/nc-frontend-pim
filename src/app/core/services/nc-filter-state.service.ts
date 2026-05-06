import { Injectable, signal } from '@angular/core';
import { SeverityNc } from '../models/severity-nc.enum';
import { StatusNc } from '../models/status-nc.enum';
import { TypeNc } from '../models/type-nc.enum';

@Injectable({ providedIn: 'root' })
export class NcFilterStateService {
  search = signal('');
  statusFilter = signal<StatusNc | null>(null);
  severityFilter = signal<SeverityNc | null>(null);
  typeFilter = signal<TypeNc | null>(null);
  expiredFilter = signal<0 | 1 | null>(null);
  currentPage = signal(1);
  pageSize = signal(20);
  order = signal<'ASC' | 'DESC'>('DESC');

  clear() {
    this.search.set('');
    this.statusFilter.set(null);
    this.severityFilter.set(null);
    this.typeFilter.set(null);
    this.expiredFilter.set(null);
    this.currentPage.set(1);
    this.pageSize.set(20);
    this.order.set('DESC');
  }
}
