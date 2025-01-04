import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { getTimeEndpoint } from '../../../shared/config';
import { UtilsService } from './services/utils.service';

interface User {
  id: number;
  name: string;
}

interface DailySummary {
  time: string;
  isActive: boolean;
}

interface WeeklySummaryResponse {
  dailySummary: { [key: string]: DailySummary };
  weeklyTotal: string;
  users: User[];
  selectedUserId: number | null;
}

@Component({
  selector: 'app-weekly-summary-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    class: 'app-root'
  }
})
export class AppComponent implements OnInit {
  private readonly weeklyEndpoint = getTimeEndpoint('summary');
  
  weekOffset: number = 0;
  users: User[] = [];
  selectedUserId: number | null = null;
  dailySummary: { [key: string]: DailySummary } = {};
  errorMessage: string = '';
  weeklyTotal: string = '00:00:00';
  loading: boolean = true;
  isDropdownOpen: boolean = false;
  selectedUserName: string = '';
  searchForm!: FormGroup;

  constructor(
    private http: HttpClient,
    private utils: UtilsService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    this.searchForm.get('searchTerm')?.valueChanges.subscribe(() => {
      this.isDropdownOpen = true;
    });
  }

  ngOnInit(): void {
    this.fetchWeeklySummary();
  }

  fetchWeeklySummary(userId: number | null = null): void {
    this.loading = true;
    const token = this.utils.getToken();
    
    if (!token) {
      window.location.href = '/login';
      return;
    }

    let params = new HttpParams()
      .set('weekOffset', this.weekOffset.toString());

    const effectiveUserId = userId !== null ? userId : this.selectedUserId;
    if (effectiveUserId !== null) {
      params = params.append('user_id', effectiveUserId.toString());
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    this.http.get<WeeklySummaryResponse>(this.weeklyEndpoint, { headers, params })
      .subscribe({
        next: (data) => {
          this.dailySummary = data.dailySummary || {};
          this.weeklyTotal = data.weeklyTotal || '00:00:00';
          this.users = data.users || [];
          
          if (this.selectedUserId === null && userId === null) {
            const apiSelectedUserId = data.selectedUserId || null;
            this.selectedUserId = apiSelectedUserId;
            if (apiSelectedUserId && data.users) {
              const selectedUser = data.users.find(user => user.id === apiSelectedUserId);
              if (selectedUser) {
                this.selectedUserName = selectedUser.name;
              }
            }
          }
          
          this.errorMessage = '';
          this.loading = false;
        },
        error: (error) => {
          if (error.status === 401) {
            window.location.href = '/login';
          } else if (error.status === 400 || error.status === 404) {
            this.errorMessage = error.error.detail || 'Wystąpił błąd podczas pobierania danych.';
          } else {
            this.errorMessage = 'Nie udało się pobrać danych podsumowania.';
          }
          console.error('Error:', error);
          this.loading = false;
        }
      });
  }

  handleUserSelect(user: User): void {
    this.selectedUserId = user.id;
    this.selectedUserName = user.name;
    this.isDropdownOpen = false;
    this.fetchWeeklySummary(user.id);
  }

  handleWeekChange(offsetChange: number): void {
    this.weekOffset += offsetChange;
    this.fetchWeeklySummary();
  }


  get filteredUsers(): User[] {
    const searchTerm = this.searchForm.get('searchTerm')?.value || '';
    return this.users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  formatDate(dateString: string): string {
    return this.utils.formatDate(dateString);
  }
}
