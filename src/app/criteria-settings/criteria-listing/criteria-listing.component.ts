import { DatePipe } from "@angular/common";
import { Component, InjectionToken, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
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

  dummyCriteriaSettingsData = {
    totalCriteraiField: ["2", "3", "5"],
    createdDate: [
      "2023-01-23 14:04:59.247",
      "2023-02-22 18:01:45.905",
      "2023-01-18 14:30:43.635",
      "2023-01-18 15:04:33.004",
    ],
    data: [
      {
        id: 83,
        applications: "Web Application",
        form: "Bank Routings",
        totalCriteraiField: 5,
        status: "A",
        createdBy: "Yogesh",
        createdByID: "yogeshm",
        createdDate: "2023-02-22T12:31:45.905+00:00",
        cmCriteriaDataDetails: [
          {
            id: 152,
            fieldName: "Service Category",
            displayName: "Service Category",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 4,
            iSMandatory: "no",
          },
          {
            id: 154,
            fieldName: "Country",
            displayName: "Country",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 1,
            iSMandatory: "yes",
          },
          {
            id: 151,
            fieldName: "LCY Amount",
            displayName: "LCY Amount",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 5,
            iSMandatory: "no",
          },
          {
            id: 153,
            fieldName: "Organization",
            displayName: "Organization",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 2,
            iSMandatory: "yes",
          },
          {
            id: 155,
            fieldName: "Service Type",
            displayName: "Service Type",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 3,
            iSMandatory: "no",
          },
        ],
      },
      {
        id: 64,
        applications: "Web Application",
        form: "Payment Mode Settings1",
        totalCriteraiField: 3,
        status: "A",
        createdBy: "Yogesh Mishra",
        createdByID: "yogeshm",
        createdDate: "2023-01-23T08:34:59.247+00:00",
        cmCriteriaDataDetails: [
          {
            id: 131,
            fieldName: "Branch",
            displayName: "Branch",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 2,
            iSMandatory: "no",
          },
          {
            id: 132,
            fieldName: "Correspondent",
            displayName: "Correspondent",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 1,
            iSMandatory: "no",
          },
          {
            id: 130,
            fieldName: "Country",
            displayName: "Country",
            fieldType: "Smart Search",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 3,
            iSMandatory: "no",
          },
        ],
      },
      {
        id: 52,
        applications: "Web Application",
        form: "Payment Mode Settings",
        totalCriteraiField: 3,
        status: "A",
        createdBy: "Yogesh Mishra",
        createdByID: "yogeshm",
        createdDate: "2023-01-18T09:34:33.004+00:00",
        cmCriteriaDataDetails: [
          {
            id: 114,
            fieldName: "Correspondent",
            displayName: "Correspondent",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 1,
            iSMandatory: "no",
          },
          {
            id: 113,
            fieldName: "Branch",
            displayName: "Branch",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 2,
            iSMandatory: "no",
          },
          {
            id: 115,
            fieldName: "Country",
            displayName: "Country",
            fieldType: "Smart Search",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 3,
            iSMandatory: "no",
          },
        ],
      },
      {
        id: 50,
        applications: "Web Application",
        form: "TAX setting",
        totalCriteraiField: 2,
        status: "A",
        createdBy: "Yogesh",
        createdByID: "yogeshm",
        createdDate: "2023-01-18T09:00:43.635+00:00",
        cmCriteriaDataDetails: [
          {
            id: 108,
            fieldName: "State",
            displayName: "State",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 1,
            iSMandatory: "no",
          },
          {
            id: 109,
            fieldName: "Country",
            displayName: "Country",
            fieldType: "Smart Search",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 2,
            iSMandatory: "no",
          },
        ],
      },
    ],
    form: [
      "TAX setting",
      "Payment Mode Settings",
      "Bank Routings",
      "Payment Mode Settings1",
    ],
    createdBy: ["Yogesh", "Yogesh Mishra"],
    createdByID: ["yogeshm"],
    applications: ["Web Application"],
    status: ["A"],
  };

  criteriaSettingApiData: any;
  criteriaSettingData: any[] = [];
  // criteriaSettingData = this.dummyCriteriaSettingsData.data;

  showapplicationsOptions: boolean = false;
  showformOptions: boolean = false;
  showtotalCriteraiFieldOptions: boolean = false;
  showtotalListFieldsOptions: boolean = false;
  showcreatedDateOptions: boolean = false;
  showcreatedByOptions: boolean = false;

  applications: any[];
  form: any[];
  totalCriteraiField: any[];
  totalListField: any = [];
  createdDate: any[];
  createdBy: any[];
  //suresh
  clickforview = false;
  criteriaDataArrayView = [];

  selectedFilterapplications: any[] = [];
  selectedFilterform: any[] = [];
  selectedFiltertotalCriteraiField: any[] = [];
  selectedFiltertotalListField: any[] = [];
  selectedFiltercreatedDate: any[] = [];
  selectedFiltercreatedBy: any[] = [];
  //suresh

  cols: any[] = [
    { field: "applications", header: "Applications", width: "15%" },
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
    private criterisSettingsService: CriteriaSettingsService,
    private ngxToaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    //
    this.criterisSettingsService
      .getCriteriaSettingListing()
      .subscribe(
        (res) => {
          console.log(res);
          this.criteriaSettingApiData = res;
          if (res["data"]) {
            this.criteriaSettingData = res["data"];
            this.formatApiData();
            this.setFilterOptions();
          } else {
            this.ngxToaster.warning(res["msg"]);
          }
        },
        (err) => {
          console.log("Error in criterisSettingListing", err);
        }
      )
      .add(() => {
        this.loading = false;
        this.coreService.removeLoadingScreen();
      });

    //
  }

  filter(a: any, b: any) {
    console.log("a:", a);
    console.log("b:", b);
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
    console.log("data", data);
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
  // openClickForEdit(data: any) {
  //   this.router.navigate([
  //     "navbar",
  //     "criteria-settings",
  //     "add-criteria-settings",
  //     data.id,
  //   ]);
  // }

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
