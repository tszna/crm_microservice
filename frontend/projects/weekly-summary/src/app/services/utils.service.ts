import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    const dateObj = new Date(+year, +month - 1, +day);
    return dateObj.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
