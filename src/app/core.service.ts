import { Injectable } from "@angular/core";
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

  constructor() {}

  userActionsObs = new BehaviorSubject<any>([
    { name: "Profile" },
    { name: "Logout" },
  ]);

  // $SessionExpired = new BehaviorSubject<boolean>(true);
  // setSessionExpirationStatus(status:boolean) {
  //   this.$SessionExpired.next(status);
  // }

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
