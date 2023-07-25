import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { CoreService } from "../core.service";
import { User } from "./user.model";
import { BnNgIdleService } from "bn-ng-idle";
import { take } from "rxjs/operators";
import { LoginService } from "../login/login.service";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private router: Router,
    private coreService: CoreService,
    private bnidle: BnNgIdleService,
    private http: HttpClient
  ) {}

  userDataSub = new BehaviorSubject<User>(null);
  showSessionConfirm = new BehaviorSubject<{ status: boolean; timer?: any }>({
    status: false,
  });

  clearTimer: any;
  clearWarningTimer: any;

  mandateRefreshTokenTimer: any;

  mandateRefreshToken(timer: any) {
    this.mandateRefreshTokenTimer = setTimeout(() => {
      console.log("::mandateRefreshToken", timer);
      this.refreshToken();
    }, timer);
  }

  refreshToken() {
    this.refreshAuthToken({
      application: "CASMEX_CORE",
      username: "yogeshm",
      password: "test@123",
    })
      .pipe(take(1))
      .subscribe(
        (data: any) => {
          if (data && data.jwt) {
            console.log("::refreshToken", data);
            this.refreshUserSessionToken(data.jwt);
          } else {
            data["msg"] && console.log(data["msg"]);
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
    console.log(user);
    let loggedUser = new User(
      user["useRole"],
      user["userGroup"],
      user["userId"],
      user["userName"],
      token,
      new Date(expiry * 1000).getTime()
    );
    console.log("updatedUSer", loggedUser);
    console.log(
      "updatedTimer",
      new Date(expiry * 1000).getTime() - new Date().getTime()
    );
    // this.authService.autoLogout(
    //   new Date(expiry * 1000).getTime() - new Date().getTime()
    // );
    this.mandateRefreshToken(
      new Date(expiry * 1000).getTime() - (new Date().getTime() + 60000)
    );
    this.userDataSub.next(loggedUser);
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(loggedUser));

    this.startCheckingUserIdleness(1680).subscribe((isTimedOut: boolean) => {
      console.log("::userIDle", isTimedOut);
      if (isTimedOut) {
        // this.clearOldTimers();
        this.autoLogout(120000);
      }
    });
  }

  refreshAuthToken(data: any) {
    return this.http.post(`/login/loginController/refreshToken`, data);
  }

  isLoggedIn() {
    return !!localStorage.getItem("userData");
  }

  logout() {
    this.clearOldTimers();
    this.stopUserIdlenessTimer();
    this.coreService.userActionsObs.next([{ name: "Login" }]);
    this.userDataSub.next(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    this.coreService.showWarningToast(
      "Your session has timed out. Please log in again to continue."
    );
    this.router.navigate(["navbar/session-time-out"]);
  }

  autoLogout(expiryTimer: any) {
    console.log("::expire in ", expiryTimer / 1000, "sec");
    if (expiryTimer <= 0) {
      this.logout();
    } else {
      this.sessionTimeoutWarning(expiryTimer);
      this.clearTimer = setTimeout(() => {
        this.logout();
      }, expiryTimer);
    }
  }

  sessionTimeoutWarning(expiryTimer: any) {
    if (expiryTimer >= 120000) {
      this.clearWarningTimer = setTimeout(() => {
        console.log("::expires in", expiryTimer - 120000);
        this.showSessionConfirm.next({ status: true, timer: "2 Minutes" });
      }, expiryTimer - 120000);
    } else {
      let remainTime =
        expiryTimer / 1000 > 60
          ? `${Math.floor(expiryTimer / (1000 * 60))} Minute`
          : `less than 1 Minute`;
      this.showSessionConfirm.next({ status: true, timer: remainTime });
      console.log("::expires in", remainTime);
    }
  }

  clearOldTimers() {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
    }
    if (this.clearWarningTimer) {
      clearTimeout(this.clearWarningTimer);
    }
    this.showSessionConfirm.next({ status: false });
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

    if (user.token) {
      this.userDataSub.next(user);
    }

    this.startCheckingUserIdleness(1680).subscribe((isTimedOut: boolean) => {
      console.log("::userIDle", isTimedOut);
      if (isTimedOut) {
        // this.clearOldTimers();
        this.autoLogout(120000);
      }
    });

    // this.autoLogout(userData["expirationDate"] - new Date().getTime());
    if (userData["expirationDate"] - new Date().getTime() <= 0) {
      console.log("expired");
      this.logout();
    } else {
      console.log(
        "expiring in ",
        userData["expirationDate"] - (new Date().getTime() + 60000)
      );
      this.mandateRefreshToken(
        userData["expirationDate"] - (new Date().getTime() + 60000)
      );
    }
  }

  startCheckingUserIdleness(timer: any) {
    return this.bnidle.startWatching(timer);
  }

  resetUserIdlenessTimer(timer: any = 1680) {
    this.bnidle.resetTimer(timer);
  }

  stopUserIdlenessTimer() {
    this.bnidle.stopTimer();
  }
}
