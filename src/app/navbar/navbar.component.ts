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

  breadcrumbsItems: MenuItem[] = [
    { label: "Home", routerLink: "/navbar" },
    { label: "Settings", routerLink: "/navbar" },
    { label: "Bank Routing", routerLink: "bank-routing" },
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
  selectedLanguage: string;
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
    translate.addLangs(["en", "ar", "de"]);
    translate.setDefaultLang("en");

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|ar|de/) ? browserLang : "en");

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currRoute = event["urlAfterRedirects"];
        this.setSidebarMenu();
      }
    });
  }

  ngOnInit(): void {
    this.selectedLanguage = this.translate.currentLang;
    this.selectTheme({ name: "Blue", color: "#4759e4" });
    console.log(this.currRoute);
    this.coreService.getBreadCrumbMenu().subscribe((menu) => {
      this.breadcrumbsItems = menu;
      console.log(this.breadcrumbsItems);
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
      console.log(user);
      if (!user) {
        this.userActions = [{ name: "Login" }];
      } else {
        this.userActions = [{ name: "Profile" }, { name: "Logout" }];
      }
    });
    // this.setSidebarMenu();
  }
  switchLanguage(lang: string) {
    this.translate.use(lang);
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
          // routerLink: this.getIcons(menu).routerLink,
          // routerLinkActiveOptions: { exact: true },
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
          // routerLinkActiveOptions: { exact: true },
          expanded:
            this.getIcons(menu).matchUrls &&
            this.getIcons(menu).matchUrls.some((v) =>
              this.currRoute.includes(v)
            ),
        });
      }
    });
    this.$MenuItems = this.menuItems;
  }

  getSubMenus(menu: any) {
    menu.forEach((item) => {
      switch (item["label"]) {
        case "Bank Routing":
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

        case "Tax":
          item["routerLink"] = "/navbar/tax-settings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;

        case "Form Rules":
          item["routerLink"] = "/navbar/form-rules";
          item["routerLinkActiveOptions"] = { subset: true };
          break;

        case "Group Settings":
          item["routerLink"] = "/navbar/group-settings";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Custom Fields":
          item["routerLink"] = "/navbar/custom-fields";
          item["routerLinkActiveOptions"] = { subset: true };
          break;
        case "Customer Profile":
          item["routerLink"] = "/navbar/customer-profile";
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
      case "Forex":
        iconName = "forex-icon";
        break;
      case "Beneficiary Profile":
        iconName = "beneficiary-icon";
        break;
      case "Remmitance":
        iconName = "remmitance-icon";
        break;
      case "Customer Service":
        iconName = "beneficiary-icon";
        break;
      case "Settings":
        iconName = "settings-icon";
        matchUrls = [
          "/navbar/bank-routing",
          "/navbar/tax-settings",
          "/navbar/form-rules",
          "/navbar/bank-routing/addnewroute",
          // "/navbar/bank-routing-2",
          // "/navbar/bank-routing-2/addnewroute",
        ];
        routeName = "/navbar/bank-routing";
        break;
      case "Application Settings":
        iconName = "applicationsettings-icon";
        matchUrls = [
          "/navbar/criteria-settings",
          "/navbar/group-settings",
          "/navbar/search-settings",
          "/navbar/custom-fields",
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
  // onChange(item: any) {
  //   this.translate.use(item.value);
  // }

  selectProfileOption(data) {
    if (data && (data.name == "Logout" || data.name == "Login")) {
      if (this.authService.clearTimer) {
        clearTimeout(this.authService.clearTimer);
      }
      this.authService.userDataSub.next(null);
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      if (data.name == "Logout") {
        this.coreService.showSuccessToast("Logged Out Successfully.");
      }
      this.router.navigate(["login"]);
    }
  }

  selectTheme(data) {
    console.log(data);
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
}
