import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { getCalendarEndpoint } from '../../../shared/config';
import { UtilsService } from './services/utils.service';

interface User {
  id: number;
  name: string;
}

interface CalendarDay {
  day_of_week: string;
  status: string;
  is_today: boolean;
}

interface CalendarResponse {
  calendar: { [key: string]: CalendarDay };
  formattedCurrentMonth: string;
  users: User[];
  selectedUserId?: number;
}

interface AbsenceFormData {
  start_date: string;
  end_date: string;
  reason: string;
}

@Component({
  selector: 'app-calendar-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  monthOffset = 0;
  users: User[] = [];
  selectedUserId: number | null = null;
  calendar: { [key: string]: CalendarDay } = {};
  formattedCurrentMonth = '';
  errorMessage = '';
  successMessage = '';
  loading = true;
  isDropdownOpen = false;
  selectedUserName = '';
  showAddAbsenceForm = false;

  searchForm!: FormGroup;
  absenceForm!: FormGroup;
  absenceErrors: string[] = [];

  constructor(
    private http: HttpClient,
    private utils: UtilsService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  private initializeForms() {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    this.absenceForm = this.fb.group({
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      reason: ['Urlop_zwykły', Validators.required]
    });

    this.searchForm.get('searchTerm')?.valueChanges.subscribe(term => {
      this.isDropdownOpen = true;
    });
  }


  ngOnInit() {
    this.fetchCalendarData();
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('successMessage');
    if (success) {
      this.successMessage = decodeURIComponent(success);
      urlParams.delete('successMessage');
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }

  async fetchCalendarData(userId: number | null = null) {
    try {
      this.loading = true;
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      let params = new HttpParams()
        .set('monthOffset', this.monthOffset.toString());

      const effectiveUserId = userId !== null ? userId : this.selectedUserId;
      if (effectiveUserId !== null) {
        params = params.set('user_id', effectiveUserId.toString());
      }

      const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`);

      this.http.get<CalendarResponse>(getCalendarEndpoint('calendar'), { params, headers })
        .subscribe({
          next: (data) => {
            this.calendar = data.calendar || {};
            this.formattedCurrentMonth = data.formattedCurrentMonth || '';
            this.users = data.users || [];
            this.errorMessage = '';

            if (this.selectedUserId === null && userId === null) {
              if (data.selectedUserId) {
                this.selectedUserId = data.selectedUserId;
                const selectedUser = data.users.find(user => user.id === data.selectedUserId);
                if (selectedUser) {
                  this.selectedUserName = selectedUser.name;
                }
              } else if (data.users && data.users.length > 0) {
                this.selectedUserId = data.users[0].id;
                this.selectedUserName = data.users[0].name;
              }
            }
          },
          error: (error) => {
            if (error.status === 401) {
              window.location.href = '/login';
            } else if (error.status === 400 || error.status === 404) {
              this.errorMessage = error.error.detail || 'Wystąpił błąd podczas pobierania danych.';
            } else {
              this.errorMessage = 'Nie udało się pobrać danych kalendarza.';
            }
          },
          complete: () => {
            this.loading = false;
          }
        });
    } catch (error) {
      console.error('Error:', error);
      this.errorMessage = 'Wystąpił błąd podczas pobierania danych.';
      this.loading = false;
    }
  }

  handleUserSelect(user: User) {
    this.selectedUserId = user.id;
    this.selectedUserName = user.name;
    this.isDropdownOpen = false;
    this.fetchCalendarData(user.id);
  }

  handleMonthChange(offsetChange: number) {
    this.monthOffset += offsetChange;
    this.fetchCalendarData();
  }

  get filteredUsers() {
    const searchTerm = this.searchForm.get('searchTerm')?.value || '';
    return this.users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  objectKeys(obj: any): string[] {
    return this.utils.objectKeys(obj);
  }

  toggleAddAbsenceForm() {
    this.showAddAbsenceForm = !this.showAddAbsenceForm;
    if (!this.showAddAbsenceForm) {
      this.absenceForm.reset({
        start_date: '',
        end_date: '',
        reason: 'Urlop_zwykły'
      });
      this.absenceErrors = [];
    }
  }

  async handleAbsenceSubmit() {
    if (this.absenceForm.invalid) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');

      this.http.post(getCalendarEndpoint('absences'), this.absenceForm.value, { headers })
        .subscribe({
          next: (response: any) => {
            const successMessage = encodeURIComponent(response.successMessage);
            this.toggleAddAbsenceForm();
            this.fetchCalendarData();
            this.successMessage = decodeURIComponent(successMessage);
          },
          error: (error) => {
            if (error.error.errors) {
              this.absenceErrors = error.error.errors;
            } else {
              this.absenceErrors = [error.error.detail || 'Wystąpił błąd podczas zapisywania nieobecności.'];
            }
          }
        });
    } catch (error) {
      console.error('Error:', error);
      this.absenceErrors = ['Wystąpił błąd podczas zapisywania nieobecności.'];
    }
  }
}
