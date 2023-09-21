import { DatePipe } from "@angular/common";
import { Component, InjectionToken, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "src/app/core.service";
import { CriteriaSettingsService } from "../criteria-settings.service";
import { MultiSelect } from "primeng/multiselect";

@Component({
  selector: "app-criteria-listing",
  templateUrl: "./criteria-listing.component.html",
  styleUrls: ["./criteria-listing.component.scss"],
})
export class CriteriaListingComponent implements OnInit {
  noDataMsg: string = "Criteria Setting Data Not Available";

  criteriaSettingApiData: any;
  criteriaSettingData: any[] = [];

  showNoDataFound: boolean = false;

  showapplicationsOptions: boolean = false;
  showmoduleNameOptions: boolean = false;
  showformOptions: boolean = false;
  showtotalCriteraiFieldOptions: boolean = false;
  showtotalDisplayFieldsOptions: boolean = false;
  showtotalListFieldsOptions: boolean = false;
  showcreatedDateOptions: boolean = false;
  showcreatedByOptions: boolean = false;

  objectKeys = Object.keys;

  applications: any[];
  moduleName: any[];
  form: any[];
  totalCriteraiField: any[];
  totalDisplayField: any = [];
  totalListField: any = [];
  createdDate: any[];
  createdBy: any[];

  clickforview = false;
  criteriaDataArrayView = [];

  selectedFilterapplications: any[] = [];
  selectedFiltermoduleName: any[] = [];
  selectedFilterform: any[] = [];
  selectedFiltertotalCriteraiField: any[] = [];
  selectedFiltertotalDisplayField: any[] = [];
  selectedFiltertotalListField: any[] = [];
  selectedFiltercreatedDate: any[] = [];
  selectedFiltercreatedBy: any[] = [];

  cols: any[] = [
    { field: "applications", header: "Applications", width: "15%" },
    { field: "moduleName", header: "Module", width: "15%" },
    { field: "form", header: "Form", width: "15%" },
    {
      field: "totalCriteraiField",
      header: "Total Criteria Fields",
      width: "15%",
    },
    { field: "totalListField", header: "Total List Fields", width: "15%" },
    { field: "createdDate", header: "Created Date", width: "15%" },
    { field: "createdBy", header: "Created By", width: "15%" },
    { field: "operations", header: "Operations", width: "10%" },
  ];

  loading = true;
  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private criterisSettingsService: CriteriaSettingsService
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.criterisSettingsService
      .getCriteriaSettingListing()
      .subscribe(
        (res) => {
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast(res["msg"]);
            }
          } else {
            if (!res["msg"]) {
              this.criteriaSettingApiData = res;
              this.criteriaSettingData = res["data"];
              this.showNoDataFound = false;
              this.formatApiData();
              this.setFilterOptions();
            } else {
              this.coreService.showWarningToast(res["msg"]);
              this.criteriaSettingData = [];
              this.showNoDataFound = true;
            }
          }
        },
        (err) => {
          console.log("Error in criterisSettingListing", err);
          this.showNoDataFound = true;
        }
      )
      .add(() => {
        this.loading = false;
        this.coreService.removeLoadingScreen();
      });
  }

  formatApiData() {
    this.criteriaSettingData.forEach((criteria) => {
      criteria["totalListField"] = "7";
      criteria["totalCriteraiField"] = `${criteria["totalCriteraiField"]}`;
      criteria["createdDate"] = this.datePipe.transform(
        criteria["createdDate"]
      );
    });
    this.loading = false;
  }

  setFilterOptions() {
    this.applications = this.criteriaSettingApiData.applications.map((code) => {
      return { label: code, value: code };
    });
    this.form = this.criteriaSettingApiData.form.map((code) => {
      return { label: code, value: code };
    });
    this.moduleName = this.criteriaSettingApiData.moduleName.map((code) => {
      return { label: code, value: code };
    });
    this.totalCriteraiField = this.criteriaSettingApiData[
      "totalCriteraiField"
    ].map((code) => {
      return { label: code, value: code };
    });
    this.totalListField = [{ label: "7", value: "7" }];
    let createdDatesApi = this.criteriaSettingApiData.createdDate.map(
      (code) => {
        let formatDate = this.datePipe.transform(code);
        return formatDate;
      }
    );
    this.createdDate = [...new Set(createdDatesApi.map((v) => v))].map(
      (value) => {
        return { label: value, value: value };
      }
    );
    this.createdBy = this.criteriaSettingApiData.createdBy.map((code) => {
      return { label: code, value: code };
    });
  }
  openClickForView(data) {
    this.criteriaDataArrayView = data.cmCriteriaDataDetails;
    this.criteriaDataArrayView["applications"] = data["applications"];
    this.criteriaDataArrayView["form"] = data["form"];
    this.coreService.setHeaderStickyStyle(false);
    this.coreService.setSidebarBtnFixedStyle(false);
    this.clickforview = true;
  }
  openClickForClone(data: any, type: any) {
    this.router.navigate([
      "navbar",
      "criteria-settings",
      "add-criteria-settings",
      data.id,
      type,
    ]);
  }

  closeDialog() {
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    setTimeout(() => {
      this.coreService.removeLoadingScreen();
    }, 1000);
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
  }

  fieldFilterVisible(field: any) {
    return this[`show${field}Options`];
  }

  fieldFilterOptions(field: any): [] {
    return this[field];
  }
}
