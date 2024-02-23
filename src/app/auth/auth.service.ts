import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { CoreService } from "../core.service";
import { User } from "./user.model";
import { BnNgIdleService } from "bn-ng-idle";
import { take } from "rxjs/operators";
import { LoginService } from "../login/login.service";
import { HttpClient } from "@angular/common/http";
import { UserIdleService } from "angular-user-idle";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private router: Router,
    private coreService: CoreService,
    private bnidle: BnNgIdleService,
    private http: HttpClient,
    private userIdle: UserIdleService
  ) {}

  userDataSub = new BehaviorSubject<User>(null);
  showSessionConfirm = new BehaviorSubject<{ status: boolean; timer?: any }>({
    status: false,
  });

  clearTimer: any;
  clearWarningTimer: any;

  $onTimerStart: any;
  $onTimeOut: any;
  $ping: any;

  isLoggedIn() {
    return !!localStorage.getItem("userData");
  }

  logout() {
    this.clearTimers();
    this.stopWatching();
    this.coreService.userActionsObs.next([{ name: "Login" }]);
    this.userDataSub.next(null);
    this.showSessionConfirm.next({ status: false });
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("licenseCountry");
    this.coreService.showWarningToast(
      "Your session has timed out. Please log in again to continue."
    );
    this.router.navigate(["navbar/session-time-out"]);
  }

  autoLogout(expiryTimer: any) {
    if (expiryTimer <= 0) {
      this.logout();
    } else {
      this.sessionTimeoutWarning(expiryTimer);
      this.clearTimer = setTimeout(() => {
        this.logout();
      }, expiryTimer);
    }
  }

  clearTimers() {
    if (this.clearTimer) {
      clearInterval(this.clearTimer);
    }
    if (this.clearWarningTimer) {
      clearInterval(this.clearWarningTimer);
    }
  }

  sessionTimeoutWarning(expiryTimer: any) {
    if (expiryTimer >= 120000) {
      this.clearWarningTimer = setTimeout(() => {
        this.showSessionConfirm.next({ status: true, timer: "2 Minutes" });
      }, expiryTimer - 120000);
    } else {
      let remainTime =
        expiryTimer / 1000 > 60
          ? `${Math.floor(expiryTimer / (1000 * 60))} Minute`
          : `less than 1 Minute`;
      this.showSessionConfirm.next({ status: true, timer: remainTime });
    }
  }

  autoLogin() {
    let userData: {
      useRole: string;
      userGroup: string;
      userId: string;
      userName: string;
      _token: string;
      expirationDate: number;
    } = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
      return;
    }

    let user = new User(
      userData["useRole"],
      userData["userGroup"],
      userData["userId"],
      userData["userName"],
      userData["_token"],
      userData["expirationDate"]
    );

    if (userData["expirationDate"] - new Date().getTime() <= 0) {
      this.logout();
    } else {
      this.refreshTokenLogin();
    }
  }

  refreshTokenLogin() {
    this.refreshAuthToken({
      // application: "CASMEX_CORE",
      username: "yogeshm",
      password: "test@123",
    })
      .pipe(take(1))
      .subscribe(
        (data: any) => {
          if (data && data.jwt) {
            this.refreshUserSessionToken(data.jwt);
          } else {
            data["msg"] && this.coreService.showWarningToast(data["msg"]);
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  refreshUserSessionToken(token: any) {
    let expiry = JSON.parse(atob(token.split(".")[1])).exp;
    let user = JSON.parse(localStorage.getItem("userData"));
    let loggedUser = new User(
      user["useRole"],
      user["userGroup"],
      user["userId"],
      user["userName"],
      token,
      new Date(expiry * 1000).getTime()
    );

    this.userDataSub.next(loggedUser);
    this.coreService.userActionsObs.next([
      { name: "Profile" },
      { name: "Logout" },
    ]);
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(loggedUser));
  }

  refreshAuthToken(data: any) {
    return this.http.post(`/login/loginController/refreshToken`, data);
  }

  // % USER IDLENESS DETECTOR

  startUserIdleDetector() {
    //Start watching for user inactivity.
    this.startWatching();

    // Start watching when user idle is starting.
    this.$onTimerStart = this.onTimerStart().subscribe((count) => {
      if (count == 1) {
        if (this.isLoggedIn()) {
          this.clearTimers();
          this.sessionTimeoutWarning(120000);
        }
      }
    });

    // Start watch when time is up.
    this.$onTimeOut = this.onTimeout().subscribe(() => {
      if (this.isLoggedIn()) {
        this.logout();
      }
    });

    // Refresh Token.
    this.$ping = this.userIdle.ping$.pipe(take(1)).subscribe(() => {
      if (this.isLoggedIn()) {
        this.refreshTokenLogin();
      }
    });
  }

  stopTimer() {
    this.userIdle.stopTimer();
  }

  onTimerStart() {
    return this.userIdle.onTimerStart();
  }

  onTimeout() {
    return this.userIdle.onTimeout();
  }
  onUserIdleStatusChange() {
    return this.userIdle.onIdleStatusChanged();
  }

  stopWatching() {
    this.$onTimeOut?.unsubscribe();
    this.$onTimerStart?.unsubscribe();
    this.$ping?.unsubscribe();
    this.userIdle.stopWatching();
  }

  startWatching() {
    this.userIdle.startWatching();
  }

  restartTimer() {
    this.userIdle.resetTimer();
  }

  checkIfWatching() {
    return this.userIdle.ping$;
  }

  // % USER IDLENESS DETECTOR END
}
