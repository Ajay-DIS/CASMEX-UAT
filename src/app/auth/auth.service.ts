import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject } from "rxjs";
import { CoreService } from "../core.service";
import { User } from "./user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private ngxToaster: ToastrService,
    private router: Router,
    private coreService: CoreService
  ) {}

  userDataSub = new BehaviorSubject<User>(null);

  clearTimer: any;

  isLoggedIn() {
    return !!localStorage.getItem("userData");
  }

  logout() {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
    }

    this.coreService.userActionsObs.next([{ name: "Login" }]);
    this.userDataSub.next(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    this.ngxToaster.warning(
      "Your session has timed out. Please log in again to continue."
    );
    this.router.navigate(["navbar/session-time-out"]);
  }

  autoLogout(expiryTimer: any) {
    console.log("expire in ", expiryTimer / 1000, "sec");
    this.clearTimer = setTimeout(() => {
      this.logout();
    }, expiryTimer);
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
