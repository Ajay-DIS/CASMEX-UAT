import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "src/app/core.service";
import { SearchSettingsService } from "../search-settings.service";
import { DatePipe } from "@angular/common";
import { MultiSelect } from "primeng/multiselect";
import { ConfirmationService } from "primeng/api";

@Component({
  selector: "app-search-listing",
  templateUrl: "./search-listing.component.html",
  styleUrls: ["./search-listing.component.scss"],
})
export class SearchListingComponent implements OnInit {
  noDataMsg: string = "search Setting Data Not Available";

  searchSettingApiData: any;
  searchSettingData: any[] = [];

  showNoDataFound: boolean = false;

  showapplicationNameOptions: boolean = false;
  showformNameOptions: boolean = false;
  showmoduleNameOptions: boolean = false;
  showtotalCriteraiFieldOptions: boolean = false;
  showtotalDisplayFieldsOptions: boolean = false;
  showcreatedDateOptions: boolean = false;
  showcreatedByOptions: boolean = false;
  showstatusOptions: boolean = false;

  objectKeys = Object.keys;

  linkedSearchSetting: any = [];

  applicationName: any[];
  formName: any[];
  moduleName: any[];
  totalCriteraiField: any[];
  totalDisplayField: any = [];
  createdDate: any[];
  createdBy: any[];
  status: any[];
  //suresh
  clickforview = false;
  searchDataArrayView = [];

  selectedFilterapplicationName: any[] = [];
  selectedFilterformName: any[] = [];
  selectedFiltermoduleName: any[] = [];
  selectedFiltertotalCriteraiField: any[] = [];
  selectedFiltertotalDisplayField: any[] = [];
  selectedFiltercreatedDate: any[] = [];
  selectedFiltercreatedBy: any[] = [];
  selectedFilterstatus: any[] = [];
  //suresh

  userData: any = {};

  cols: any[] = [
    { field: "applicationName", header: "Applications", width: "12%" },
    { field: "moduleName", header: "Module", width: "12%" },
    { field: "formName", header: "Form", width: "14%" },
    {
      field: "totalCriteraiField",
      header: "Total search Fields",
      width: "14%",
    },
    {
      field: "totalDisplayField",
      header: "Total Display Fields",
      width: "14%",
    },
    { field: "createdDate", header: "Created Date", width: "10%" },
    { field: "createdBy", header: "Created By", width: "10%" },
    { field: "status", header: "Status", width: "9%" },
    { field: "operations", header: "Operations", width: "5%" },
  ];

  loading = true;
  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private searchSettingsService: SearchSettingsService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.userData = JSON.parse(localStorage.getItem("userData"));
    //
    this.getSearchSettingListData();
    //
  }

  getSearchSettingListData() {
    this.searchSettingsService
      .getSearchSettingListing()
      .subscribe(
        (res) => {
          console.log(res);
          this.searchSettingApiData = res;
          if (res["data"]) {
            this.searchSettingData = res["data"];
            this.showNoDataFound = false;
            this.formatApiData();
            this.setFilterOptions();
          } else {
            this.coreService.showWarningToast(res["msg"]);
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

  filter(a: any, b: any) {
    console.log("a:", a);
    console.log("b:", b);
  }

  formatApiData() {
    this.searchSettingData.forEach((search) => {
      search["totalDisplayField"] = "7";
      search["totalCriteraiField"] = `${search["totalCriteraiField"]}`;
      search["createdDate"] = this.datePipe.transform(search["createdDate"]);
    });
    this.loading = false;
  }

  setFilterOptions() {
    this.applicationName = this.searchSettingApiData.applicationName.map(
      (code) => {
        return { label: code, value: code };
      }
    );
    this.formName = this.searchSettingApiData.formName.map((code) => {
      return { label: code, value: code };
    });
    this.moduleName = this.searchSettingApiData.moduleName.map((code) => {
      return { label: code, value: code };
    });
    this.totalCriteraiField = this.searchSettingApiData[
      "totalCriteraiField"
    ].map((code) => {
      return { label: code, value: code };
    });
    this.totalDisplayField = [{ label: "7", value: "7" }];
    let createdDatesApi = this.searchSettingApiData.createdDate.map((code) => {
      let formatDate = this.datePipe.transform(code);
      return formatDate;
    });
    this.createdDate = [...new Set(createdDatesApi.map((v) => v))].map(
      (value) => {
        return { label: value, value: value };
      }
    );
    this.createdBy = this.searchSettingApiData.createdBy.map((code) => {
      return { label: code, value: code };
    });
    this.status = this.searchSettingApiData.status.map((code) => {
      return { label: code, value: code };
    });
  }

  confirmStatus(e: any, data: any) {
    e.preventDefault();
    console.log("codeeeeee", data);
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
    console.log(reqStatus, this.linkedSearchSetting, data["id"]);
    if (
      reqStatus == "Inactive" &&
      this.linkedSearchSetting.includes(data["id"])
    ) {
      completeMsg =
        isLinkedMsg +
        `Do you wish to ` +
        type +
        ` the Search setting Record: ${data["id"]}?`;
    } else {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        `Do you wish to ` +
        type +
        ` the Search setting Record: ${data["id"]}?`;
    }
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
    console.log(e.target, reqStatus);
    this.coreService.displayLoadingScreen();

    const formData = new FormData();
    formData.append("userId", this.userData.userId);
    formData.append("searchId", data["id"]);
    formData.append("status", reqStatus);
    this.updateSearchSettingStatus(formData, e.target, data);
    // }
  }

  updateSearchSettingStatus(formData: any, sliderElm: any, searchData: any) {
    this.searchSettingsService
      .updateSearchSettingStatus(formData)
      .subscribe((res) => {
        let message = "";
        if (res["error"] == "true") {
          this.coreService.removeLoadingScreen();
          message = `Kindly deactivate the Search Setting: ${res["msg"]} ( ${searchData["criteriaMap"]} ) to activate the current record.`;
          this.coreService.showWarningToast(message);
        } else {
          if (res["msg"]) {
            message = res["msg"];
            sliderElm.checked = sliderElm!.checked;
            this.getSearchSettingListData();
            this.coreService.showSuccessToast(message);
          } else {
            this.coreService.removeLoadingScreen();
            message = "Something went wrong, Please try again later";
            this.coreService.showWarningToast(message);
          }
        }
      });
  }

  openClickForView(data) {
    console.log("data", data);
    this.searchDataArrayView = data.settingSearchQueryCriteria;
    this.searchDataArrayView["applicationName"] = data["applicationName"];
    this.searchDataArrayView["formName"] = data["formName"];
    this.searchDataArrayView["moduleName"] = data["moduleName"];
    this.coreService.setHeaderStickyStyle(false);
    this.coreService.setSidebarBtnFixedStyle(false);
    this.clickforview = true;
  }
  openClickForClone(data: any, type: any) {
    // this.router.navigate([
    //   "navbar",
    //   "search-settings",
    //   "add-search-settings",
    //   data.id,
    //   type,
    // ]);

    let state = {
      appName: data.applicationName,
      moduleName: data.moduleName,
      formName: data.formName,
    };

    this.router.navigateByUrl(
      `navbar/search-settings/add-search-settings/${data.id}/${type}`,
      { state: state }
    );
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
  //     "search-settings",
  //     "add-search-settings",
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
