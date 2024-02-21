import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { CoreService } from "src/app/core.service";
import { UsersPermissionService } from "../../users-permission.service";

@Component({
  selector: "app-system-users-listing",
  templateUrl: "./system-users-listing.component.html",
  styleUrls: ["./system-users-listing.component.scss"],
})
export class SystemUsersListingComponent implements OnInit {
  @Output("modeEvent") modeEvent = new EventEmitter<any>();
  @Output("editEvent") editEvent = new EventEmitter<any>();

  systemUsersListingData: any = [
    {
      id: 0,
      userID: "BaniE0001",
      userCode: "E0001",
      userName: "Bani Singh",
      status: "Active",
      userBranch: "Airport",
      userGroup: "Teller",
      dataAccessGroup: "Airports-USD Group",
    },
    {
      id: 1,
      userID: "VedE0002",
      userCode: "E0002",
      userName: "Ved Prakash",
      status: "Active",
      userBranch: "Head Office",
      userGroup: "Accountant",
      dataAccessGroup: "NA",
    },
    {
      id: 2,
      userID: "KaranE0003",
      userCode: "E0003",
      userName: "Karan Patel",
      status: "Active",
      userBranch: "Head Office",
      userGroup: "Administrator",
      dataAccessGroup: "Euro Group",
    },
  ];

  cols = [
    { field: "userCode", header: "User Code", width: "10%" },
    { field: "userName", header: "Name", width: "15%" },
    { field: "userBranch", header: "Branch", width: "15%" },
    { field: "userID", header: "User ID", width: "15%" },
    { field: "userGroup", header: "User Group", width: "15%" },
    { field: "dataAccessGroup", header: "Data Access Group", width: "20%" },
    { field: "status", header: "Status", width: "10%" },
  ];

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private userPermisionsService: UsersPermissionService
  ) {}

  ngOnInit(): void {
    // this.route.data.subscribe((data) => {
    //   this.coreService.setBreadCrumbMenu(Object.values(data));
    // });
  }

  addNewSystemUserPage() {
    this.modeEvent.emit("add");
  }

  viewSystemUser(data: any) {
    this.editEvent.emit(data);
    // this.router.navigate([
    //   "navbar",
    //   "tax-settings",
    //   "add-tax",
    //   data.taxCode,
    //   "edit",
    // ]);
    // this.taxSettingsService.setData(data);
  }

  confirmStatus(e: any, data: any) {
    e.preventDefault();
    let type = "";
    let reqStatus = "";
    if (e.target.checked) {
      reqStatus = "A";
      type = "Activate";
    } else {
      reqStatus = "D";
      type = "Deactivate";
    }
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    let completeMsg = "";

    completeMsg =
      `<img src="../../../assets/warning.svg"><br/><br/>` +
      `Do you wish to ` +
      type +
      ` the User Record: ${data["currencyCode"]}?`;
    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatus",
      accept: () => {
        // this.updateStatus(e, reqStatus, data);
        this.setHeaderSidebarBtn(true);
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn(false);
      },
    });
  }

  setHeaderSidebarBtn(accept: boolean) {
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    if (!accept) {
      setTimeout(() => {
        this.coreService.removeLoadingScreen();
      }, 1000);
    }
  }

  // updateStatus(e: any, reqStatus: any, data: any) {
  //   this.coreService.displayLoadingScreen();
  //   this.updateSystemUserStatus(e.target, data, reqStatus);
  // }

  // updateSystemUserStatus(sliderElm: any, data: any, reqStatus: any) {
  //   this.userPermisionsService
  //     .updateSystemUsersStatus(
  //       this.clientCode,
  //       this.licenseCountry,
  //       data.currencyCode,
  //       reqStatus
  //     )
  //     .subscribe(
  //       (res) => {
  //         let message = "";
  //         if (res["error"] == "true") {
  //           this.coreService.removeLoadingScreen();
  //           this.coreService.showWarningToast(res["error"]);
  //         } else {
  //           if (res["msg"]) {
  //             message = res["msg"];
  //             sliderElm.checked = sliderElm!.checked;
  //             this.getRateListingdata();
  //             this.coreService.showSuccessToast(message);
  //           } else {
  //             this.coreService.removeLoadingScreen();
  //             message = "Error in fetching data, Please try again later";
  //             this.coreService.showWarningToast(message);
  //           }
  //         }
  //       },
  //       (err) => {
  //         console.log(err);
  //         this.coreService.removeLoadingScreen();
  //       }
  //     );
  // }
}
