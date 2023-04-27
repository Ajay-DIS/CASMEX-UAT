import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ConfirmationService } from "primeng/api";
import { ConfirmDialog } from "primeng/confirmdialog";
import { take } from "rxjs/operators";
import { AuthService } from "./auth/auth.service";
import { CoreService } from "./core.service";
import { LoginService } from "./login/login.service";
import { BnNgIdleService } from "bn-ng-idle";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  providers: [ConfirmationService],
})
export class AppComponent implements OnInit, AfterContentChecked {
  constructor(
    private router: Router,
    private ngxToaster: ToastrService,
    private ref: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private coreService: CoreService,
    private authService: AuthService,
    private loginService: LoginService,
    private bnidle: BnNgIdleService
  ) {}
  title = "casmex";

  @ViewChild("cd") cd: ConfirmDialog;

  blocked: boolean;

  ngOnInit() {
    this.authService.autoLogin();
    this.coreService.$loadingScreen.subscribe((isLoading) => {
      this.blocked = isLoading;
    });
    this.authService.showSessionConfirm.subscribe((res) => {
      let i = 1;
      console.log( res.status)
    
      if(res.status){
        console.log('expire+movement')
       this.refreshTokenLogin();
      } 
      this.bnidle.startWatching(1500).subscribe((isTimedOut:boolean) => {
       console.log(isTimedOut , res.status)
        if (isTimedOut && res.status) {
          console.log("expire+nomovement")
          this.confirmSessionContinuity(res.timer);
          this.bnidle.stopTimer();
        }
        else {
          this.cd && this.cd.hide();
        }
      })
      // if (res.status) {
      //   this.confirmSessionContinuity(res.timer);
      // } else {
      //   this.cd && this.cd.hide();
      // }
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
      },
      reject: () => {
        this.logout();
      },
    });
  }

  refreshTokenLogin() {
    this.coreService.displayLoadingScreen();
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
            if (this.authService.clearTimer) {
              clearTimeout(this.authService.clearTimer);
            }
            if (this.authService.clearWarningTimer) {
              clearTimeout(this.authService.clearWarningTimer);
            }
            this.loginService.refreshUserSessionToken(data.jwt);
            this.ngxToaster.success("Session extended successfully");
          } else {
            data["msg"] && this.ngxToaster.warning(data["msg"]);
          }
        },
        (err) => {
          console.log(err);
        }
      )
      .add(() => {
        this.coreService.removeLoadingScreen();
      });
  }

  logout() {
    if (this.authService.clearTimer) {
      clearTimeout(this.authService.clearTimer);
    }
    if (this.authService.clearWarningTimer) {
      clearTimeout(this.authService.clearWarningTimer);
    }
    this.authService.userDataSub.next(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    this.ngxToaster.success("Logged Out Successfully.");
    this.router.navigate(["login"]);
  }
}
