import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login-component',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);


  public errorMessage = signal('');
  public showPassword = signal(false);
  public isLoading = signal(false);
  public loginForm!: FormGroup;


  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    })
  }


  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }


  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return
    }

    this.isLoading.set(true);



    try {
      this.authService.login(this.email?.value, this.password?.value).subscribe({
        next: (resp) => {
          setTimeout(() => {
            this.isLoading.set(false);
            this.authService.setUser(resp.user, resp.token)
            this.router.navigate(['/home/dashboard']);
          }, 3000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error.error);
        }
      })

    } catch (err) {
      this.errorMessage.set('Error inesperado. Intenta nuevamente.');
    }
  }


  togglePassword() {
    this.showPassword.update(value => !value);
  }
}
