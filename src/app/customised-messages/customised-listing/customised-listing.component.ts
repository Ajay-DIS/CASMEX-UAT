import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { CoreService } from "src/app/core.service";
import { MasterServiceService } from "src/app/master/master-service.service";

@Component({
  selector: "app-customised-listing",
  templateUrl: "./customised-listing.component.html",
  styleUrls: ["./customised-listing.component.scss"],
})
export class CustomisedListingComponent implements OnInit {
  userData: any = {};
  customisedlist: any = {
    data: [
      {
        id: 0,
        userID: null,
        messageCode: "SUCC0001",
        messageType: "success",
        messageDescription: "applied fields saved successfully",
        messageHeader: "success",
        status: "Active",
      },
      {
        id: 0,
        userID: null,
        messageCode: "WARG0002",
        messageType: "warning",
        messageDescription: "please fill the required fields",
        messageHeader: "warning",
        status: "Active",
      },
      {
        id: 0,
        userID: null,
        messageCode: "FAIL0003",
        messageType: "fail",
        messageDescription: "applied fields failed to save ",
        messageHeader: "fail",
        status: "Active",
      },
      {
        id: 0,
        userID: null,
        messageCode: "ERR0003",
        messageType: "error",
        messageDescription: "Error while saving",
        messageHeader: "error",
        status: "Active",
      },
    ],
  };

  customisedMessagesListData: any = [];

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private masterService: MasterServiceService,
    private confirmationService: ConfirmationService
  ) {}

  cols: any[] = [
    { field: "messageCode", header: "Message Code", width: "13%" },
    { field: "messageType", header: "Message Type", width: "15%" },
    { field: "messageHeader", header: "Message Header", width: "20%" },
    {
      field: "messageDescription",
      header: "Message Description",
      width: "32%",
    },
    { field: "status", header: "Status", width: "10%" },
    { field: "action", header: "Action", width: "10%" },
  ];
  customisedMessagesTableLoading = false;

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();

    const translationKey = "Home.Settings";
    this.customisedMessagesListData = this.customisedlist.data;
    console.log(this.customisedMessagesListData);

    // Update translation
    this.coreService
      .translate(translationKey)
      .then((translatedTitle: string) => {
        this.coreService.setPageTitle(translatedTitle);
      });

    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.coreService.removeLoadingScreen();
  }

  addNewMessage() {}

  confirmStatus(e: any, data: any) {
    e.preventDefault();
    let type = "";
    let reqStatus = "";
    if (e.target.checked) {
      reqStatus = "A";
      type = "activate";
    } else {
      reqStatus = "D";
      type = "deactivate";
    }
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    let completeMsg = "";
    completeMsg =
      `<img src="../../../assets/warning.svg"><br/><br/>` +
      `Do you wish to ` +
      type +
      ` the Tax Record: ${data["code"]}?`;
    let formName = "";
    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatus",
      accept: () => {
        this.updateStatus(e, reqStatus, data, formName);
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

  updateStatus(e: any, reqStatus: any, data: any, formName) {
    this.coreService.displayLoadingScreen();
    this.updateTaxCodeStatus(reqStatus, e.target, data, formName);
  }

  updateTaxCodeStatus(reqStatus: any, sliderElm: any, Data: any, formName) {
    console.log(Data, reqStatus, formName);

    this.masterService
      .updateMasterStatus(String(Data.id), reqStatus, formName)
      .subscribe(
        (res) => {
          let message = "";
          if (res["msg"]) {
            message = res["msg"];
            sliderElm.checked = sliderElm!.checked;
            this.coreService.showSuccessToast(message);
          } else {
            this.coreService.removeLoadingScreen();
            message = "Error in fetching data, Please try again later";
            this.coreService.showWarningToast(message);
          }
        },
        (err) => {
          console.log(err);
          this.coreService.removeLoadingScreen();
        }
      );
  }
}
