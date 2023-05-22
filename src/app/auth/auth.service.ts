import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { CoreService } from "../core.service";
import { User } from "./user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private router: Router,
    private coreService: CoreService
  ) {}

  userDataSub = new BehaviorSubject<User>(null);
  showSessionConfirm = new BehaviorSubject<{ status: boolean; timer?: any }>({
    status: false,
  });

  clearTimer: any;
  clearWarningTimer: any;

  isLoggedIn() {
    return !!localStorage.getItem("userData");
  }

  logout() {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
    }
    if (this.clearWarningTimer) {
      clearTimeout(this.clearWarningTimer);
    }
    this.showSessionConfirm.next({ status: false });
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
    console.log("expire in ", expiryTimer / 1000, "sec");
    this.sessionTimeoutWarning(expiryTimer);
    this.clearTimer = setTimeout(() => {
      this.logout();
    }, expiryTimer);
  }

  sessionTimeoutWarning(expiryTimer: any) {
    if (expiryTimer >= 120000) {
      this.clearWarningTimer = setTimeout(() => {
        this.showSessionConfirm.next({ status: true, timer: "2 Minutes" });
      }, expiryTimer - 120000);
    } else {
      if (expiryTimer <= 0 && clearTimeout) {
        this.showSessionConfirm.next({ status: false });
        clearTimeout(this.clearWarningTimer);
      } else {
        let remainTime =
          expiryTimer / 1000 > 60
            ? `${Math.floor(expiryTimer / (1000 * 60))} Minute`
            : `less than 1 Minute`;
        this.showSessionConfirm.next({ status: true, timer: remainTime });
      }
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

    if (user.token) {
      this.userDataSub.next(user);
    }

    this.autoLogout(userData["expirationDate"] - new Date().getTime());
  }
}
