import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { Toast, ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private ngxToaster: ToastrService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    console.log(route["_routerState"]["url"]);

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
        this.ngxToaster.warning(
          "Your session has timed out. Please log in again to continue."
        );
        this.router.navigate(["navbar/session-time-out"]);
        return false;
      }
    }
  }
}
