import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { environment } from '../environments/environment';
import { ThemeService } from './theme.service';

type Role = 'ADMIN' | 'USER';

type ActiveSection =
  | 'dashboard'
  | 'members'
  | 'trainers'
  | 'classes'
  | 'memberships'
  | 'payments'
  | 'attendance'
  | 'reports'
  | 'settings';

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface Member {
  id?: number;
  fullName: string;
  phone: string;
  plan: string;
  status: string;
  weightKg: number | null;
  level: string;
}

interface TrainingClass {
  id?: number;
  title: string;
  coach: string;
  classDate: string;
  capacity: number;
  intensity: string;
}

interface MembershipPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  featured?: boolean;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  mode: 'login' | 'register' = 'login';
  user: User | null = null;
  token = '';
  message = '';
  loading = false;
  loadingData = false;
  paymentMessage = '';

  credentials = {
    name: '',
    email: 'admin@ringbox.local',
    password: 'Admin123',
    role: 'USER' as Role
  };

  members: Member[] = [];
  memberForm: Member = this.emptyMember();
  editingMemberId: number | null = null;

  classes: TrainingClass[] = [];
  classForm: TrainingClass = this.emptyClass();
  editingClassId: number | null = null;

  activeSection: ActiveSection = 'dashboard';
  mobileNavOpen = false;
  private pendingLoads = 0;

  readonly navItems: { id: ActiveSection; label: string; hint: string; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', hint: 'Resumen operativo', adminOnly: true },
    { id: 'members', label: 'Miembros', hint: 'Boxeadores y fichas', adminOnly: true },
    { id: 'trainers', label: 'Entrenadores', hint: 'Staff técnico', adminOnly: true },
    { id: 'classes', label: 'Clases', hint: 'Sesiones programadas' },
    { id: 'memberships', label: 'Membresías', hint: 'Planes disponibles' },
    { id: 'payments', label: 'Pagos', hint: 'Membresías por pagar' },
    { id: 'attendance', label: 'Asistencias', hint: 'Check-in y control', adminOnly: true },
    { id: 'reports', label: 'Reportes', hint: 'Indicadores y exportes', adminOnly: true },
    { id: 'settings', label: 'Configuración', hint: 'Preferencias del ring' }
  ];

  readonly membershipPlans: MembershipPlan[] = [
    {
      name: 'Mensual',
      price: 90000,
      period: '30 dias',
      description: 'Acceso regular para entrenamiento tecnico y clases grupales.',
      features: ['Clases grupales', 'Calendario de sesiones', 'Soporte basico']
    },
    {
      name: 'Trimestral',
      price: 240000,
      period: '90 dias',
      description: 'Plan recomendado para mantener disciplina y progreso constante.',
      features: ['Ahorro frente al mensual', 'Prioridad en cupos', 'Revision de progreso'],
      featured: true
    },
    {
      name: 'Anual',
      price: 780000,
      period: '12 meses',
      description: 'Membresia completa para entrenar durante todo el ano.',
      features: ['Mejor precio', 'Eventos internos', 'Soporte preferencial']
    }
  ];

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    readonly themeService: ThemeService,
    private readonly cdr: ChangeDetectorRef
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('boxing_token') || '';
      const storedUser = localStorage.getItem('boxing_user');
      this.user = storedUser ? JSON.parse(storedUser) : null;
      if (this.token && this.user) {
        this.activeSection = this.defaultSectionForRole();
        this.loadData();
      }
    }
  }

  get isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }

  get visibleNavItems(): { id: ActiveSection; label: string; hint: string; adminOnly?: boolean }[] {
    return this.navItems.filter((item) => this.isAdmin || !item.adminOnly);
  }

  get authHeaders(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    };
  }

  get activeMembersCount(): number {
    return this.members.filter((m) => m.status === 'ACTIVO').length;
  }

  get pausedMembersCount(): number {
    return this.members.filter((m) => m.status === 'PAUSADO').length;
  }

  get classesTodayCount(): number {
    const ref = new Date();
    return this.classes.filter((c) => this.isSameCalendarDay(new Date(c.classDate), ref)).length;
  }

  get trainersCount(): number {
    const coaches = this.classes.map((c) => c.coach?.trim()).filter(Boolean);
    return new Set(coaches).size;
  }

  /** Pendientes operativos vinculados a membresía hasta integrar cobranzas (PAUSADO + revisión). */
  get pendingPaymentsCount(): number {
    return this.isAdmin ? this.pausedMembersCount : 1;
  }

  get todayTotalCapacity(): number {
    const ref = new Date();
    return this.classes
      .filter((c) => this.isSameCalendarDay(new Date(c.classDate), ref))
      .reduce((sum, c) => sum + (Number(c.capacity) || 0), 0);
  }

  get gymLoadPercent(): number {
    const cap = this.todayTotalCapacity;
    if (!cap) {
      return 0;
    }
    return Math.min(100, Math.round((this.activeMembersCount / cap) * 100));
  }

  get upcomingClasses(): TrainingClass[] {
    const start = this.startOfToday().getTime();
    return [...this.classes]
      .filter((c) => !Number.isNaN(new Date(c.classDate).getTime()) && new Date(c.classDate).getTime() >= start)
      .sort((a, b) => new Date(a.classDate).getTime() - new Date(b.classDate).getTime())
      .slice(0, 6);
  }

  get recentMembers(): Member[] {
    return [...this.members]
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
      .slice(0, 5);
  }

  get userPlanName(): string {
    return this.membershipPlans[1].name;
  }

  get userPlanPrice(): number {
    return this.membershipPlans[1].price;
  }

  uniqueCoaches(): string[] {
    const coaches = this.classes.map((c) => c.coach?.trim()).filter(Boolean) as string[];
    return [...new Set(coaches)].sort((a, b) => a.localeCompare(b));
  }

  sectionTitle(section: ActiveSection): string {
    return this.navItems.find((n) => n.id === section)?.label ?? 'Dashboard';
  }

  sectionHint(section: ActiveSection): string {
    return this.navItems.find((n) => n.id === section)?.hint ?? '';
  }

  goToSection(section: ActiveSection): void {
    if (!this.canAccessSection(section)) {
      this.activeSection = this.defaultSectionForRole();
      this.mobileNavOpen = false;
      return;
    }

    this.activeSection = section;
    this.mobileNavOpen = false;
  }

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
  }

  closeMobileNav(): void {
    this.mobileNavOpen = false;
  }

  submitAuth(): void {
    this.loading = true;
    this.message = '';
    const path = this.mode === 'login' ? '/auth/login' : '/auth/register';
    const payload =
      this.mode === 'login'
        ? { email: this.credentials.email, password: this.credentials.password }
        : this.credentials;

    this.http.post<AuthResponse>(`${environment.authApiUrl}${path}`, payload).subscribe({
      next: (response) => {
        this.user = response.user;
        this.token = response.token;
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('boxing_token', this.token);
          localStorage.setItem('boxing_user', JSON.stringify(this.user));
        }
        this.loading = false;
        this.activeSection = this.defaultSectionForRole(response.user);
        this.loadData();
        this.refreshView();
      },
      error: (error) => {
        this.loading = false;
        this.message = error.error?.message || 'No se pudo autenticar.';
        this.refreshView();
      }
    });
  }

  logout(): void {
    this.user = null;
    this.token = '';
    this.members = [];
    this.classes = [];
    this.activeSection = 'dashboard';
    this.mobileNavOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('boxing_token');
      localStorage.removeItem('boxing_user');
    }
  }

  loadData(): void {
    this.loadingData = true;
    this.message = '';
    this.pendingLoads = this.isAdmin ? 2 : 1;

    if (this.isAdmin) {
      this.http
        .get<Member[]>(`${environment.membersApiUrl}/members`, this.authHeaders)
        .pipe(finalize(() => this.finishDataLoad()))
        .subscribe({
          next: (members) => {
            this.members = members;
            this.refreshView();
          },
          error: () => {
            this.message = 'No se pudieron cargar los boxeadores.';
            this.refreshView();
          }
        });
    } else {
      this.members = [];
    }

    this.http
      .get<TrainingClass[]>(`${environment.classesApiUrl}/classes`, this.authHeaders)
      .pipe(finalize(() => this.finishDataLoad()))
      .subscribe({
        next: (classes) => {
          this.classes = classes;
          this.refreshView();
        },
        error: () => {
          this.message = 'No se pudieron cargar las clases.';
          this.refreshView();
        }
      });
  }

  payMembership(plan: MembershipPlan): void {
    this.paymentMessage = `Solicitud de pago creada para la membresia ${plan.name} por ${this.formatCurrency(plan.price)}.`;
    this.goToSection('payments');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  saveMember(): void {
    const request = this.editingMemberId
      ? this.http.put<Member>(
          `${environment.membersApiUrl}/members/${this.editingMemberId}`,
          this.memberForm,
          this.authHeaders
        )
      : this.http.post<Member>(`${environment.membersApiUrl}/members`, this.memberForm, this.authHeaders);

    request.subscribe({
      next: () => {
        this.memberForm = this.emptyMember();
        this.editingMemberId = null;
        this.loadData();
      },
      error: (error) => (this.message = error.error?.message || 'No se pudo guardar el boxeador.')
    });
  }

  editMember(member: Member): void {
    this.editingMemberId = member.id || null;
    this.memberForm = { ...member };
  }

  deleteMember(id?: number): void {
    if (!id) {
      return;
    }
    this.http.delete(`${environment.membersApiUrl}/members/${id}`, this.authHeaders).subscribe({
      next: () => this.loadData(),
      error: (error) => (this.message = error.error?.message || 'No se pudo eliminar el boxeador.')
    });
  }

  saveClass(): void {
    const request = this.editingClassId
      ? this.http.put<TrainingClass>(
          `${environment.classesApiUrl}/classes/${this.editingClassId}`,
          this.classForm,
          this.authHeaders
        )
      : this.http.post<TrainingClass>(`${environment.classesApiUrl}/classes`, this.classForm, this.authHeaders);

    request.subscribe({
      next: () => {
        this.classForm = this.emptyClass();
        this.editingClassId = null;
        this.loadData();
      },
      error: (error) => (this.message = error.error?.message || 'No se pudo guardar la clase.')
    });
  }

  editClass(trainingClass: TrainingClass): void {
    this.editingClassId = trainingClass.id || null;
    this.classForm = {
      ...trainingClass,
      classDate: this.toInputDate(trainingClass.classDate)
    };
  }

  deleteClass(id?: number): void {
    if (!id) {
      return;
    }
    this.http.delete(`${environment.classesApiUrl}/classes/${id}`, this.authHeaders).subscribe({
      next: () => this.loadData(),
      error: (error) => (this.message = error.error?.message || 'No se pudo eliminar la clase.')
    });
  }

  intensityTone(intensity: string): 'hot' | 'warm' | 'cool' {
    const v = intensity?.toLowerCase() ?? '';
    if (v.includes('alta')) {
      return 'hot';
    }
    if (v.includes('baja')) {
      return 'cool';
    }
    return 'warm';
  }

  statusTone(status: string): 'ok' | 'warn' | 'neutral' {
    if (status === 'ACTIVO') {
      return 'ok';
    }
    if (status === 'PAUSADO') {
      return 'warn';
    }
    return 'neutral';
  }

  private emptyMember(): Member {
    return {
      fullName: '',
      phone: '',
      plan: 'Mensual',
      status: 'ACTIVO',
      weightKg: null,
      level: 'Principiante'
    };
  }

  private emptyClass(): TrainingClass {
    const tomorrow = new Date(Date.now() + 86400000);
    return {
      title: '',
      coach: '',
      classDate: this.toInputDate(tomorrow.toISOString()),
      capacity: 12,
      intensity: 'Media'
    };
  }

  private toInputDate(value: string): string {
    return new Date(value).toISOString().slice(0, 16);
  }

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private isSameCalendarDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private canAccessSection(section: ActiveSection): boolean {
    const target = this.navItems.find((item) => item.id === section);
    return Boolean(target && (this.isAdmin || !target.adminOnly));
  }

  private defaultSectionForRole(user: User | null = this.user): ActiveSection {
    return user?.role === 'ADMIN' ? 'dashboard' : 'memberships';
  }

  private finishDataLoad(): void {
    this.pendingLoads = Math.max(0, this.pendingLoads - 1);
    this.loadingData = this.pendingLoads > 0;
    this.refreshView();
  }

  private refreshView(): void {
    this.cdr.detectChanges();
  }
}
