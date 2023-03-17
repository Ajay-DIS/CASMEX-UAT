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
import { ToastrService } from "ngx-toastr";
import { MenuItem } from "primeng/api";
import { environment } from "src/environments/environment";
import { CoreService } from "../core.service";
import { PaymentModeService } from "../payment-mode-settings/payment-mode-service.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit, AfterViewInit {
  @ViewChild("toggleSidebar") toggleSidebarBtn: ElementRef;
  @ViewChild("sidebarDiv") sidebarDiv: ElementRef;
  @ViewChild("logo") logoImg: ElementRef;

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
  menuItemTree = {
    // Dashboard: [],
    // "Customer Profile": [],
    // "Rate Setup": [
    //   "Rate & Margin Setup",
    //   "Rate & Margin Settings",
    //   "Rate Heirarchy Settings",
    // ],
    // Forex: [],
    // "Beneficiary Profile": [],
    // Remmitance: [
    //   "Transaction ",
    //   "Payment For Customer",
    //   "Amendment",
    //   "Cancellation",
    //   "Payment to Customer",
    // ],
    // "Customer Service": [
    //   "Transaction Enquiry ( Receipt Reprint)",
    //   "Complaints",
    //   "Rate View",
    // ],
    // "Approval & Authorization": [],
    // Settings: [
    //   "Tax",
    //   "Charge",
    //   "Payment Mode",
    //   "Bank Routing",
    //   "Discount",
    //   "Block Transaction",
    //   "Purpose",
    //   "Document",
    //   "Source",
    //   "Form Rules",
    // ],
    // "Application Settings": [
    //   "Custom Fields",
    //   "Group Settings",
    //   "Search Settings",
    //   "Authorization Page Setting",
    // ],
    // "User Roles Management": ["User Roles & Permissions"],
    // Reports: [],
    // Accounts: [],
    // Incoming: [],
    // "Alerts & Notification": [],
  };
  profileOptions: any = [{ name: "Profile" }, { name: "Logout" }];
  toggleState = "left";

  currRoute: any;

  constructor(
    private payment: PaymentModeService,
    public translate: TranslateService,
    private httpClient: HttpClient,
    private el: ElementRef,
    private router: Router,
    private ngxToaster: ToastrService,
    private coreService: CoreService,
    private route: ActivatedRoute
  ) {
    this.cities1 = [
      { label: "English", value: "en" },
      { label: "Arabic", value: "ar" },
      { label: "Germany ", value: "de" },
    ];
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
    console.log(this.currRoute);
    this.coreService.getBreadCrumbMenu().subscribe((menu) => {
      this.breadcrumbsItems = menu;
    });

    let token = localStorage.getItem("token");
    let isTokenExpired = this.isTokenExpired(token);
    console.log("isTokenExpired", isTokenExpired);
    if (isTokenExpired) {
      localStorage.removeItem("token");
      this.ngxToaster.error(
        "Your Session has been Expired, Please login again"
      );
      this.router.navigate(["navbar/session-time-out"]);
      this.coreService.removeLoadingScreen();
    }
    // this.setSidebarMenu();
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
          // routerLink: this.getIcons(menu).routerLink,
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
      }
    });
    return menu;
  }

  isTokenExpired(token: string) {
    if (token) {
      let expiry = JSON.parse(atob(token.split(".")[1])).exp;
      if (new Date(expiry * 1000).getTime() < Date.now()) {
        this.router.navigate(["navbar/session-time-out"]);
        return true;
      } else {
        return false;
      }
    }
  }

  ngAfterViewInit() {
    const bodyTag = this.el.nativeElement.closest("body");
    let bigLogoImgSrc = "assets/icon/casmex logo.svg";
    let smallLogoImgSrc = "assets/icon/logo-Icon.svg";
    this.toggleSidebarBtn.nativeElement.addEventListener("click", () => {
      console.log("::logo", this.logoImg.nativeElement.getAttribute("src"));
      if (bodyTag.classList.contains("minified-sidebar")) {
        bodyTag.classList.remove("minified-sidebar");
        this.logoImg.nativeElement.setAttribute("src", bigLogoImgSrc);
        this.toggleState = "left";
      } else {
        bodyTag.classList.add("minified-sidebar");
        this.logoImg.nativeElement.setAttribute("src", smallLogoImgSrc);
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

  getIcons(menuName) {
    let iconName;
    let routeName;
    let matchUrls;
    switch (menuName) {
      case "Dashboard":
        iconName = "dashboard-icon";
        break;
      case "Customer Profile":
        iconName = "customerDetails-icon";
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
        iconName = "customerDetails-icon";
        break;
      case "Settings":
        iconName = "settings-icon";
        matchUrls = [
          "/navbar/bank-routing",
          "/navbar/bank-routing/addnewroute",
        ];
        routeName = "/navbar/bank-routing";
        break;
      case "Application Settings":
        iconName = "applicationsettings-icon";
        matchUrls = ["/navbar/criteria-settings"];
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
  viewPayment() {
    this.ispaymentMode = false;
    this.isviewPaymentMode = true;
  }
  onChange(item: any) {
    this.translate.use(item.value);
  }

  selectProfileOption(data) {
    if (data && data.name == "Logout") {
      localStorage.removeItem("token");
      this.ngxToaster.error("Logged Out Successfully.");
      this.router.navigate(["login"]);
    }
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
