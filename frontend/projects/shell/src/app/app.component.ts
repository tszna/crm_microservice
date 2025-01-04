import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-shell-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('backgroundVideo') backgroundVideoRef!: ElementRef<HTMLVideoElement>;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const allowedPaths = ['/', '/auth'];
    if (!this.authService.isLoggedIn() && !allowedPaths.includes(window.location.pathname)) {
      this.router.navigate(['/auth']);
    }
  }

  ngAfterViewInit(): void {
    const videoEl = this.backgroundVideoRef.nativeElement;
    videoEl.muted = true;

    const playPromise = videoEl.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Wideo jest ok.');
        })
        .catch((error) => {
          console.warn('Przeglądarka zablokowała autoplay:', error);
        });
    }
  }

  logout() {
    this.authService.logout();
  }
}

