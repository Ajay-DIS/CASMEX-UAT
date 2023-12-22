import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { delay } from "rxjs/operators";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-add-beneficiary",
  templateUrl: "./add-beneficiary.component.html",
  styleUrls: ["./add-beneficiary.component.scss"],
})
export class AddBeneficiaryComponent implements OnInit {
  Select: "Select";
  constructor(
    private coreService: CoreService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  activeTabIndex: any = "0";
  previousTabIndex: any = "0";

  formData: any;
  beneData: any;
  masterData: any;

  disabledFields: any = {};

  userId = null;
  today = new Date();
  pastYear = new Date("01/01/1950");
  futureYear = new Date("01/01/2050");
  dobMaxDate = new Date(this.today.setFullYear(this.today.getFullYear() - 18));
  expiryMinDate = new Date();
  issueMaxDate = new Date();
  objectKeys = Object.keys;
  showForm: boolean = false;
  submitted = false;

  individualForm: FormGroup;
  formSections: any[] = [];
  apiData: any = [];

  noDataMsg = null;

  Options = [
    { name: "first", code: "NY" },
    { name: "second", code: "RM" },
    { name: "third", code: "LDN" },
  ];

  mode = "add";
  custId = null;
  custType = "IND";
  customerId = null;
  customerCode = null;
  customerFullName = null;
  status = null;

  CustomerData: any = null;

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.activatedRoute.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];

    const params = this.activatedRoute.snapshot.params;
    if (params && params.id) {
      this.mode = this.activatedRoute.snapshot.routeConfig.path.substring(
        this.activatedRoute.snapshot.routeConfig.path.lastIndexOf("/") + 1
      );
      console.log("paraa", params);
      this.customerCode = params.id;
      this.custId = params.benefid;
      this.custType = params.type;
      this.customerFullName = params.name;
      if (this.custType == "COR") {
        console.log("Here");
        this.activeTabIndex = 1;
        this.previousTabIndex = 1;
      } else {
        this.activeTabIndex = 0;
      }
    }
    console.log(this.custId, this.custType);

