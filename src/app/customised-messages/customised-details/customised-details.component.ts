import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "src/app/core.service";
import { CustomisedMessagesServiceService } from "../customised-messages-service.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { element } from "protractor";
import { ConfirmationService } from "primeng/api";

@Component({
  selector: "app-customised-details",
  templateUrl: "./customised-details.component.html",
  styleUrls: ["./customised-details.component.scss"],
})
export class CustomisedDetailsComponent implements OnInit {
  primaryColor = "var(--primary-color)";
  deactivated: boolean = false;
  editDeactivated: boolean = false;
  mode = "add";
  messageCode = "";
  messageType = "";
  messageTypeSelected = "";
  messageTypeOptions: any = [];
  messageLanguage = "";
  messageLanguageOptions: any = [];
  messageHeader = "";
  messageDescription = "";
  messageTypeChangeValue = "";

  messageLanguageStatus = "";

  userData: any = {};

  messageRows: any[] = [
    {
      messageLanguage: "",
      messageHeader: "",
      messageDescription: "",
    },
  ];

  newValues: any[] = [];
  dataformsg: any[] = [];

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private customisedMsgService: CustomisedMessagesServiceService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    const translationKey = "Home.Settings";
    this.coreService
      .translate(translationKey)
      .then((translatedTitle: string) => {
        this.coreService.setPageTitle(translatedTitle);
      });

    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.userData = JSON.parse(localStorage.getItem("userData"));

    const params = this.route.snapshot.params;
    if (params && params.id) {
      this.mode = this.route.snapshot.routeConfig.path.substring(
        this.route.snapshot.routeConfig.path.lastIndexOf("/") + 1
      );
      this.messageCode = params.id;
    }

    console.log("111", this.messageTypeOptions, this.messageLanguageOptions);

