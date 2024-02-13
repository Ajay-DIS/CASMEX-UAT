import { Component, OnInit, ViewChild } from "@angular/core";
import { ConfirmDialog } from "primeng/confirmdialog";
import { RateServiceService } from "../rate-service.service";
import { CoreService } from "src/app/core.service";
import { ConfirmationService } from "primeng/api";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-rate-listing",
  templateUrl: "./rate-listing.component.html",
  styleUrls: ["./rate-listing.component.scss"],
})
export class RateListingComponent implements OnInit {
  rateListingData: any[];

  objectKeys = Object.keys;
  @ViewChild("cd") cd: ConfirmDialog;

  showNoDataFound: boolean = false;

  userId = "";
  clientCode = "CMX000091";
  licenseCountry = "In";

  mode = "add";

  cols: any[] = [
    { field: "currencyCode", header: "Currency Code", width: "10%" },
    { field: "currency", header: "Currency", width: "15%" },
    { field: "marginRatio", header: "Margin Ratio", width: "20%" },
    { field: "factor", header: "Factor", width: "25%" },
    { field: "rateMask", header: "Rate Mask", width: "20%" },
    { field: "status", header: "Status", width: "10%" },
  ];

  constructor(
    private rateService: RateServiceService,
    private coreService: CoreService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    const translationKey = "Home.Settings";
    this.coreService
      .translate(translationKey)
      .then((translatedTitle: string) => {
        this.coreService.setPageTitle(translatedTitle);
      });
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];

    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.getRateListingdata();
  }
  getRateListingdata() {
    this.coreService.displayLoadingScreen();
    this.rateService
      .getRateListingData(this.clientCode, this.licenseCountry)
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          console.log("data", res);
          this.rateListingData = res["data"]["rateSettings"];
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast(
            "Some error while fetching doc data, Try again in sometime"
          );
        }
      );
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
      ` the Rate Record: ${data["currencyCode"]}?`;
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
    this.updateRateCodeStatus(e.target, data, reqStatus);
  }

  updateRateCodeStatus(sliderElm: any, data: any, reqStatus: any) {
    this.rateService
      .updateRateSettingsStatus(
        this.clientCode,
        this.licenseCountry,
        data.currencyCode,
        reqStatus
      )
      .subscribe(
        (res) => {
          let message = "";
          if (res["error"] == "true") {
            this.coreService.removeLoadingScreen();
            this.coreService.showWarningToast(res["error"]);
          } else {
            if (res["msg"]) {
              message = res["msg"];
              sliderElm.checked = sliderElm!.checked;
              this.getRateListingdata();
              this.coreService.showSuccessToast(message);
            } else {
              this.coreService.removeLoadingScreen();
              message = "Error in fetching data, Please try again later";
              this.coreService.showWarningToast(message);
            }
          }
        },
        (err) => {
          console.log(err);
          this.coreService.removeLoadingScreen();
        }
      );
  }

  upperCaseSpaceFormat(value: string): string {
    // Trim extra spaces and convert to uppercase
    return value.trim().toUpperCase().replace(/\s+/g, " ");
  }

  onSubmit() {
    this.coreService.displayLoadingScreen();
    console.log("data", this.rateListingData);
    let formattedRateListingData = {
      clientCode: this.clientCode,
      licenseCountry: this.licenseCountry,
      rateSettings: this.rateListingData,
    };
    formattedRateListingData.rateSettings.forEach((ele) => {
      console.log("ratemask", ele);
      ele["rateMask"] = this.upperCaseSpaceFormat(ele["rateMask"]);
    });
    let service;
    // if (this.mode == "edit") {
    let data = formattedRateListingData;

    service = this.rateService.updateRateSettings(data, this.userId);
    console.log("::", data);
    // } else {
    //   let data = formattedRateListingData;
    //   console.log("saveeee", data);
    //   service = this.rateService.saveRateSettings(data, this.userId);
    // }

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
              this.coreService.removeLoadingScreen();
              this.getRateListingdata();
            }
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log("error in save", err);
          this.coreService.showWarningToast(
            "Something went wrong, Please try again later"
          );
        }
      );
    }
  }

  onReset() {
    console.log("ratemask", this.rateListingData);
    this.coreService.setSidebarBtnFixedStyle(false);
    this.confirmationService.confirm({
      message: "Are you sure, you want to clear applied changes ?",
      key: "resetRateSettingsConfirmation",
      accept: () => {
        this.setHeaderSidebarBtn(true);
        // this.rateListingData.forEach((ele) => {
        //   ele["marginRatio"] = "";
        //   ele["rateMask"] = "";
        //   ele["rateMask"] = "";
        // });
        this.getRateListingdata();
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn(false);
      },
    });
  }
}