    this.getFormRulesFields(this.custType);
  }

  handleChange(event: any) {
    console.log(this.previousTabIndex, this.activeTabIndex, event);
    this.activeTabIndex = event.index;
    if (this.activeTabIndex != this.previousTabIndex) {
      this.previousTabIndex = this.activeTabIndex;
      // this.coreService.showWarningToast("Unsaved change has been reset");
      if (this.individualForm) {
        this.individualForm.reset();
      }
      if (this.activeTabIndex == "0") {
        console.log("IND cal");
        this.getFormRulesFields("IND");
        this.custType = "IND";
      } else {
        this.getFormRulesFields("COR");
        this.custType = "COR";
        console.log("COR cal");
      }
    }
  }

  getFormRulesFields(custType: any) {
    setTimeout(() => {
      this.coreService.displayLoadingScreen();
    }, 1000);
    this.http
      .get(`/remittance/formRulesController/getFormRulesSetting`, {
        headers: new HttpHeaders()
          .set(
            "criteriaMap",
            `Country = IN;Customer Type = ${custType == "IND" ? "IND" : "IND"}`
          )
          .set("form", "Customer Profile Beneficiary_Form Rules")
          .set("moduleName", "Remittance")
          .set("applications", "Casmex Core"),
      })
      .subscribe(
        (res) => {
          this.showForm = true;
          if (res["msg"]) {
            this.noDataMsg = res["msg"];
            this.apiData = {};
            this.coreService.removeLoadingScreen();
          } else {
            // this.setFormByData(res);
            this.formData = res;
            this.getBeneficiaryMasterData();
            if (this.mode == "edit") {
              this.getBeneficiaryData(this.custId);
            }
            console.log("API called", this.formData);
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error while fetching data, Try again in sometime"
          );
          this.noDataMsg = true;
          this.coreService.removeLoadingScreen();
        }
      );
  }

  getBeneficiaryMasterData() {
    this.http
      .get(
        `/remittance/beneficiaryProfileController/getBeneficiaryProfileMaster`,
        {
          headers: new HttpHeaders().set("userId", this.userId),
        }
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          if (res["status"] == "200") {
            this.masterData = res["data"];
            console.log("masterdatatype", this.masterData);
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error while fetching data, Try again in sometime"
          );
          this.coreService.removeLoadingScreen();
        }
      );
  }

  getBeneficiaryData(custId: any) {
    this.http
      .get(
        `/remittance/beneficiaryProfileController/getBeneficiaryProfile/${custId}`,
        {
          headers: new HttpHeaders().set("userId", this.userId),
        }
      )
      .pipe(
        delay(2000) // Adjust the delay time in milliseconds
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          if (res["status"] == "200") {
            console.log(res["responseData"]);
            this.beneData = res["responseData"];
            // this.setCustomerFormData(res["data"]);
            console.log();
            this.customerId = res["responseData"]["customerId"];
            this.status = res["responseData"]["status"];
            // if (res["responseData"]["status"] == "Inactive") {
            //   this.disableFormControls();
            //   // this.deactivated = true;
            // }
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error while fetching data, Try again in sometime"
          );
          this.coreService.removeLoadingScreen();
        }
      );
  }

  onSubmit(payload: any, custType: any): void {
    this.submitted = true;
    let payloadFormData = new FormData();
    for (let key in payload) {
      payloadFormData.append(key, payload[key]);
    }
    console.log("formdata", payloadFormData);
    if (this.mode == "edit") {
      payload["id"] = +this.custId;
      payload["customerId"] = this.customerId;
      payload["customerType"] =
        this.custType == "COR" ? "Corporate" : "Individual";
      payload["status"] = String(this.status);
      this.saveBeneficiaryForEdit(payload, custType);
    } else {
      payload["customerId"] = +this.customerCode;
      payload["customerType"] =
        this.custType == "COR" ? "Corporate" : "Individual";
      payload["status"] = String((this.status = "Active"));
      this.saveBeneficiaryCustomer(payload, custType);
    }
  }
  saveBeneficiaryForEdit(payload: any, custType: any) {
    this.http
      .put(
        `/remittance/beneficiaryProfileController/updateBeneficiaryProfile`,
        payload,
        {
          headers: new HttpHeaders()
            .set("userId", this.userId)
            .set(
              "customerType",
              this.custType == "COR" ? "Corporate" : "Individual"
            ),
        }
      )
      .subscribe(
        (res) => {
          if (res["status"] == "200") {
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
              this.coreService.removeLoadingScreen();
            } else {
              if (res["data"]) {
                this.coreService.showSuccessToast(res["data"]);
              } else {
                this.coreService.showSuccessToast(
                  "Profile data Updated successfully saved"
                );
              }
              this.router.navigate(["navbar", "customer-profile"]);
              // this.onReset()
            }
          } else {
            this.coreService.removeLoadingScreen();
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error while saving data, Try again in sometime"
          );
          console.log("err", err);
          this.coreService.removeLoadingScreen();
        }
      );
  }
  saveBeneficiaryCustomer(payload: any, custType: any) {
    console.log(this.userId);
    console.log(this.custType);
    this.http
      .post(
        `/remittance/beneficiaryProfileController/saveBeneficiaryProfile`,
        payload,
        {
          headers: new HttpHeaders()
            .set("userId", this.userId)
            .set(
              "customerType",
              this.custType == "COR" ? "Corporate" : "Individual"
            ),
        }
      )
      .subscribe(
        (res) => {
          if (res["status"] == "200") {
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
              this.coreService.removeLoadingScreen();
            } else {
              if (res["data"]) {
                this.coreService.showSuccessToast(res["data"]);
              } else {
                this.coreService.showSuccessToast(
                  "Profile data successfully saved"
                );
              }
              this.router.navigate(["navbar", "customer-profile"]);
            }
            // this.onReset()
          } else {
            this.coreService.removeLoadingScreen();
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error while saving data, Try again in sometime"
          );
          console.log("err", err);
          this.coreService.removeLoadingScreen();
        }
      );
  }

  updateBeneficiaryCustomer(payload: any) {
    this.http
      .put(
        `/remittance/corporateCustomerController/updateCorporateCustomer`,
        payload,
        {
          headers: new HttpHeaders()
            .set("userId", this.userId)
            .set("customerType", "Individual"),
        }
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          if (res["status"] == "200") {
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
              this.coreService.removeLoadingScreen();
            } else {
              if (res["data"]) {
                this.coreService.showSuccessToast(res["data"]);
              } else {
                this.coreService.showSuccessToast(
                  "Profile data updated successfully"
                );
              }
              this.router.navigate(["navbar", "customer-profile"]);
            }
            // this.onReset()
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error while saving data, Try again in sometime"
          );
          this.coreService.removeLoadingScreen();
        }
      );
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
}
