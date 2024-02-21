import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "../core.service";
import { take } from "rxjs/operators";

@Component({
  selector: "app-users-permisions",
  templateUrl: "./users-permisions.component.html",
  styleUrls: ["./users-permisions.component.scss"],
})
export class UsersPermisionsComponent implements OnInit {
  mode = "list";
  bankTransferModel: boolean = false;

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const translationKey = "Home.Settings";

    // Update translation
    this.coreService
      .translate(translationKey)
      .then((translatedTitle: string) => {
        this.coreService.setPageTitle(translatedTitle);
      });

    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
  }
  handleModeBack(data: string) {
    this.mode = data;
    this.coreService
      .getBreadCrumbMenu()
      .pipe(take(1))
      .subscribe((currBCrumbs) => {
        const systemUserIndex = currBCrumbs.splice(4);
        console.log(":::currB", systemUserIndex);
        this.coreService.setBreadCrumbMenuFromInternalPages(currBCrumbs);
      });
  }

  handleMode(data: string) {
    this.mode = data;
    console.log("mode", data);
    if (this.mode == "add") {
      // set BreadCrumbs
      this.coreService
        .getBreadCrumbMenu()
        .pipe(take(1))
        .subscribe((currBCrumbs) => {
          console.log(":::currB", currBCrumbs);
          currBCrumbs.push({
            label: "Add System User",
            routerLink: "",
          });
          this.coreService.setBreadCrumbMenuFromInternalPages(currBCrumbs);
        });
    } else {
      // set BreadCrumbs
      this.coreService
        .getBreadCrumbMenu()
        .pipe(take(1))
        .subscribe((currBCrumbs) => {
          console.log(":::currB", currBCrumbs);
          currBCrumbs.push({
            label: "Edit System User",
            routerLink: "",
          });
          this.coreService.setBreadCrumbMenuFromInternalPages(currBCrumbs);
        });
    }
  }
  handleEdit(data) {
    console.log("mode", data);
    if (data) {
      this.mode = "add";
      this.bankTransferModel = true;
    }
  }
  clickTabChange(e) {
    console.log(":::currB", e);
    if (e.index == "1") {
      this.coreService
        .getBreadCrumbMenu()
        .pipe(take(1))
        .subscribe((currBCrumbs) => {
          console.log(":::currB", currBCrumbs);
          const systemUserIndex = currBCrumbs.findIndex(
            (item) => item.label === "System User"
          );
          if (systemUserIndex !== -1) {
            currBCrumbs[systemUserIndex].label = "User Group";
          }
          this.coreService.setBreadCrumbMenuFromInternalPages(currBCrumbs);
        });
    } else {
      this.coreService
        .getBreadCrumbMenu()
        .pipe(take(1))
        .subscribe((currBCrumbs) => {
          const systemUserIndex = currBCrumbs.splice(3);
          console.log(":::currB", systemUserIndex);
          currBCrumbs.push({
            label: "System User",
            routerLink: "../navbar/users-permissions/system-user",
          });
          this.coreService.setBreadCrumbMenuFromInternalPages(currBCrumbs);
        });
      this.mode = "list";
    }
  }
}
