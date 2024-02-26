import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ClipboardService } from "ngx-clipboard";
import { MessageService } from "primeng/api";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CoreService {
  breadcrumbsItems = [
    { label: "Home", routerLink: "/navbar" },
    { label: "Settings", routerLink: "/navbar" },
    { label: "Bank Routing Settings", routerLink: "bank-routing" },
  ];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private messageService: MessageService,
    private clipboardService: ClipboardService,
    private translateService: TranslateService
  ) {}

  showSuccessToast(description: any) {
    this.messageService.clear();
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: description,
    });
  }
  showWarningToast(description: any) {
    this.messageService.clear();
    this.messageService.add({
      severity: "warn",
      summary: "Warning",
      detail: description,
    });
  }

  switchTheme(theme: string) {
    let themeLink = this.document.getElementById(
      "app-theme"
    ) as HTMLLinkElement;

    if (themeLink) {
      themeLink.href = theme + ".css";
    }

    // % For Light Theme
    // if (theme.includes("amber") || theme.includes("pink")) {
    //   this.document
    //     .querySelectorAll(".sidebar-content .p-menuitem-icon")
    //     .forEach((icons) => {
    //       (icons as HTMLElement).style.filter = "invert(0%)";
    //     });
    // } else {
    //   this.document
    //     .querySelectorAll(".sidebar-content .p-menuitem-icon")
    //     .forEach((icons) => {
    //       (icons as HTMLElement).style.filter = "invert(100%)";
    //     });
    // }
    // % For Light Theme End
  }

  userActionsObs = new BehaviorSubject<any>([
    { name: "Profile" },
    { name: "Logout" },
  ]);

  $loadingScreen = new BehaviorSubject<boolean>(false);
  displayLoadingScreen() {
    this.$loadingScreen.next(true);
  }
  removeLoadingScreen() {
    this.$loadingScreen.next(false);
  }

  $breadCrumbMenu = new BehaviorSubject<any[]>(this.breadcrumbsItems);

  getBreadCrumbMenu() {
    return this.$breadCrumbMenu;
  }
  setBreadCrumbMenu(val: any) {
    this.$breadCrumbMenu.next(val);
  }

  $breadCrumbMenuFromInternalPages = new Subject<any[]>();

  setBreadCrumbMenuFromInternalPages(breadCrumbMenuFromInternalPages: any) {
    this.$breadCrumbMenuFromInternalPages.next(breadCrumbMenuFromInternalPages);
  }
  getBreadCrumbMenuFromInternalPages(): Observable<any> {
    return this.$breadCrumbMenuFromInternalPages.asObservable();
  }

  $headerSticky = new BehaviorSubject<boolean>(false);
  $sidebarBtnFixed = new BehaviorSubject<boolean>(true);
  setHeaderStickyStyle(val: any) {
    this.$headerSticky.next(val);
  }
  setSidebarBtnFixedStyle(val: any) {
    this.$sidebarBtnFixed.next(val);
  }

  copyToClipboard(text: string) {
    this.clipboardService.copy(text);
  }

  private pageTitleSubject = new BehaviorSubject<string>("");
  pageTitle$ = this.pageTitleSubject.asObservable();

  setPageTitle(title: string) {
    this.pageTitleSubject.next(title);
  }

  translate(key: string): Promise<string> {
    return this.translateService.get(key).toPromise();
  }

  setLanguage(language: string) {
    this.translateService.use(language);
  }

  onLangChange() {
    return this.translateService.onLangChange;
  }

  $sidebarMenu = new BehaviorSubject<any[]>([]);

  getsidebarMenu() {
    return this.$sidebarMenu;
  }
  setsidebarMenu(val: any) {
    this.$sidebarMenu.next(val);
  }
}
