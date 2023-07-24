import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { ConfirmDialog } from "primeng/confirmdialog";
import { take } from "rxjs/operators";
import { AuthService } from "./auth/auth.service";
import { CoreService } from "./core.service";
import { LoginService } from "./login/login.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  providers: [ConfirmationService],
})
export class AppComponent implements OnInit, AfterContentChecked {
  constructor(
    private router: Router,
    private ref: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private coreService: CoreService,
    private authService: AuthService,
    private loginService: LoginService
  ) {}
  title = "casmex";

  @ViewChild("cd") cd: ConfirmDialog;

  blocked: boolean;

  ngOnInit() {
    this.coreService.$loadingScreen.subscribe((isLoading) => {
      this.blocked = isLoading;
    });

    this.authService.autoLogin();

    this.authService.showSessionConfirm.subscribe((res) => {
      console.log("::tokenexpiring", res);
      if (res.status) {
        this.confirmSessionContinuity(res.timer);
      } else {
        this.cd && this.cd.hide();
      }
    });
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  confirmSessionContinuity(timer: any) {
    this.confirmationService.confirm({
      message: `Your session is expiring in ${timer}, you want to continue ?`,
      key: "sessionConfirm",
      accept: () => {
        this.refreshTokenLogin();
        this.authService.clearOldTimers();
        this.authService.resetUserIdlenessTimer(1680);
      },
      reject: () => {
        this.logout();
      },
    });
  }

  refreshTokenLogin() {
    this.loginService
      .refreshAuthToken({
        application: "CASMEX_CORE",
        username: "yogeshm",
        password: "test@123",
      })
      .pipe(take(1))
      .subscribe(
        (data: any) => {
          if (data && data.jwt) {
            console.log("::refreshToken", data);
            this.loginService.refreshUserSessionToken(data.jwt);
            // this.coreService.showSuccessToast("Session extended successfully");
          } else {
            data["msg"] && this.coreService.showWarningToast(data["msg"]);
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  logout() {
    this.authService.clearOldTimers();
    this.authService.stopUserIdlenessTimer();
    this.authService.userDataSub.next(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    this.coreService.showSuccessToast("Logged Out Successfully.");
    this.router.navigate(["login"]);
  }
}
