import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "../auth/auth.service";
import { BankRoutingService } from "../banks-routing/bank-routing.service";
import { CoreService } from "../core.service";
import { LoginFormData, LoginService } from "./login.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isFormInvalid = false;
  loggedInUserData = {
    username: "yogeshm",
    password: "test@123",
    application: "CASMEX_CORE",
  };
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private ngxToaster: ToastrService,
    private loginService: LoginService,
    private coreService: CoreService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
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
        .subscribe(
          (data: any) => {
            if (data && data.jwt) {
              console.log("::user", data);
              this.loginService.saveLoggedUserInfo(data);
              this.router.navigate(["/navbar"]);
              this.ngxToaster.success("Login Successfull");
            } else {
              // this.authService.isUserAuthenticated.next(false)
              // localStorage.removeItem("token");
              // this.ngxToaster.error(data.msg);
              // this.router.navigate(["/login"]);
              data['msg'] && this.ngxToaster.warning(data['msg'])
            }
          },
          (err) => {
            console.log(err);
          }
        )
        .add(() => {
          this.coreService.removeLoadingScreen();
        });
    } else {
      this.isFormInvalid = true;
    }
  }

  onReset() {
    this.loginForm.reset();
  }
}
