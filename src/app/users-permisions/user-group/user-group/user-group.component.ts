import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { CoreService } from "src/app/core.service";
import { UsersPermissionService } from "../../users-permission.service";

@Component({
  selector: "app-user-group",
  templateUrl: "./user-group.component.html",
  styleUrls: ["./user-group.component.scss"],
})
export class UserGroupComponent implements OnInit {
  userGroupListingData: any = [
    {
      id: 0,
      userGroupCode: "UG0001",
      status: "Active",
      userGroup: "Teller",
    },
    {
      id: 1,
      userGroupCode: "UG0002",
      status: "Active",
      userGroup: "Accountant",
    },
    {
      id: 2,
      userGroupCode: "UG0003",
      userName: "Karan Patel",
      status: "Active",
      userGroup: "Administrator",
    },
  ];

  cols = [
    { field: "userGroupCode", header: "User Group Code", width: "30%" },
    { field: "userGroup", header: "User Group", width: "50%" },
    { field: "status", header: "Status", width: "20%" },
  ];

  mode = "list";
  deactivated: boolean = false;

  userGroupOptions: any = [
    {
      id: 1,
      code: "Teller",
      codeName: "Teller",
      status: "A",
    },
    {
      id: 2,
      code: "Accountant",
      codeName: "Accountant",
      status: "A",
    },
  ];

  userCode: "";
  userGroup: "";

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private userPermisionsService: UsersPermissionService
  ) {}

  ngOnInit(): void {}
  addNewUserGroupPage() {
    this.mode = "add";
  }

  viewSystemUser(data: any) {
    this.mode = "edit";
    // this.modeEvent.emit("edit");
    // this.router.navigate([
    //   "navbar",
    //   "tax-settings",
    //   "add-tax",
    //   data.taxCode,
    //   "edit",
    // ]);
    // this.taxSettingsService.setData(data);
  }
  onBack() {
    this.mode = "list";
  }
  onEdit() {}
  onSubmit(action) {}
  onReset() {}

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
