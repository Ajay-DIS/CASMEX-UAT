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
    if (this.authService.isLoggedIn()) {
      console.log("AUTHORIZED");
      if (route["routeConfig"]["path"] == "login") {
        console.log("try to go login");
        this.router.navigate(["/dashboard"]);
        return true;
      }
      if (route["routeConfig"]["path"] == "session-time-out") {
        console.log("try to go sessiontimeout");
        this.router.navigate(["/dashboard"]);
        return true;
      }
      if (route["routeConfig"]["path"] == "dashboard") {
        console.log("try to go dashboard");
        return true;
      } else {
        // FOR ALL OTHER  ROUTES -- AUTHORIZED
        if (localStorage.getItem("selectedApplication")) {
          console.log("authorized and selectedApp");
          return true;
        } else {
          console.log("authorized and no selectedApp");
          this.router.navigate(["/dashboard"]);
          return false;
        }
      }
    } else {
      console.log("NOT AUTHORIZED");
      if (route["routeConfig"]["path"] == "login") {
        console.log("try to go login");
        return true;
      }
      if (route["routeConfig"]["path"] == "session-time-out") {
        console.log("try to go sessiontimeout");
        return true;
      }

      // FOR ALL OTHER CASES
      this.coreService.userActionsObs.next([{ name: "Login" }]);
      this.coreService.showWarningToast(
        "Your session has timed out. Please log in again to continue."
      );
      this.router.navigate(["session-time-out"]);
      return false;
    }
  }
}

// if (route["routeConfig"]["path"] == "login" && this.authService.isLoggedIn()) {
//   console.log("authorized but try to login");
//   this.router.navigate(["/dashboard"]);
//   return true;
// } else {
//   if (route["routeConfig"]["path"] == "login") {
//     console.log("want to login");
//     return true;
//   } else if (route["_routerState"]["url"] == "session-time-out") {
//     console.log("session timed out");
//     return true;
//   } else if (this.authService.isLoggedIn()) {
//     console.log("authorized");
//     if (route["routeConfig"]["path"] == "dashboard") {
//       console.log("want to go dashboard");
//       return true;
//     } else {
//       if (localStorage.getItem("selectedApplication")) {
//         console.log("authorized and selectedApp");
//         return true;
//       } else {
//         console.log("authorized and no selectedApp");
//         this.router.navigate(["/dashboard"]);
//         return true;
//       }
//     }
//   } else {
//     console.log("unauthorized");
//     this.coreService.userActionsObs.next([{ name: "Login" }]);
//     this.coreService.showWarningToast(
//       "Your session has timed out. Please log in again to continue."
//     );
//     this.router.navigate(["session-time-out"]);
//     return false;
//   }
// }
