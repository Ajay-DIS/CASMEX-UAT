import { Location } from "@angular/common";
import { HttpClient } from "@angular/common/http";
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
import { BnNgIdleService } from "bn-ng-idle";
import { Subscription } from "rxjs";

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
  menuItemTree = {};

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

  constructor(
    public translate: TranslateService,
    private el: ElementRef,
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.subscription = this.coreService.pageTitle$.subscribe((title) => {
      this.pageTitle = title;
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currRoute = event["urlAfterRedirects"];
        this.setSidebarMenu();
      }
    });
  }

  ngOnInit(): void {
    this.switchLanguage(this.selectedLanguage);
    this.selectTheme({ name: "Blue", color: "#4759e4" });
    this.coreService.getBreadCrumbMenu().subscribe((menu) => {
      this.breadcrumbsItems = menu;
    });
    this.coreService
      .getBreadCrumbMenuFromInternalPages()
      .subscribe((bCrumbsInternal) => {
        console.log(":::bCrumbsInternal", bCrumbsInternal);
        this.breadcrumbsItems = null;
        if (bCrumbsInternal && bCrumbsInternal.length) {
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
  setSidebarMenu() {
    if (!!localStorage.getItem("menuItems")) {
      const menuItems = localStorage.getItem("menuItems");
      this.menuItemTree = JSON.parse(menuItems);
    }
    this.menuItems = [];
    Object.keys(this.menuItemTree).map((menu) => {
      if (this.menuItemTree[menu].length > 0) {
        const submenus = [];
        this.menuItemTree[menu].map((sub) => {
          submenus.push({
            label: sub,
          });
        });
        this.menuItems.push({
          label: menu,
          icon: this.getIcons(menu).icon,
          items: this.getSubMenus(submenus),
          expanded:
            this.getIcons(menu).matchUrls &&
            this.getIcons(menu).matchUrls.some((v) =>
              this.currRoute.includes(v)
            ),
        });
      } else {
        this.menuItems.push({
          label: menu,
          icon: this.getIcons(menu).icon,
          routerLink: this.getIcons(menu).routerLink,
          routerLinkActiveOptions: { subset: true },
          expanded: true,
        });
      }
    });
    this.$MenuItems = this.menuItems;
  }

  getSubMenus(menu: any) {
    menu.forEach((item) => {
      switch (item["label"]) {
        case "Bank Routing Settings":
          item["routerLink"] = "/navbar/bank-routing";
          item["routerLinkActiveOptions"] = { subset: true };
          break;

        case "Criteria Setting":
          item["routerLink"] = "/navbar/criteria-settings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Search Settings":
          item["routerLink"] = "/navbar/search-settings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;

        case "Tax Settings":
          item["routerLink"] = "/navbar/tax-settings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Customised Messages":
          item["routerLink"] = "/navbar/customised-messages";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Company Settings":
          item["routerLink"] = "/navbar/company-settings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Company Settings":
          item["routerLink"] = "/navbar/company-settings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Rate Settings":
          item["routerLink"] = "/navbar/rate-settings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Charge Settings":
          item["routerLink"] = "/navbar/charge-settings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;

        case "Form Rules Settings":
          item["routerLink"] = "/navbar/form-rules";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Form Rules":
          item["routerLink"] = "/navbar/form-rules";
          item["routerLinkActiveOptions"] = { subset: true };
          break;

        case "Bank Routing Settings API":
          item["routerLink"] = "/navbar/get-bank-routings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Tax Settings API":
          item["routerLink"] = "/navbar/get-tax-settings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Document Settings API":
          item["routerLink"] = "/navbar/get-doc-settings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Loyalty Programs Manager API":
          item["routerLink"] = "/navbar/get-loyalty-programs";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Beneficiary Profile":
          item["routerLink"] = "/navbar/beneficiary-profile";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Master":
          item["routerLink"] = "/navbar/master";
          item["routerLinkActiveOptions"] = { subset: true };
          break;

        case "Document Settings":
          item["routerLink"] = "/navbar/document-settings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;

        case "Loyalty Programs Manager":
          item["routerLink"] = "/navbar/loyalty-programs";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Customer Loyalty Program Details":
          item["routerLink"] = "/navbar/loyalty-programs-details";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
      }
    });
    return menu;
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

  getIcons(menuName) {
    let iconName;
    let routeName;
    let matchUrls;
    switch (menuName) {
      case "Dashboard":
        iconName = "dashboard-icon";
        break;
      case "Customer Profile":
        iconName = "beneficiary-icon";
        matchUrls = ["/navbar/customer-profile"];
        routeName = "/navbar/customer-profile";
        break;
      case "Rate Setup":
        iconName = "rateSetup-icon";
        break;
      case "Beneficiary Profile":
        iconName = "beneficiary-icon";
        matchUrls = ["/navbar/beneficiary-profile"];
        routeName = "/navbar/beneficiary-profile";
        break;
      case "Remmitance":
        iconName = "remmitance-icon";
        break;
      case "Customer Service":
        iconName = "beneficiary-icon";
        break;
      case "Master":
        iconName = "beneficiary-icon";
        matchUrls = ["/navbar/master"];
        routeName = "/navbar/master";
        break;
      case "Loyalty":
        iconName = "settings-icon";
        matchUrls = [
          "/navbar/loyalty-programs",
          "/navbar/loyalty-programs-details",
        ];
        routeName = "/navbar/loyalty-programs";
        break;
      case "Settings":
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
        ];
        routeName = "/navbar/bank-routing";
        break;
      case "Application Settings":
        iconName = "applicationsettings-icon";
        matchUrls = ["/navbar/criteria-settings", "/navbar/search-settings"];
        routeName = "/navbar/criteria-settings";
        break;
      case "API Test":
        iconName = "applicationsettings-icon";
        matchUrls = [
          "/navbar/get-bank-routings",
          "/navbar/get-loyalty-programs",
          "/navbar/get-tax-settings",
          "/navbar/get-doc-settings",
        ];
        routeName = "/navbar/criteria-settings";
        break;
      case "User Roles Management":
        iconName = "rateSetup-icon";
        break;
      case "Reports":
        iconName = "reports-icon";
        break;
      case "Accounts":
        iconName = "Accounts-icon";
        break;
      case "Incoming":
        iconName = "Incoming-icon";
        break;

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
