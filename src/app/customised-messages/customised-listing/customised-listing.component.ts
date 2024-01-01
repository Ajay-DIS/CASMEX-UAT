import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { CoreService } from "src/app/core.service";
import { MasterServiceService } from "src/app/master/master-service.service";
import { CustomisedMessagesServiceService } from "../customised-messages-service.service";

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
    private customisedMsgService: CustomisedMessagesServiceService,
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

  pageNumber = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();

    const translationKey = "Home.Settings";
    // this.customisedMessagesListData = this.customisedlist.data;
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

    this.getCustomisedMsgList();
  }

  getCustomisedMsgList() {
    console.log("ada");
    this.customisedMsgService
      .getCustomisedListData(String(this.pageNumber), String(this.pageSize))
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          if (res["status"] == "200") {
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
              this.customisedMessagesListData = [];
            } else {
              this.customisedMessagesListData = res["data"];
              console.log(this.customisedMessagesListData, res);
              // this.totalRecords = res.data.PaginationDetails.totalCount;
              // this.customerCode = res.customerCode?.map((code) => {
              //   if (code) return { label: code, value: code };
              // });
              // this.fullName = res.customerFullName?.map((code) => {
              //   if (code) return { label: code, value: code };
              // });
              // this.nationality = res.nationality?.map((code) => {
              //   if (code) return { label: code, value: code };
              // });
              // this.mobileNumber = res.mobileNumber?.map((code) => {
              //   if (code) return { label: code, value: code };
              // });
              // this.idType = res.idType?.map((code) => {
              //   if (code) return { label: code, value: code };
              // });
              // this.idNumber = res.idNumber?.map((code) => {
              //   if (code) return { label: code, value: code };
              // });
              // if (this.customisedMessagesListData) {
              //   this.customisedMessagesListData.forEach((data) => {
              //     data["promotionDetails"] = data["promotionDetails"]
              //       .split("#")
              //       .join("\n");
              //   });
              // }
            }
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast("Error in fething data");
        }
      );
  }

  addNewMessage() {
    this.router.navigate(["navbar", "customised-messages", "add-messages"]);
  }

  openClickForEdit(data: any) {
    this.router.navigate([
      "navbar",
      "customised-messages",
      "add-messages",
      data.messageCode,
      "edit",
    ]);
  }

  confirmStatus(e: any, data: any) {
    console.log(data, e);
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
      ` the Message Record: ${data["messageCode"]}?`;
    let formName = "";
    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatus",
      accept: () => {
        this.updateStatus(e, reqStatus, data);
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

  updateStatus(e: any, reqStatus: any, data: any) {
    this.coreService.displayLoadingScreen();
    const formData = new FormData();
    formData.append("messageCode", data["messageCode"]);
    formData.append("status", reqStatus);
    formData.append("languages", data["languages"]);
    // const newValues = [
    //   {
    //     messageCode: data["messageCode"],
    //     status: reqStatus,
    //   },
    // ];
    this.updateMessageCodeStatus(reqStatus, e.target, formData);
  }

  updateMessageCodeStatus(reqStatus: any, sliderElm: any, formData) {
    console.log(formData, reqStatus);

    this.customisedMsgService.updateCustomisedListStatus(formData).subscribe(
      (res) => {
        let message = "";
        if (res["data"]) {
          message = res["data"];
          sliderElm.checked = sliderElm!.checked;
          this.coreService.showSuccessToast(message);
          this.getCustomisedMsgList();
          // this.coreService.removeLoadingScreen();
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
