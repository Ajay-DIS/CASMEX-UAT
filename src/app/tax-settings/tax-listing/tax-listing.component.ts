import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { MultiSelect } from "primeng/multiselect";
import { CoreService } from "src/app/core.service";
import { TaxSettingsService } from "../tax-settings.service";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { ConfirmationService } from "primeng/api";
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

  cols: any[] = [
    { field: "taxCode", header: "Tax Code", width: "10%" },
    { field: "taxCodeDesc", header: "Tax Description", width: "25%" },
    { field: "criteriaMap", header: "Criteria", width: "55%" },
    { field: "status", header: "Status", width: "10%" },
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
    private ngxToaster: ToastrService,
    private taxSettingsService: TaxSettingsService,
    private setCriteriaService: SetCriteriaService,
    private confirmationService: ConfirmationService
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
            this.linkedTaxCode = [...this.taxListingApiData.linkedTaxCode];
            this.taxCode = this.taxListingApiData.taxCode.map((code) => {
              return { label: code, value: code };
            });
            this.taxCodeDesc = this.taxListingApiData.taxCodeDesc.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            // this.criteriaMap = this.taxListingApiData.criteriaMap.map(
            //   (code) => {
            //     return { label: code, value: code };
            //   }
            // );
            this.criteriaMap = this.taxListingApiData.criteriaMap.map(
              (criteriaMap) => {
                let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
                  criteriaMap: criteriaMap.split("&&&&")[0],
                });
                let code = (
                  this.setCriteriaService.decodeFormattedCriteria(
                    criteriaCodeText,
                    criteriaMasterData,
                    [""]
                  ) as []
                ).join(", ");
                return { label: code, value: code };
              }
            );
            this.status = this.taxListingApiData.status.map((code) => {
              return { label: code, value: code };
            });
          } else {
            this.noDataMsg = taxSettingListingData["msg"];
          }
          return taxSettingListingData;
        })
      )
      .subscribe(
        (res) => {
          if (!res["data"]) {
            console.log("No data Found");
          }
          this.coreService.removeLoadingScreen();
          this.loading = false;
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.loading = false;
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
    this.confirmationService.confirm({
      message: `Do you wish to ` + type + ` Tax Code: ${taxCode}?`,
      key: "activeDeactiveStatus",
      accept: () => {
        this.updateStatus(e, reqStatus, taxCode);
        this.setHeaderSidebarBtn();
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
      },
    });
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

  updateStatus(e: any, reqStatus: any, tax: string) {
    console.log(e.target, reqStatus);
    if (this.linkedTaxCode.includes(tax)) {
      this.ngxToaster.warning(
        "This Tax Setting is already in transaction state"
      );
    } else {
      this.coreService.displayLoadingScreen();

      const formData = new FormData();
      formData.append("userId", this.userData.userId);
      formData.append("taxCode", tax);
      formData.append("status", reqStatus);
      this.updateTaxCodeStatus(formData, e.target);
    }
  }

  updateTaxCodeStatus(data: any, sliderElm: any) {
    this.taxSettingsService.updateTaxSettingsStatus(data).subscribe((res) => {
      if (res["msg"]) {
        sliderElm.checked = sliderElm!.checked;
        this.ngxToaster.success(res["msg"]);
        this.getTaxCodeListData(this.userData.userId);
      }
    });
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
