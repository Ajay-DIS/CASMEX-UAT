import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { CoreService } from "../core.service";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private coreService: CoreService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (
      route["routeConfig"]["path"] == "login" &&
      this.authService.isLoggedIn()
    ) {
      console.log("authorized but try to login");
      this.router.navigate(["navbar/bank-routing"]);
      return true;
    } else {
      if (route["routeConfig"]["path"] == "login") {
        console.log("want to login");
        return true;
      } else if (route["_routerState"]["url"] == "/navbar/session-time-out") {
        console.log("session timed out");
        return true;
      } else if (this.authService.isLoggedIn()) {
        console.log("authorized");
        return true;
      } else {
        console.log("unauthorized");
        this.coreService.userActionsObs.next([{ name: "Login" }]);
        this.coreService.showWarningToast(
          "Your session has timed out. Please log in again to continue."
        );
        this.router.navigate(["navbar/session-time-out"]);
        return false;
      }
    }
  }
}
