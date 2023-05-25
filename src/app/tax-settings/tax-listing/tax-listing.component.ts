import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MultiSelect } from "primeng/multiselect";
import { CoreService } from "src/app/core.service";
import { TaxSettingsService } from "../tax-settings.service";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { ConfirmDialog } from "primeng/confirmdialog";

@Component({
  selector: "app-tax-listing",
  templateUrl: "./tax-listing.component.html",
  styleUrls: ["./tax-listing.component.scss"],
})
export class TaxListingComponent implements OnInit {
  formName = "Tax Settings";
  applicationName = "Web Application";
  taxListingData: any[];

  objectKeys = Object.keys;
  @ViewChild("cd") cd: ConfirmDialog;

  showNoDataFound :boolean= false;

  cols: any[] = [
    { field: "taxCode", header: "Tax Code", width: "10%" },
    { field: "taxCodeDesc", header: "Tax Description", width: "20%" },
    { field: "criteriaMap", header: "Criteria", width: "55%" },
    { field: "status", header: "Status", width: "7%" },
    { field: "operation", header: "Operations", width: "8%" },
  ];

  showtaxCodeOptions: boolean = false;
  showtaxCodeDescOptions: boolean = false;
  showcriteriaMapOptions: boolean = false;
  showstatusOptions: boolean = false;

  taxCode = [];
  taxCodeDesc = [];
  criteriaMap = [];
  status = [];

  userData: any = {};
  selectedFiltertaxCode: any[] = [];
  selectedFiltertaxCodeDesc: any[] = [];
  selectedFiltercriteriaMap: any[] = [];
  selectedFilterstatus: any[] = [];
  taxListingApiData: any = {};
  loading: boolean = true;

  noDataMsg: string = "Tax Setting Data Not Available";

  linkedTaxCode: any = [];

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private taxSettingsService: TaxSettingsService,
    private setCriteriaService: SetCriteriaService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userData = JSON.parse(localStorage.getItem("userData"));
    console.log("userData", localStorage.getItem("userData"));
    this.getTaxCodeListData(this.userData.userId);
    this.loading = false;
  }

  getDecodedDataForListing(userId: any) {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.taxSettingsService.getCriteriaMasterData(
        this.formName,
        this.applicationName
      ),
      taxSettingListingData: this.taxSettingsService.getTaxCodeData(userId),
    })
      .pipe(
        take(1),
        map((response) => {
          const criteriaMasterData = response.criteriaMasterData;
          const taxSettingListingData = response.taxSettingListingData;

          console.log("::taxListingDataApi", taxSettingListingData);
          if (taxSettingListingData["data"]) {
            this.taxListingApiData = taxSettingListingData;
            this.taxListingApiData.data.forEach((tax) => {
              let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
                criteriaMap: tax.criteriaMap.split("&&&&")[0],
              });
              tax.criteriaMap = (
                this.setCriteriaService.decodeFormattedCriteria(
                  criteriaCodeText,
                  criteriaMasterData,
                  [""]
                ) as []
              ).join(", ");

              // tax.criteriaMap = tax.criteriaMap.split("&&&&")[0];
            });
            this.taxListingData = [...this.taxListingApiData.data];
           this.showNoDataFound = false;
            this.linkedTaxCode = [...this.taxListingApiData.linkedTaxCode];
            this.taxCode = this.taxListingApiData.taxCode.map((code) => {
              return { label: code, value: code };
            });
            this.taxCodeDesc = this.taxListingApiData.taxCodeDesc.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.criteriaMap = this.taxListingApiData.criteriaMap.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            // this.criteriaMap = this.taxListingApiData.criteriaMap.map(
            //   (criteriaMap) => {
            //     let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
            //       criteriaMap: criteriaMap.split("&&&&")[0],
            //     });
            //     let code = (
            //       this.setCriteriaService.decodeFormattedCriteria(
            //         criteriaCodeText,
            //         criteriaMasterData,
            //         [""]
            //       ) as []
            //     ).join(", ");
            //     return { label: code, value: code };
            //   }
            // );
            this.status = this.taxListingApiData.status.map((code) => {
              return { label: code, value: code };
            });
          } else {
            this.noDataMsg = taxSettingListingData["msg"];
            this.showNoDataFound = true;
          }
          return taxSettingListingData;
        })
      )
      .subscribe(
        (res) => {
          if (!res["data"]) {
            console.log("No data Found");
            this.showNoDataFound =true;
          }
          this.coreService.removeLoadingScreen();
          this.loading = false;
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.loading = false;
          this.showNoDataFound =true;
          console.log("Error in getting tax seting list data", err);
        }
      );
  }

  getTaxCodeListData(id: string) {
    this.getDecodedDataForListing(this.userData.userId);
  }

  viewTaxSetting(data: any) {
    this.router.navigate([
      "navbar",
      "tax-settings",
      "add-tax",
      data.taxCode,
      "edit",
    ]);
  }

  isLinked(id: any) {
    return this.linkedTaxCode.includes(id);
  }

  confirmStatus(e: any, taxCode: any, status) {
    e.preventDefault();
    console.log("codeeeeee", status);
    let type = "";
    let reqStatus = "";
    if (e.target.checked) {
      reqStatus = "Active";
      type = "activate";
    } else {
      reqStatus = "Inactive";
      type = "deactivate";
    }
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    let completeMsg = "";
    let isLinkedMsg = `Active Transactions Exist. </br>`;
    console.log(reqStatus, this.linkedTaxCode, taxCode);
    if (reqStatus == "Inactive" && this.linkedTaxCode.includes(taxCode)) {
      completeMsg =
        isLinkedMsg + `Do you wish to ` + type + ` the Tax Record: ${taxCode}?`;
    } else {
      completeMsg = `Do you wish to ` + type + ` the Tax Record: ${taxCode}?`;
    }
    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatus",
      accept: () => {
        this.updateStatus(e, reqStatus, taxCode);
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

  updateStatus(e: any, reqStatus: any, tax: string) {
    console.log(e.target, reqStatus);
    this.coreService.displayLoadingScreen();

    const formData = new FormData();
    formData.append("userId", this.userData.userId);
    formData.append("taxCode", tax);
    formData.append("status", reqStatus);
    this.updateTaxCodeStatus(formData, e.target);
    // }
  }

  updateTaxCodeStatus(data: any, sliderElm: any) {
    this.taxSettingsService.updateTaxSettingsStatus(data).subscribe((res) => {
      if (res["msg"]) {
        sliderElm.checked = sliderElm!.checked;
        this.coreService.showSuccessToast(res["msg"]);
        this.getTaxCodeListData(this.userData.userId);
      }
    });
  }

  cloneTax(data: any) {
    this.router.navigate([
      "navbar",
      "tax-settings",
      "add-tax",
      data.taxCode,
      "clone",
    ]);
  }

  addNewTaxPage() {
    this.router.navigate(["navbar", "tax-settings", "add-tax"]);
  }

  toggleFilterVisibility(field) {
    this[`show${field}Options`] = !this[`show${field}Options`];
  }

  hideFilterVisibility(field) {
    this[`show${field}Options`] = false;
  }

  getSelectedFilterArr(field: any) {
    return this[`selectedFilter${field}`];
  }

  setSelectedFilter(ms: MultiSelect, field: any) {
    this[`selectedFilter${field}`] = ms.value;
    console.log(ms.value, this[`selectedFilter${field}`]);
  }

  fieldFilterVisible(field: any) {
    return this[`show${field}Options`];
  }

  fieldFilterOptions(field: any): [] {
    return this[field];
  }
}
