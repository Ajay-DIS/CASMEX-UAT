import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { take } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { CoreService } from "../core.service";
import { LoginFormData, LoginService } from "./login.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm!: UntypedFormGroup;
  isFormInvalid = false;
  loggedInUserData = {
    username: "yogeshm",
    password: "test@123",
    application: "CASMEX_CORE",
  };
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private loginService: LoginService,
    private coreService: CoreService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
    this.authService.clearOldTimers();
  }

  setSession() {}

  onSubmit() {
    if (this.loginForm.valid) {
      this.coreService.displayLoadingScreen();
      this.isFormInvalid = false;
      const formData: LoginFormData = {
        application: "CASMEX_CORE",
        ...this.loginForm.value,
      };

      this.loginService
        .loginUser(formData)
        .pipe(take(1))
        .subscribe(
          (data: any) => {
            if (data && data.jwt) {
              console.log("::user", data);
              this.loginService.saveLoggedUserInfo(data);
              this.router.navigate(["/navbar"]);
              this.coreService.showSuccessToast("Login Successfull");
            } else {
              data["msg"] && this.coreService.showWarningToast(data["msg"]);

              this.coreService.removeLoadingScreen();
            }
          },
          (err) => {
            console.log(err);
            this.coreService.removeLoadingScreen();
          }
        )
        .add(() => {});
    } else {
      this.isFormInvalid = true;
    }
  }

  onReset() {
    this.loginForm.reset();
  }
}
