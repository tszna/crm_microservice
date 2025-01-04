import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-auth-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  errorMessage: string = '';
  registerError: string = '';
  passwordVisible: boolean = false;
  registerPasswordVisible: boolean = false;
  isRegisterActive: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
    this.initializeForms();
  }

  private initializeForms() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleRegisterPassword() {
    this.registerPasswordVisible = !this.registerPasswordVisible;
  }

  toggleRegister(event: Event) {
    event.preventDefault();
    this.isRegisterActive = !this.isRegisterActive;
    this.errorMessage = '';
    this.registerError = '';
    this.loginForm.reset();
    this.registerForm.reset();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value)
        .subscribe({
          next: (response) => {
            this.authService.setToken(response.token);
            this.router.navigate(['/']);
          },
          error: (error: HttpErrorResponse) => {
            this.errorMessage = error.error?.message || 'Błąd logowania. Sprawdź dane i spróbuj ponownie.';
            console.error('Login error:', error);
          }
        });
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.registerError = '';
      
      this.authService.register(this.registerForm.value)
        .subscribe({
          next: () => {
            this.authService.login(this.registerForm.value)
              .subscribe({
                next: (response) => {
                  this.authService.setToken(response.token);
                  this.router.navigate(['/']);
                },
                error: (error: HttpErrorResponse) => {
                  this.registerError = error.error?.message || 'Błąd logowania po rejestracji. Spróbuj zalogować się ręcznie.';
                  console.error('Login after register error:', error);
                }
              });
          },
          error: (error: HttpErrorResponse) => {
            this.registerError = error.error?.message || 'Błąd rejestracji. Spróbuj ponownie lub użyj innego adresu email.';
            console.error('Register error:', error);
          }
        });
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get registerEmail() {
    return this.registerForm.get('email');
  }

  get registerPassword() {
    return this.registerForm.get('password');
  }
}
