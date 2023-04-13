import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CoreService {
  breadcrumbsItems = [
    { label: "Home", routerLink: "/navbar" },
    { label: "Settings", routerLink: "/navbar" },
    { label: "Bank Routing", routerLink: "bank-routing" },
  ];

  constructor(@Inject(DOCUMENT) private document: Document) {}

  switchTheme(theme: string) {
    let themeLink = this.document.getElementById(
      "app-theme"
    ) as HTMLLinkElement;

    if (themeLink) {
      themeLink.href = theme + ".css";
    }

    if (theme.includes("amber") || theme.includes("pink")) {
      this.document
        .querySelectorAll(".sidebar-content .p-menuitem-icon")
        .forEach((icons) => {
          (icons as HTMLElement).style.filter = "invert(0%)";
        });
    } else {
      this.document
        .querySelectorAll(".sidebar-content .p-menuitem-icon")
        .forEach((icons) => {
          (icons as HTMLElement).style.filter = "invert(100%)";
        });
    }
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
}
