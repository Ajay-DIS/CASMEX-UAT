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
import { UserIdleService } from "angular-user-idle";

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

    this.authService.userDataSub.subscribe((user) => {
      console.log("::user", user);
      if (!user) {
        this.authService.stopWatching();
      } else {
        this.authService.startUserIdleDetector();
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
        this.authService.clearTimers();
        this.authService.stopTimer();
        // this.authService.startUserIdleDetector();
      },
      reject: () => {
        this.logout();
      },
    });
  }

  logout() {
    this.authService.clearTimers();
    this.authService.stopWatching();
    this.authService.userDataSub.next(null);
    this.authService.showSessionConfirm.next({ status: false });
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    this.coreService.showSuccessToast("Logged Out Successfully.");
    this.router.navigate(["login"]);
  }
}
