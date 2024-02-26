import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { MenuItem } from "primeng/api";
import { take } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { CoreService } from "../core.service";
import { Subscription } from "rxjs";
import { LoginService } from "../login/login.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit, AfterViewInit {
  @ViewChild("toggleSidebar") toggleSidebarBtn: ElementRef;
  @ViewChild("sidebarDiv") sidebarDiv: ElementRef;
  @ViewChild("logo") logoImg: ElementRef;

  primaryColor = "var(--primary-color)";

  pageTitle = "";
  private subscription: Subscription;

  breadcrumbsItems: MenuItem[] = [
    { label: "Home", routerLink: "/navbar" },
    { label: "Settings", routerLink: "/navbar" },
    { label: "Bank Routing Settings", routerLink: "bank-routing" },
  ];
  getdata: any;
  cities1: any[];
  response: any;
  ispaymentMode: boolean = true;
  isviewPaymentMode: boolean = false;
  menuItems: MenuItem[] = [];
  $MenuItems: MenuItem[] = [];
  menuItemTree: any = [];

  userActions = [{ name: "Profile" }, { name: "Logout" }];
  get profileOptions() {
    return this.userActions;
  }

  themeOptions = [
    { name: "Blue", color: "#4759e4" },
    { name: "Green", color: "#029a71" },
    { name: "Purple", color: "#6a0aa2" },
    { name: "Magenta", color: "#007491" },
    // { name: "Amber", color: "#ffbf00" },
    // { name: "Pink", color: "#ffc0cb" },
  ];
  selectedTheme = { name: "Blue", color: "#4759e4" };

  toggleState = "left";
  languages = [
    { label: "English", value: "en" },
    { label: "Arabic", value: "ar" },
    { label: "Germany ", value: "de" },
  ];
  selectedLanguage = "en";
  currRoute: any;

  isStickyHeader = false;

  loggedInUserName = "User";

  loggedInUserCode = null;

  eligibleApplications: any = [];
  selectedEligibleApp: any = { code: "def", codeName: "def" };

  constructor(
    public translate: TranslateService,
    private el: ElementRef,
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private loginService: LoginService
  ) {
    this.subscription = this.coreService.pageTitle$.subscribe((title) => {
      this.pageTitle = title;
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currRoute = event["urlAfterRedirects"];
        // this.setSidebarMenu();
      }
    });
  }

  ngOnInit(): void {
    this.switchLanguage(this.selectedLanguage);
    this.selectTheme({ name: "Blue", color: "#4759e4" });
    this.coreService.setsidebarMenu(
      JSON.parse(localStorage.getItem("menuItems"))
    );
    this.coreService.getsidebarMenu().subscribe((sideMenu) => {
      console.log(":::sideMenu", sideMenu);
      this.setSidebarMenu(sideMenu);
    });

    this.loggedInUserName =
      (localStorage.getItem("userData") &&
        JSON.parse(localStorage.getItem("userData"))["userName"]) ||
      "User";
    this.loggedInUserCode =
      localStorage.getItem("userData") &&
      JSON.parse(localStorage.getItem("userData"))["userCode"];
    this.eligibleApplications = JSON.parse(
      localStorage.getItem("eligibleApplicationsForUser")
    );
    const selectedApplication = JSON.parse(
      localStorage.getItem("selectedApplication")
    );
    if (selectedApplication) this.selectedEligibleApp = selectedApplication;
    this.coreService.getBreadCrumbMenu().subscribe((menu) => {
      console.log(":::mainBCrumbs", menu);
      this.breadcrumbsItems = menu;
    });
    this.coreService
      .getBreadCrumbMenuFromInternalPages()
      .subscribe((bCrumbsInternal) => {
        console.log(":::bCrumbsInternal", bCrumbsInternal);

        if (bCrumbsInternal && bCrumbsInternal.length) {
          this.breadcrumbsItems = null;

          this.breadcrumbsItems = [...bCrumbsInternal];
        }
      });
    this.coreService.userActionsObs.subscribe((opt) => {
      this.userActions = opt;
    });

    this.coreService.$headerSticky.subscribe((isStickyHeader) => {
      let headerElm = document.getElementById("header");
      if (isStickyHeader && this.isStickyHeader) {
        headerElm.classList.add("sticky");
      } else {
        headerElm.classList.remove("sticky");
      }
    });
    this.coreService.$sidebarBtnFixed.subscribe((isFixedSidebarBtn) => {
      let sidebarBtnElm = document.getElementById("toggleSidebarBtn");
      if (isFixedSidebarBtn) {
        sidebarBtnElm.classList.remove("notFixed");
      } else {
        sidebarBtnElm.classList.add("notFixed");
      }
    });

    this.authService.userDataSub.pipe(take(1)).subscribe((user) => {
      if (!user) {
        this.userActions = [{ name: "Login" }];
      } else {
        this.userActions = [{ name: "Profile" }, { name: "Logout" }];
      }
    });
  }

  setBreadCrumbsFromInternalPages(bCrumbs: any) {
    this.breadcrumbsItems = bCrumbs;
  }

  switchLanguage(language: string) {
    this.coreService.setLanguage(language);

    // Example: Update the dynamic header based on the selected language
    this.coreService
      .translate("Home.Settings")
      .then((translatedTitle: string) => {
        this.coreService.setPageTitle(translatedTitle);
      });
  }

  goIntoApplication(app: any) {
    console.log(this.selectedEligibleApp, app);
    if (app && app.eligibleApp) {
      if (this.selectedEligibleApp.code != app.code) {
        localStorage.setItem("selectedApplication", JSON.stringify(app));
        this.coreService.displayLoadingScreen();
        console.log(":::app", app);
        this.loginService
          .getAppModuleData(this.loggedInUserCode, app.code)
          .subscribe(
            (res) => {
              if (
                !(res["application"] || res["module"] || res["menuItemTree"])
              ) {
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
      } else {
        this.coreService.showSuccessToast("Already in this Application.");
      }
    }
  }

  createPanelMenuData(apiData: any) {
    const itemsMap = {};
    const rootItems = [];

    apiData.forEach((item) => {
      const newItem = {
        id: String(item.id),
        label: item.menuName,
        icon: this.getIcons(item.id).icon,
        items: [],
        expanded:
          this.getIcons(item.id).matchUrls &&
          this.getIcons(item.id).matchUrls.some((v) =>
            this.currRoute.includes(v)
          ),
      };

      itemsMap[item.id] = newItem;
      if (item.parentId === 0) {
        rootItems.push(newItem);
      } else {
        const parentItem = itemsMap[item.parentId];
        if (parentItem) {
          newItem["icon"] = null;
          newItem["items"] = null;
          parentItem.items.push(this.getSubMenus(newItem));
        } else {
          console.error(
            `Parent item with ID ${item.parentId} not found for item ${item.id}`
          );
        }
      }
    });
    return rootItems;
  }

  setSidebarMenu(sideMenu: any) {
    console.log(":::sidemenudata", sideMenu);
    if (sideMenu) {
      // const menuItems = sideMenu;
      this.menuItemTree = sideMenu;
    }
    this.menuItems = [];

    // !
    console.log(":::apimenudata", this.menuItemTree);
    let formattedMenuTree = this.createPanelMenuData(this.menuItemTree);
    console.log(":::", JSON.stringify(formattedMenuTree));
    // !

    this.menuItems = formattedMenuTree;
    this.$MenuItems = this.menuItems;
  }

  getSubMenus(item: any) {
    switch (item["id"]) {
      case "6":
        item["routerLink"] = "/navbar/rate-settings";
        item["routerLinkActiveOptions"] = { subset: true };
        break;

      case "7":
        item["routerLink"] = "/navbar/customised-messages";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "8":
        item["routerLink"] = "/navbar/master";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "9":
        item["routerLink"] = "/navbar/charge-settings";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "10":
        item["routerLink"] = "/navbar/company-settings";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "11":
        item["routerLink"] = "/navbar/tax-settings";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "12":
        item["routerLink"] = "/navbar/bank-routing";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "13":
        item["routerLink"] = "/navbar/document-settings";
        item["routerLinkActiveOptions"] = { subset: true };
        break;

      case "14":
        item["routerLink"] = "/navbar/form-rules";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "15":
        item["routerLink"] = "/navbar/criteria-settings";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "16":
        item["routerLink"] = "/navbar/search-settings";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "17":
        item["routerLink"] = "/navbar/customer-profile";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "18":
        item["routerLink"] = "/navbar/beneficiary-profile";
        item["routerLinkActiveOptions"] = { subset: true };
        break;

      case "19":
        item["routerLink"] = "/navbar/loyalty-programs";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "20":
        item["routerLink"] = "/navbar/loyalty-programs-details";
        item["routerLinkActiveOptions"] = { subset: true };
        break;

      case "21":
        item["routerLink"] = "/navbar/get-tax-settings";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "22":
        item["routerLink"] = "/navbar/get-doc-settings";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "23":
        item["routerLink"] = "/navbar/get-bank-routings";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
      case "24":
        item["routerLink"] = "/navbar/get-loyalty-programs";
        item["routerLinkActiveOptions"] = { subset: true };
        break;
    }
    return item;
  }

  ngAfterViewInit() {
    const bodyTag = this.el.nativeElement.closest("body");
    let bigLogoImgSrc = "assets/icon/casmex logo.svg";
    let smallLogoImgSrc = "assets/icon/logo-Icon.svg";
    this.toggleSidebarBtn.nativeElement.addEventListener("click", () => {
      if (bodyTag.classList.contains("minified-sidebar")) {
        bodyTag.classList.remove("minified-sidebar");
        // this.logoImg.nativeElement.setAttribute("src", bigLogoImgSrc);
        this.toggleState = "left";
      } else {
        bodyTag.classList.add("minified-sidebar");
        // this.logoImg.nativeElement.setAttribute("src", smallLogoImgSrc);
        this.toggleState = "right";
      }
    });
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    const bodyTag = this.el.nativeElement.closest("body");
    let widerThan1200 = window.matchMedia("(min-width: 1200px)");
    let thinThan1200 = window.matchMedia("(max-width: 1199px)");
    if (
      widerThan1200.matches &&
      bodyTag.classList.contains("minified-sidebar")
    ) {
      bodyTag.classList.remove("minified-sidebar");
      this.toggleState = "left";
    } else if (
      thinThan1200.matches &&
      !bodyTag.classList.contains("minified-sidebar")
    ) {
      bodyTag.classList.add("minified-sidebar");
      this.toggleState = "right";
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

  getIcons(menuId: number) {
    let iconName;
    let routeName;
    let matchUrls;
    switch (menuId) {
      case 1:
        iconName = "settings-icon";
        matchUrls = [
          "/navbar/bank-routing",
          "/navbar/tax-settings",
          "/navbar/charge-settings",
          "/navbar/form-rules",
          "/navbar/bank-routing/addnewroute",
          "/navbar/document-settings",
          "/navbar/customised-messages",
          "/navbar/company-settings",
          "/navbar/rate-settings",
          "/navbar/master",
        ];
        routeName = "/navbar/bank-routing";
        break;
      case 2:
        iconName = "applicationsettings-icon";
        matchUrls = ["/navbar/criteria-settings", "/navbar/search-settings"];
        routeName = "/navbar/criteria-settings";
        break;
      case 3:
        iconName = "beneficiary-icon";
        matchUrls = ["/navbar/customer-profile", "/navbar/beneficiary-profile"];
        routeName = "/navbar/customer-profile";
        break;
      case 4:
        iconName = "settings-icon";
        matchUrls = [
          "/navbar/loyalty-programs",
          "/navbar/loyalty-programs-details",
        ];
        routeName = "/navbar/loyalty-programs";
        break;
      case 5:
        iconName = "applicationsettings-icon";
        matchUrls = [
          "/navbar/get-bank-routings",
          "/navbar/get-loyalty-programs",
          "/navbar/get-tax-settings",
          "/navbar/get-doc-settings",
        ];
        routeName = "/navbar/criteria-settings";
        break;
      // case "Master":
      //   iconName = "beneficiary-icon";
      //   matchUrls = ["/navbar/master"];
      //   routeName = "/navbar/master";
      //   break;
      // case "Customer Profile":
      //   iconName = "beneficiary-icon";
      //   matchUrls = ["/navbar/customer-profile"];
      //   routeName = "/navbar/customer-profile";
      //   break;
      // case "Beneficiary Profile":
      //   iconName = "beneficiary-icon";
      //   matchUrls = ["/navbar/beneficiary-profile"];
      //   routeName = "/navbar/beneficiary-profile";
      //   break;
      // case "Dashboard":
      //   iconName = "dashboard-icon";
      //   break;
      // case "Rate Setup":
      //   iconName = "rateSetup-icon";
      //   break;
      // case "Remmitance":
      //   iconName = "remmitance-icon";
      //   break;
      // case "User Roles Management":
      //   iconName = "rateSetup-icon";
      //   break;
      // case "Reports":
      //   iconName = "reports-icon";
      //   break;
      // case "Accounts":
      //   iconName = "Accounts-icon";
      //   break;
      // case "Incoming":
      //   iconName = "Incoming-icon";
      //   break;

      default:
        iconName = "settings-icon";
        break;
    }
    return { icon: iconName, matchUrls: matchUrls, routerLink: routeName };
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

  selectTheme(data) {
    this.selectedTheme = data;
    let theme = "theme-" + data.name.toLowerCase();
    this.coreService.switchTheme(theme);
  }

  filterMenuItems(e: Event) {
    this.menuItems = this.$MenuItems;
    let arr = [];
    this.$MenuItems.forEach((item) => {
      let found = false;
      if (item.label.toLowerCase().includes(e.target["value"]?.toLowerCase())) {
        found = true;
      } else if (item.items) {
        item.items.forEach((subItem) => {
          if (!found) {
            if (
              subItem["label"]
                .toLowerCase()
                .includes(e.target["value"]?.toLowerCase())
            ) {
              found = true;
            }
          }
        });
      }
      if (found) {
        arr.push(item);
      }
    });
    this.menuItems = arr;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
