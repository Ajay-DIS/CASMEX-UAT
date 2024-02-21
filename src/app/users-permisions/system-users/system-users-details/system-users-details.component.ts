import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-system-users-details",
  templateUrl: "./system-users-details.component.html",
  styleUrls: ["./system-users-details.component.scss"],
})
export class SystemUsersDetailsComponent implements OnInit {
  @Output("modeEventBack") modeEventBack = new EventEmitter<any>();
  @Input("bankTransferModel") bankTransferModel: boolean = false;

  userCode: "";
  userBranch: "";
  userGroup: "";
  dataAccessGroup: "";
  userIDText: "";
  userName: "";
  userEmailId: "";
  contactNumber: "";
  userCurrentBranch: "";
  userCurrencyCode: "";
  userFXStock: "";
  userCashierAccount: "";
  userTransferBranch: "";

  showEditModal: boolean = false;

  newValues: any;

  branchOptions: any = [
    {
      id: 1,
      code: "Airport",
      codeName: "Airport",
      status: "A",
    },
    {
      id: 2,
      code: "HeadOffice",
      codeName: "HeadOffice",
      status: "A",
    },
  ];
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
  dataAccessGroupOptions: any = [
    {
      id: 1,
      code: "Airports-USD Group",
      codeName: "Airports-USD Group",
      status: "A",
    },
    {
      id: 2,
      code: "Euro Group",
      codeName: "Euro Group",
      status: "A",
    },
  ];
  transferBranchOptions: any = [
    {
      id: 1,
      code: "Airport",
      codeName: "Airport",
      status: "A",
    },
    {
      id: 2,
      code: "HeadOffice",
      codeName: "HeadOffice",
      status: "A",
    },
  ];

  mode = "add";
  deactivated: boolean = false;

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // this.route.data.subscribe((data) => {
    //   this.coreService.setBreadCrumbMenu(Object.values(data));
    // });
  }
  isValidEmail(email: string): boolean {
    // Regular expression for email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  upperCaseSpaceFormat(value: string): string {
    // Trim extra spaces and convert to uppercase
    return value?.trim().toUpperCase().replace(/\s+/g, " ");
  }

  onSubmit(action) {
    // this.coreService.displayLoadingScreen();
    let userNameMissing = false;
    let userEmailMissing = false;
    let userBranchMissing = false;
    let userGroupMissing = false;
    let userContactMissing = false;

    this.newValues = [
      {
        userID: this.userIDText,
        userCode: this.userCode,
        userName: this.userName,
        status: "A",
        userBranch: this.userBranch,
        userGroup: this.userGroup,
        dataAccessGroup: this.dataAccessGroup,
        userEmail: this.userEmailId,
        userContact: this.contactNumber,
      },
    ];
    this.newValues.forEach((data) => {
      data["userName"] = this.upperCaseSpaceFormat(this.userName);
      console.log("save", data);
      if (!data["userEmail"] || data["userEmail"] === "") {
        userEmailMissing = true;
      }
      if (!this.isValidEmail(data["userEmail"])) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please enter a valid email format.");
        return; // Stop execution here if email format is invalid
      }
      if (!data["userName"] || data["userName"] === "") {
        userNameMissing = true;
      }

      if (!data["userContact"] || data["userContact"] === "") {
        userContactMissing = true;
      }
      if (!data["userGroup"] || data["userGroup"] === "") {
        userGroupMissing = true;
      }
      if (!data["userBranch"] || data["userBranch"] === "") {
        userBranchMissing = true;
      }
    });

    console.log("save", this.newValues);
    if (userBranchMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please select the Branch.");
    } else if (userGroupMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please select the User Group.");
    } else if (userContactMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please fill the Contanct Number.");
    } else if (userNameMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please fill the Name.");
    } else if (userEmailMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please fill the Email.");
    }
    // } else {
    //   let service;
    //   if (this.mode == "edit") {
    //     let data = this.newValues;

    //     service = this.compamnyService.updateCompanySettings(data, this.userId);
    //     console.log("::", data);
    //   } else {
    //     let data = this.newValues;
    //     console.log("saveeee", data);
    //     service = this.compamnyService.saveCompanySettings(data, this.userId);
    //   }

    //   if (service) {
    //     service.subscribe(
    //       (res) => {
    //         if (
    //           res["status"] &&
    //           typeof res["status"] == "string" &&
    //           (res["status"] == "400" || res["status"] == "500")
    //         ) {
    //           if (res["error"]) {
    //             this.coreService.showWarningToast(res["error"]);
    //           } else {
    //             this.coreService.showWarningToast(
    //               "Something went wrong, Please try again later"
    //             );
    //           }
    //         } else {
    //           if (res["msg"]) {
    //             this.coreService.showSuccessToast(res.msg);
    //             this.coreService.removeLoadingScreen();
    //             this.getCompanySettingsData();
    //           }
    //         }
    //       },
    //       (err) => {
    //         this.coreService.removeLoadingScreen();
    //         console.log("error in save", err);
    //         this.coreService.showWarningToast(
    //           "Something went wrong, Please try again later"
    //         );
    //       }
    //     );
    //   }
    // }
  }
  onReset() {}
  onEdit() {}
  onActive() {}
  onBankTransfer() {
    this.showEditModal = true;
  }
  closeDialog() {
    this.showEditModal = false;
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    setTimeout(() => {
      this.coreService.removeLoadingScreen();
    }, 1000);
  }
  onBack() {
    this.modeEventBack.emit("list");
  }
  resetAddNewModal() {}

  saveAddNewSystem() {}
}
