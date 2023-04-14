import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from "@angular/common/http";
import { EMPTY, Observable, of } from "rxjs";
import { AuthService } from "./auth/auth.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CoreService } from "./core.service";
import { environment } from "src/environments/environment";

@Injectable()
export class HttpInterceptorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private ngxToaster: ToastrService,
    private coreService: CoreService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (
      !this.authService.isLoggedIn() &&
      request["url"] == `/login/loginController/login`
    ) {
      console.log("auth not needed", request);
      return next.handle(request);
    } else if (!this.authService.isLoggedIn()) {
      this.coreService.userActionsObs.next([{ name: "Login" }]);
      console.log("not authorized", request);
      this.ngxToaster.warning(
        "Your session has timed out. Please log in again to continue."
      );
      this.router.navigate(["navbar/session-time-out"]);
      return EMPTY;
    } else {
      const token = localStorage.getItem("token");
      return next.handle(
        request.clone({
          setHeaders: { Authorization: `${token}` },
        })
      );
    }
  }
}
