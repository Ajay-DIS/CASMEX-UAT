import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "src/app/core.service";
import { MasterServiceService } from "../master-service.service";
import { ConfirmationService } from "primeng/api";
import { MultiSelect } from "primeng/multiselect";
import { Table } from "primeng/table";

@Component({
  selector: "app-master-listing",
  templateUrl: "./master-listing.component.html",
  styleUrls: ["./master-listing.component.scss"],
})
export class MasterListingComponent implements OnInit {
  @ViewChild("dt") dt: Table;
  masterListData: any = [];

  criteriaMap = "NA";
  masterType = "";
  masterId = "";
  masterCode = "";
  masterName = "";
  formName = "";
  HeaderName = "";
  HeaderCode = "";

  selectedFiltercode: any[] = [];
  selectedFiltercodeName: any[] = [];

  showcodeOptions: boolean = false;
  showcodeNameOptions: boolean = false;

  code = [];
  codeName = [];

  userData: any = {};

  saveMasterDate: any[] = [];

  pageNumber = 0;
  pageSize = 10;
  totalPages = 5;
  totalRecords = 0;
  sortBy = "id";
  orderBy = "DESC";

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private masterService: MasterServiceService,
    private confirmationService: ConfirmationService
  ) {}

  cols: any[] = [];
  colTax: any[] = [
    { field: "code", header: "Tax Code", width: "30%" },
    {
      field: "codeName",
      header: "Tax Name",
      width: "50%",
    },
    { field: "status", header: "Status", width: "20%" },
  ];
  colCharge: any[] = [
    { field: "code", header: "Charge Code", width: "30%" },
    {
      field: "codeName",
      header: "Charge Name",
      width: "50%",
    },
    { field: "status", header: "Status", width: "20%" },
  ];
  colDocument: any[] = [
    { field: "code", header: "Document Code", width: "30%" },
    {
      field: "codeName",
      header: "Document Name",
      width: "50%",
    },
    { field: "status", header: "Status", width: "20%" },
  ];

  userTypeOptions = [
    { name: "Taxes", code: "Tax Master" },
    { name: "Charges", code: "Charge Master" },
    { name: "Documents", code: "Document Master" },
  ];

  customerTableLoading = false;
  showTable = false;
  addnewHide = false;
  disableCodeName = true;
  showAddnewModal = false;
  showViewModal = false;
  deactivated = false;

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    window.scrollTo(0, 0);
    const translationKey = "Master";

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

  searchMaster() {
    this.coreService.displayLoadingScreen();

    console.log("type", this.masterType);
    if (this.masterType == "Tax Master") {
      this.formName = "TaxMaster";
      this.cols = this.colTax;
      this.getMasterListData(this.formName);
      this.HeaderCode = "Tax Code";
      this.HeaderName = "Tax Name";
    } else if (this.masterType == "Charge Master") {
      this.formName = "ChargeMaster";
      this.cols = this.colCharge;
      this.getMasterListData(this.formName);
      this.HeaderCode = "Charge Code";
      this.HeaderName = "Charge Name";
    } else if (this.masterType == "Document Master") {
      this.formName = "DocumentMaster";
      this.cols = this.colDocument;
      this.getMasterListData(this.formName);
      this.HeaderCode = "Document Code";
      this.HeaderName = "Document Name";
    }
  }
  getMasterListData(formName) {
    this.masterListData = [];
    console.log(this.dt);
    if (this.dt) {
      this.dt.filter("", "codeName", "contains");
    }
    this.masterService.getMasterlistData(formName).subscribe(
      (res) => {
        this.coreService.removeLoadingScreen();
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
          if (!res["msg"]) {
            this.coreService.removeLoadingScreen();
          } else {
            // this.coreService.removeLoadingScreen();
            console.log(res);
            this.masterListData = res["masterData"];
            console.log("res", this.masterListData);
            this.showTable = true;
            this.addnewHide = true;
          }
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
  }
  clearMaster() {
    this.showTable = false;
    this.addnewHide = false;
    this.masterListData = [];
    this.masterType = "";
  }
  addNew() {
    console.log("type", this.masterType);
    this.coreService.displayLoadingScreen();
    this.getAddNewMaster(this.formName);
  }
  getAddNewMaster(formName: any) {
    this.masterService.getAddMasterData(formName).subscribe(
      (res) => {
        this.coreService.removeLoadingScreen();
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
          if (res["msg"]) {
            // this.coreService.removeLoadingScreen();
            console.log(res);
            this.masterCode = res["data"].code;
            this.masterName = "";
            console.log("res", this.masterCode);
            this.showAddnewModal = true;
            this.coreService.setSidebarBtnFixedStyle(false);
            this.coreService.setHeaderStickyStyle(false);
          }
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
  }

  saveAddNewMaster(action: any) {
    this.coreService.displayLoadingScreen();
    console.log(action);
    if (!this.masterName.replace(/\s/g, "").length) {
      this.coreService.showWarningToast("Please fill the required fields");
      this.coreService.removeLoadingScreen();
    } else {
      const newValues = [
        {
          id: "0",
          code: this.masterCode,
          codeName: this.masterName.trim().toUpperCase(),
          status: "A",
        },
      ];
      let service;
      let data = newValues;
      service = this.masterService.addNewMaster(data, this.formName);

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
                  this.showAddnewModal = false;
                  this.getMasterListData(this.formName);
                  this.setHeaderSidebarBtn(true);
                } else if (action == "saveAndAddNew") {
                  this.getAddNewMaster(this.formName);
                  this.masterName = "";
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
  resetAddNew() {
    this.masterName = "";
  }

  openClickForEdit(rowdata: any) {
    this.coreService.displayLoadingScreen();
    console.log(rowdata);
    if (rowdata.status == "D" || rowdata.status == "Inactive") {
      this.deactivated = true;
    } else {
      this.deactivated = false;
    }
    this.disableCodeName = true;
    this.masterId = rowdata.id;
    this.getMasterForEdit(rowdata, this.formName);
  }
  getMasterForEdit(rowdata, formName: any) {
    this.masterService.getMasterForEdit(String(rowdata.id), formName).subscribe(
      (res) => {
        this.coreService.removeLoadingScreen();
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
          if (!res["msg"]) {
            this.coreService.removeLoadingScreen();
          } else {
            // this.coreService.removeLoadingScreen();
            console.log(res);
            this.masterCode = res["masterData"].code;
            this.masterName = res["masterData"].codeName;
            console.log("res", this.masterCode);
            this.showViewModal = true;
            this.coreService.setSidebarBtnFixedStyle(false);
            this.coreService.setHeaderStickyStyle(false);
          }
        }
      },
      (err) => {
        console.log(err);
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
  }
  viewForEdit() {}

  editDisableModel() {
    this.disableCodeName = false;
  }
  updateMaster() {
    this.coreService.displayLoadingScreen();
    if (this.masterName == "") {
      this.coreService.showWarningToast("Please fill the required fields");
    } else {
      const newValues = [
        {
          id: String(this.masterId),
          code: this.masterCode,
          codeName: this.masterName.trim().toUpperCase(),
          status: "A",
        },
      ];
      let service;
      let data = newValues;
      service = this.masterService.updateNewMaster(data, this.formName);

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
                this.showViewModal = false;
                this.getMasterListData(this.formName);
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
  closeDialog() {
    this.showAddnewModal = false;
    this.showViewModal = false;
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    setTimeout(() => {
      this.coreService.removeLoadingScreen();
    }, 1000);
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
    if (this.masterType == "Tax Master") {
      let completeMsg = "";
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        `Do you wish to ` +
        type +
        ` the Tax Record: ${data["code"]}?`;

      this.confirmationService.confirm({
        message: completeMsg,
        key: "activeDeactiveStatus",
        accept: () => {
          this.updateStatus(e, reqStatus, data, this.formName);
          this.setHeaderSidebarBtn(true);
        },
        reject: () => {
          this.confirmationService.close;
          this.setHeaderSidebarBtn(false);
        },
      });
    } else if (this.masterType == "Charge Master") {
      let completeMsg = "";
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        `Do you wish to ` +
        type +
        ` the Charge Record: ${data["code"]}?`;

      this.confirmationService.confirm({
        message: completeMsg,
        key: "activeDeactiveStatus",
        accept: () => {
          this.updateStatus(e, reqStatus, data, this.formName);
          this.setHeaderSidebarBtn(true);
        },
        reject: () => {
          this.confirmationService.close;
          this.setHeaderSidebarBtn(false);
        },
      });
    } else if (this.masterType == "Document Master") {
      let completeMsg = "";
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        `Do you wish to ` +
        type +
        ` the Document Record: ${data["code"]}?`;

      this.confirmationService.confirm({
        message: completeMsg,
        key: "activeDeactiveStatus",
        accept: () => {
          this.updateStatus(e, reqStatus, data, this.formName);
          this.setHeaderSidebarBtn(true);
        },
        reject: () => {
          this.confirmationService.close;
          this.setHeaderSidebarBtn(false);
        },
      });
    }
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
            this.getMasterListData(formName);
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