    this.getCustomisedDetails();
  }

  getCustomisedDetails() {
    if (this.mode == "add") {
      this.coreService.displayLoadingScreen();
    }
    this.customisedMsgService.getCustomisedDetailsData().subscribe(
      (res) => {
        this.coreService.removeLoadingScreen();
        if (res["status"] == "200") {
          if (res["error"]) {
            this.coreService.showWarningToast(res["error"]);
            // this.dataformsg = ;
          } else {
            this.dataformsg = res["data"];
            console.log(this.dataformsg);
            this.messageTypeOptions = this.dataformsg["systemMessageTypes"].map(
              (option) => {
                return {
                  code: option.code,
                  name: option.codeName,
                  icons: option.icons,
                };
              }
            );
            this.messageLanguageOptions = this.dataformsg[
              "systemLanguages"
            ].map((option) => {
              return { code: option.code, name: option.codeName };
            });
            if (this.mode == "edit") {
              this.getMessageForEditApi();
            }
          }
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Error in fething data");
      }
    );
  }

  getMessageForEditApi() {
    this.coreService.displayLoadingScreen();
    this.customisedMsgService.getMessageDataForEdit(this.messageCode).subscribe(
      (res) => {
        if (res["status"] == "200") {
          if (res["error"]) {
            this.coreService.showWarningToast(res["error"]);
            // this.dataformsg = ;
          } else {
            console.log(res);
            this.messageCode = res["messageCode"];
            // this.messageType = res["messageType"];
            if (res["messageType"]) {
              this.messageType = res["messageType"];
              const messageTypeValue = this.messageTypeOptions.find(
                (option) => option.code === res["messageType"]
              );
              console.log("IcomessageTypeChangeValue", messageTypeValue);
              this.messageTypeChangeValue = messageTypeValue.name;
            }
            console.log("messageType", this.messageType);
            this.messageRows = [];

            if (res["messageDetails"] && res["messageDetails"].length > 0) {
              // Assuming there can be multiple message details
              res["messageDetails"].forEach((detail) => {
                this.messageRows.push({
                  id: detail["id"],
                  messageLanguage: detail["languages"],
                  messageHeader: detail["messageHeader"],
                  messageDescription: detail["messageDescription"],
                });
                this.messageLanguageStatus = detail["languages"];
                if (detail["status"] == "D") {
                  this.deactivated = true;
                  this.editDeactivated = false;
                } else {
                  this.deactivated = false;
                  this.editDeactivated = true;
                }
              });
            }
            this.coreService.removeLoadingScreen();
          }
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Error in fething data");
      }
    );
  }

  onMessageTypeChange(value: any) {
    this.coreService.displayLoadingScreen();
    console.log("value", value);
    const messageTypeValue = this.messageTypeOptions.find(
      (option) => option.code === value
    );
    console.log("Icons:", messageTypeValue);
    // if (messageTypeValue && messageTypeValue.name) {
    //   return `${messageTypeValue.name}`;
    // }
    this.messageTypeChangeValue = messageTypeValue.name;
    this.getCustomisedCode(messageTypeValue.name);
  }

  getIconSrc(codeName: string): string {
    // console.log("CodeName:", codeName, this.messageTypeOptions);

    const messageType = this.messageTypeOptions.find(
      (option) => option.name === codeName
    );

    // console.log("MessageType:", messageType);

    if (messageType && messageType.icons) {
      // console.log("Icons:", messageType.icons);
      return `data:image/png;base64,${messageType.icons}`;
    } else {
      console.log("Icons not found");
      return ""; // or provide a default icon source
    }
  }
  getIconSrcSelected(code: string): string {
    console.log("Code:", code, this.messageTypeOptions);
    console.log("Code:", code, this.messageType);

    const messageType = this.messageTypeOptions.find(
      (option) => option.code === code
    );
    console.log("MessageType:", messageType);

    if (messageType && messageType.icons) {
      console.log("Icons:", messageType.icons);
      this.messageTypeSelected = messageType.name;
      console.log("Icons not found", this.messageTypeSelected);
      return `data:image/png;base64,${messageType.icons}`;
    } else {
      console.log("Icons not found");
      return ""; // or provide a default icon source
    }
  }

  getCustomisedCode(messageTypeValue: any) {
    this.customisedMsgService.getCustomisedCodeData(messageTypeValue).subscribe(
      (res) => {
        this.coreService.removeLoadingScreen();
        if (res["status"] == "200") {
          if (res["error"]) {
            this.coreService.showWarningToast(res["error"]);
            // this.dataformsg = ;
          } else {
            // this.customisedMessagesListData = res["data"];
            console.log(res);
            this.messageCode = res["data"]["code"];
          }
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Error in fething data");
      }
    );
  }
  saveAddNewMessage(action: any) {
    this.coreService.displayLoadingScreen();
    console.log(action);
    let messageHeaderMissing = false;
    let messageLanguageMissing = false;
    let messageTypeMissing = false;
    let messageDescriptionMissing = false;
    console.log("adsa", this.messageRows);

    if (this.mode == "edit") {
      this.newValues = this.messageRows.map((row) => {
        return {
          id: row.id,
          messageCode: this.messageCode,
          messageType: this.messageTypeChangeValue,
          messageHeader: row.messageHeader.toUpperCase(),
          messageDescription: row.messageDescription.toUpperCase(),
          languages: row.messageLanguage,
          status: "A",
        };
      });
    } else {
      this.newValues = this.messageRows.map((row) => {
        return {
          messageCode: this.messageCode,
          messageType: this.messageTypeChangeValue,
          messageHeader: row.messageHeader.toUpperCase(),
          messageDescription: row.messageDescription.toUpperCase(),
          languages: row.messageLanguage,
          status: "A",
        };
      });
    }
    this.newValues.forEach((element) => {
      console.log(element);
      if (!element["messageType"] || element["messageType"] == "null") {
        messageTypeMissing = true;
      }
      if (!element["languages"] || element["languages"] == "null") {
        messageLanguageMissing = true;
      }
      if (!element["messageHeader"]) {
        messageHeaderMissing = true;
      }
      if (!element["messageDescription"]) {
        messageDescriptionMissing = true;
      }
    });
    if (messageTypeMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please Select Message Type.");
    } else if (messageLanguageMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please Select language.");
    } else if (messageDescriptionMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please Fill Message Description.");
    } else if (messageHeaderMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please Fill Message Header.");
    } else if (this.messageRows.length > 1) {
      const messageLanguages = this.messageRows.map(
        (row) => row.messageLanguage
      );
      const uniqueMessageLanguages = new Set(messageLanguages);

      if (messageLanguages.length !== uniqueMessageLanguages.size) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast(
          "Same Message Languages are not allowed."
        );
        return;
      }
    } else {
      console.log("Rows to save:", this.newValues);
      let service;
      if (this.mode == "edit") {
        let data = this.newValues;
        service = this.customisedMsgService.updateMessage(
          data,
          this.userData.userId
        );
      } else {
        let data = this.newValues;
        service = this.customisedMsgService.addNewMessage(
          data,
          this.userData.userId
        );
      }

      if (service) {
        service.subscribe(
          (res) => {
            if (
              res["status"] &&
              typeof res["status"] == "string" &&
              (res["status"] == "400" || res["status"] == "500")
            ) {
              if (res["error"]) {
                this.coreService.showWarningToast(res["error"]);
              } else {
                this.coreService.showWarningToast(
                  "Something went wrong, Please try again later"
                );
              }
            } else {
              if (res["msg"]) {
                this.coreService.showSuccessToast(res.msg);
                if (action == "save") {
                  // this.showAddnewModal = false;
                  // this.getMasterListData(this.formName);
                  this.router.navigate([`navbar/customised-messages`]);
                  this.setHeaderSidebarBtn();
                } else if (action == "saveAndAddNew") {
                  this.getCustomisedDetails();
                  this.messageType = "";
                  this.messageCode = "";
                  this.messageRows = [
                    {
                      messageLanguage: "",
                      messageHeader: "",
                      messageDescription: "",
                    },
                  ];
                }
              } else if (res["error"]) {
                this.coreService.showWarningToast(res["error"]);
                this.coreService.removeLoadingScreen();
              }
            }
          },
          (err) => {
            this.coreService.removeLoadingScreen();
            console.log("error in saveAddNew", err);
            this.coreService.showWarningToast(
              "Something went wrong, Please try again later"
            );
          }
        );
      }
    }
  }
  reset() {
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    this.confirmationService.confirm({
      message: "Are you sure, you want to clear all the fields ?",
      key: "resetMessageConfirmation",
      accept: () => {
        this.messageRows = [];
        this.getCustomisedDetails();
        this.messageType = "";
        this.messageCode = "";
        this.messageRows = [
          {
            messageLanguage: "",
            messageHeader: "",
            messageDescription: "",
          },
        ];
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
      },
    });
  }

  editDisableModel() {
    this.editDeactivated = !this.editDeactivated;
  }
  addMsg() {
    this.messageRows.push({
      messageLanguage: "",
      messageHeader: "",
      messageDescription: "",
    });
    console.log("message", this.messageRows);
  }
  deleteMsg(index: number) {
    this.messageRows.splice(index, 1);
  }
  setHeaderSidebarBtn() {
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    setTimeout(() => {
      this.coreService.removeLoadingScreen();
    }, 1000);
  }

  onActive(data: any) {
    this.confirmMessageEditStatus();
  }
  confirmMessageEditStatus() {
    let type = "";
    let reqStatus = "";
    if (this.deactivated == true) {
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
      ` the Message Record: ${this.messageCode}?`;

    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatusMessage",
      accept: () => {
        this.updateStatus(reqStatus);
        this.setHeaderSidebarBtn();
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
      },
    });
  }
  updateStatus(reqStatus: any) {
    this.coreService.displayLoadingScreen();

    const formData = new FormData();
    formData.append("messageCode", this.messageCode);
    formData.append("status", reqStatus);
    formData.append("languages", this.messageLanguageStatus);
    this.updateMessageStatus(formData);
  }

  updateMessageStatus(formData: any) {
    this.customisedMsgService.updateCustomisedListStatus(formData).subscribe(
      (res) => {
        if (
          res["status"] &&
          typeof res["status"] == "string" &&
          (res["status"] == "400" || res["status"] == "500")
        ) {
          if (res["error"]) {
            this.coreService.showWarningToast(res["error"]);
          } else {
            this.coreService.showWarningToast("Some error in fetching data");
          }
        } else {
          let message = "";
          if (res["error"] == "true") {
            this.coreService.removeLoadingScreen();
            this.coreService.showWarningToast(message);
          } else {
            if (res["data"]) {
              message = res["data"];
              this.deactivated = !this.deactivated;
              this.editDeactivated = !this.editDeactivated;
              this.coreService.showSuccessToast(message);
            } else {
              this.coreService.removeLoadingScreen();
              message = "Error in fetching data, Please try again later";
              this.coreService.showWarningToast(message);
            }
          }
        }
      },
      (err) => {
        console.log("Error in updateBankRouteStatus", err);
        this.coreService.removeLoadingScreen();
      }
    );
  }
}
