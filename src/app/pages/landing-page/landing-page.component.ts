import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AuthService } from "src/app/auth/auth.service";
import { CoreService } from "src/app/core.service";
import { LoginService } from "src/app/login/login.service";

@Component({
  selector: "app-landing-page",
  templateUrl: "./landing-page.component.html",
  styleUrls: ["./landing-page.component.scss"],
})
export class LandingPageComponent implements OnInit {
  constructor(
    public translate: TranslateService,
    private el: ElementRef,
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private loginService: LoginService
  ) {}

  primaryColor = "var(--primary-color)";
  userActions = [{ name: "Profile" }, { name: "Logout" }];
  themeOptions = [
    { name: "Blue", color: "#4759e4" },
    { name: "Green", color: "#029a71" },
    { name: "Purple", color: "#6a0aa2" },
    { name: "Magenta", color: "#007491" },
    // { name: "Amber", color: "#ffbf00" },
    // { name: "Pink", color: "#ffc0cb" },
  ];
  selectedTheme = { name: "Blue", color: "#4759e4" };

  isStickyHeader = false;

  loggedInUserName = "User";
  loggedInUserCode = null;

  get profileOptions() {
    return this.userActions;
  }

  allApplicationsTilesData: any = [];

  eligibleApplications: any = [];
  selectedEligibleApp: any = { code: "def", codeName: "def" };

  ngOnInit(): void {
    this.coreService.removeLoadingScreen();
    const selectedApplication = JSON.parse(
      localStorage.getItem("selectedApplication")
    );
    if (selectedApplication) this.selectedEligibleApp = selectedApplication;
    this.eligibleApplications = JSON.parse(
      localStorage.getItem("eligibleApplicationsForUser")
    );

    this.loggedInUserName =
      (localStorage.getItem("userData") &&
        JSON.parse(localStorage.getItem("userData"))["userName"]) ||
      "User";

    this.loggedInUserCode =
      localStorage.getItem("userData") &&
      JSON.parse(localStorage.getItem("userData"))["userCode"];

    if (selectedApplication) {
      console.log(":::selectedApplication", selectedApplication);
      this.goIntoApplication(selectedApplication);
    }
  }

  goIntoApplication(app: any) {
    if (app && app.eligibleApp) {
      localStorage.setItem("selectedApplication", JSON.stringify(app));
      this.coreService.displayLoadingScreen();
      console.log(":::app", app);
      this.loginService
        .getAppModuleData(this.loggedInUserCode, app.code)
        .subscribe(
          (res) => {
            if (!(res["application"] || res["module"] || res["menuItemTree"])) {
              this.coreService.removeLoadingScreen();
              this.coreService.showWarningToast(
                "Data Not Available for Selected Application"
              );
            } else {
              this.loginService.saveUserSelectedApplicationData(res);
              this.router.navigate(["/navbar"]);
            }
          },
          (err) => {
            this.coreService.removeLoadingScreen();
            console.log("Error in getting App Module", err);
          }
        );
    }
  }

  // ! Already Logic
  selectTheme(data) {
    this.selectedTheme = data;
    let theme = "theme-" + data.name.toLowerCase();
    this.coreService.switchTheme(theme);
  }

  selectProfileOption(data) {
    if (data && (data.name == "Logout" || data.name == "Login")) {
      this.authService.userDataSub.next(null);
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("licenseCountry");
      localStorage.removeItem("selectedApplication");
      localStorage.clear();
      if (data.name == "Logout") {
        this.coreService.showSuccessToast("Logged Out Successfully.");
      }
      this.router.navigate(["login"]);
    }
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll(e) {
    if (window.pageYOffset > 15) {
      this.isStickyHeader = true;
      let element = document.getElementById("header");
      element.classList.add("sticky");
    } else {
      this.isStickyHeader = false;
      let element = document.getElementById("header");
      element.classList.remove("sticky");
    }
  }
}
