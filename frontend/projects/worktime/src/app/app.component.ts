import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getTimeEndpoint } from '../../../shared/config';
import { TimeUtilsService } from './services/time-utils.service';

interface SessionResponse {
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  countTime?: string;
  start_time?: string;
  end_time?: string;
  count_time?: string;
  elapsed_time?: string;
}

@Component({
  selector: 'app-worktime-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  currentDate: string = '';
  initialLoading: boolean = true;
  actionLoading: boolean = false;
  isActive: boolean = false;
  startTime: string = '-';
  endTime: string = '-';
  currentTime: string = '00:00:00';
  
  private initialCountTime: number = 0;
  private initialTimestamp: number = Date.now();
  private interval: any;

  constructor(
    private http: HttpClient,
    private timeUtils: TimeUtilsService
  ) {}

  ngOnInit() {
    this.setCurrentDate();
    this.fetchCurrentSession();
    this.setupTimer();
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private setCurrentDate() {
    const today = new Date();
    this.currentDate = today.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }



  private setupTimer() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    if (this.actionLoading || this.initialLoading) return;

    if (this.isActive) {
      this.interval = setInterval(() => {
        const elapsedSeconds = this.initialCountTime + 
          Math.floor((Date.now() - this.initialTimestamp) / 1000);
        this.currentTime = this.timeUtils.formatTime(elapsedSeconds);
      }, 1000);
    } else {
      this.currentTime = this.timeUtils.formatTime(this.initialCountTime);
    }
  }


  fetchCurrentSession() {
    const token = this.timeUtils.getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    this.http.get<SessionResponse>(getTimeEndpoint('currentSession'), { headers })
      .subscribe({
        next: (data) => {
          if (data) {
            this.isActive = data.isActive;
            this.startTime = data.startTime || '-';
            this.endTime = data.endTime || (data.isActive ? 'czas jest w trakcie liczenia' : '-');
            this.initialCountTime = parseInt(data.countTime || '0', 10);
            this.initialTimestamp = Date.now();
          this.currentTime = this.timeUtils.formatTime(this.initialCountTime);
          } else {
            this.resetSession();
          }
        },
        error: (error) => {
          if (error.status === 401) {
            window.location.href = '/login';
          } else if (error.status === 204) {
            this.resetSession();
          } else {
            console.error('Error:', error);
            alert('Wystąpił błąd podczas ładowania danych.');
          }
        },
        complete: () => {
          this.initialLoading = false;
          this.setupTimer();
        }
      });
  }

  private resetSession() {
    this.isActive = false;
    this.currentTime = '00:00:00';
    this.startTime = '-';
    this.endTime = '-';
    this.initialCountTime = 0;
    this.initialTimestamp = Date.now();
  }

  startSession() {
    this.actionLoading = true;
    const token = this.timeUtils.getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    this.http.post<SessionResponse>(getTimeEndpoint('startSession'), {}, { headers })
      .subscribe({
        next: (data) => {
          this.isActive = true;
          this.startTime = data.start_time || '-';
          this.endTime = 'czas jest w trakcie liczenia';
          this.initialCountTime = parseInt(data.count_time || '0', 10);
          this.initialTimestamp = Date.now();
          this.currentTime = this.timeUtils.formatTime(this.initialCountTime);
        },
        error: (error) => {
          if (error.status === 401) {
            window.location.href = '/login';
          } else {
            console.error('Error:', error);
            alert(error.error?.detail || 'Wystąpił błąd podczas rozpoczynania sesji.');
          }
        },
        complete: () => {
          this.actionLoading = false;
          this.setupTimer();
        }
      });
  }

  stopSession() {
    this.actionLoading = true;
    const token = this.timeUtils.getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    this.http.post<SessionResponse>(getTimeEndpoint('stopSession'), {}, { headers })
      .subscribe({
        next: (data) => {
          this.isActive = false;
          this.endTime = data.end_time || '-';
          this.initialCountTime = this.timeUtils.timeStringToSeconds(data.elapsed_time || '') || this.initialCountTime;
          this.currentTime = data.elapsed_time || this.timeUtils.formatTime(this.initialCountTime);
        },
        error: (error) => {
          if (error.status === 401) {
            window.location.href = '/login';
          } else {
            console.error('Error:', error);
            alert(error.error?.detail || 'Wystąpił błąd podczas zatrzymywania sesji.');
          }
        },
        complete: () => {
          this.actionLoading = false;
          this.setupTimer();
        }
      });
  }
}
