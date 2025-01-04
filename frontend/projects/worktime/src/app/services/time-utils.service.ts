import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeUtilsService {
  formatTime(seconds: number): string {
    seconds = parseInt(seconds.toString(), 10) || 0;

    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);

    const paddedHours = hours < 10 ? '0' + hours : hours;
    const paddedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const paddedSeconds = secs < 10 ? '0' + secs : secs;

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  timeStringToSeconds(timeString: string): number {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return (hours * 3600) + (minutes * 60) + seconds;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
