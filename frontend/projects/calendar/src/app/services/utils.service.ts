import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
