import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-add-customer",
  templateUrl: "./add-customer.component.html",
  styleUrls: ["./add-customer.component.scss"],
})
export class AddCustomerComponent implements OnInit {
  constructor(
    private coreService: CoreService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    console.log(";:HI");
  }

  clog = console.log;

  activeTabIndex: any = "0";
  previousTabIndex: any = "0";

  relatedPartyInParent: any = "C";

  existingCustomerMissingDocCaseId: any = null;

  isNormalCustomer: any = true;

  newAddedCustAsParty = null;

  editRelatedPartyId: any = null;

  editFromPartyTable: any = false;

  userId = null;

  mode = "add";
  custId = null;
  custType = "IND";

  newAddedCustAsPartyFn(data: any) {
    console.log(";::", data);
    this.newAddedCustAsParty = data;
  }

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.activatedRoute.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];

    const params = this.activatedRoute.snapshot.params;
    console.log(params);
    if (params && params.type) {
      this.custType = params.type;
      if (this.custType == "COR") {
        this.activeTabIndex = 1;
        this.previousTabIndex = 1;
      } else {
        this.activeTabIndex = 0;
      }
    }
    if (params && params.id) {
      this.mode = this.activatedRoute.snapshot.routeConfig.path.substring(
        this.activatedRoute.snapshot.routeConfig.path.lastIndexOf("/") + 1
      );
      this.custId = params.id;
    }
  }

  handleChange(event: any) {
    console.log(event);
    this.activeTabIndex = event.index;
    if (this.activeTabIndex != this.previousTabIndex) {
      this.previousTabIndex = this.activeTabIndex;
    }
    if (this.activeTabIndex != 0) {
      this.custType = "COR";
      this.router.navigate([
        "navbar",
        "customer-profile",
        "addnewcustomer",
        "COR",
      ]);

    } else {
      this.custType = "IND";
      this.router.navigate([
        "navbar",
        "customer-profile",
        "addnewcustomer",
        "IND",
      ]);
    }
  }
}
