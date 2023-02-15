import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isFormInvalid = false;
  loggedInUserData = {
    "username": "yogeshm",
    "password": "test@123",
    "application": "CASMEX_CORE"
  }
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private ngxToaster: ToastrService, authService: AuthService,
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  setSession() {

  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isFormInvalid = false;
      const formData = {application: 'CASMEX_CORE', ...this.loginForm.value}
      this.httpClient.post(environment.baseUrl + '/login', formData)
        .subscribe(
          (data: any) => {
            if (data && data.jwt) {
              localStorage.setItem('token', data.jwt);
              localStorage.setItem('menuItems', JSON.stringify(data.menuItemTree))
              this.router.navigate(['/navbar/payment-mode']);
              this.ngxToaster.success('Login is successfull')
            } else {
              localStorage.removeItem('token');
              this.ngxToaster.error(data.msg)
            }
          }
        );
    } else {
      this.isFormInvalid = true;
    }
  }

  onReset() {
    this.loginForm.reset();
  }
}
