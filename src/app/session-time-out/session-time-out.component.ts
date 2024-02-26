import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CoreService } from "../core.service";
import { AuthService } from "../auth/auth.service";

@Component({
  selector: "app-session-time-out",
  templateUrl: "./session-time-out.component.html",
  styleUrls: ["./session-time-out.component.scss"],
})
export class SessionTimeOutComponent implements OnInit {
  constructor(
    private router: Router,
    private coreService: CoreService,
    private authService: AuthService
  ) {}

  primaryColor = "var(--primary-color)";
  userActions = [{ name: "Login" }];

  loggedInUserName = "User";

  get profileOptions() {
    return this.userActions;
  }

  ngOnInit(): void {
    this.coreService.removeLoadingScreen();
  }

  goToLoginPage() {
    this.authService.userDataSub.next(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("licenseCountry");
    localStorage.removeItem("selectedApplication");
    localStorage.clear();
    this.router.navigate(["login"]);
  }

  onSubmit() {
    this.router.navigate(["login"]);
  }
}
