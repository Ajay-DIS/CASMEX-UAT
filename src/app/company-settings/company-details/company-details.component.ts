import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "src/app/core.service";
import { CompanySettingsServiceService } from "../company-settings-service.service";
import { element } from "protractor";
import { ConfirmationService } from "primeng/api";

@Component({
  selector: "app-company-details",
  templateUrl: "./company-details.component.html",
  styleUrls: ["./company-details.component.scss"],
})
export class CompanyDetailsComponent implements OnInit {
  companyForm: FormGroup;
  companyFormN: any = {
    clientCode: "CMX000091",
    licenseCountry: "In",
    status: "A",
    companySettings: {
      companyName: "",
      buildingNumber: "",
      blockNumber: "",
      streetName: "",
      pinCode: "",
      timeZone: "",
      emailId: "",
      mobileNumber: "",
      phoneNumber: "",
      companyLogo: "",
      companyLogoName: "",
      country: "",
      baseCurrency: "",
      primaryBaseCurrency: "",
      crossCurrency: "",
      numberFormat: "",
      dateFormat: "",
      primaryLanguage: "",
      themes: "",
    },
    remittanceSettings: {
      requiredDualCounter: "",
      prefixForRemittanceRefNo: "",
      correspondentRouting: "",
      autoRoutingTypeCode: "",
      showRateViewInRemittance: "",
      allowNewCustomerAdditionFromRemittance: "",
      allowCustomerProfileEditFromRemittance: "",
      allowBeneficiaryProfileEditFromRemittance: "",
      allowSpecialRateRequestFromRemittance: "",
      allowBufferInRateToTeller: "",
      allowOnAccountFacility: "",
      allowSpecialDiscountRate: "",
      allowCreditFacility: "",
    },
    accountsSettings: {
      prefixForBankVoucherNumber: "",
      prefixForCashVoucherNumber: "",
      accounting: "",
    },
    forexSettings: {
      prefixForForexRefNo: "",
    },
    incomingSettings: {
      prefixForIncomingRefNo: "",
    },
    loginSettings: {
      captchaRequired: "",
      passwordPolicy: "",
    },
  };

  requiredFields = [
    {
      label: "Company Name",
      val: "companyName",
    },
    {
      label: "Country",
      val: "country",
    },
  ];

  objectKeys = Object.keys;

  deactivated: boolean = false;
  toggleCollapsed: boolean = true;
  mode = "add";

  selectedBaseCurrencies: any[];
  selectedcountry: any[];
  selectedTimeZone: "";
  selectedPrimaryBaseCurrency: "";
  selectCrossCurrency: any[];
  selectNumberFormat: "";
  selectDateFormat: "";
  selectPrimaryLanguage: "";
  selectThemes: "";
  selectRequiredDualCounter: "";
  selectAccounting: "";
  selectCaptchaRequired: "";
  selectPasswordPolicy: "";
  companyLogoName: "";
  companyLogoNameStore: "";

  countryOptions: any = [];
  baseCurrencyOptions: any = [];
  primaryBaseCurrencyOptions: any = [];
  crossCurrencyOptions: any = [];
  numberFormatOptions: any = [];
  dateFormatOptions: any = [];
  primaryLanguageOptions: any = [];
  themeOptions: any = [];
  accountingOptions: any = [];
  timeZoneOptions: any = [];
  requiredDualCounterOptions: any = [];
  setPasswordPolicyOptions: any = [];
  captchaRequiredOptions: any = [];
  autoRoutingOptions: any = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private compamnyService: CompanySettingsServiceService
  ) {}

  apiData: any = [];
  newValues: any = [];
  fileBase64Data: any;
  userId = "";

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

    this.getDropdownOptions();
    this.getCompanySettingsData();
  }

  updatePrimaryBaseCurrencyOptions(selectedBaseCurrencies: any[]) {
    // console.log("pri", selectedBaseCurrencies);
    this.companyFormN.companySettings.baseCurrency = selectedBaseCurrencies;
    this.primaryBaseCurrencyOptions = selectedBaseCurrencies;
  }

  expandAll() {
    this.toggleCollapsed = !this.toggleCollapsed;
  }

  onChange(section, type, field, event) {
    console.log("event", event.target.value);
    if (section == "basicDeatil") {
      this.companyFormN["companySettings"][field] = event && event.target.value;
    }
    if (section == "remittanceSettings") {
      this.companyFormN["remittanceSettings"][field] =
        event && event.target.value;
    }
    if (section == "loginSettings") {
      this.companyFormN["loginSettings"][field] = event && event.target.value;
    }
  }

  mapCodeToItem(code: string, options: any[]): any {
    console.log(
      "them",
      options.find((item) => item.code === code)
    );
    return options.find((item) => item.code === code);
  }

  getCompanySettingsData() {
    this.compamnyService.getCompanySettings().subscribe(
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
          if (res["status"] == "200") {
            this.coreService.removeLoadingScreen();
            console.log("data", res["data"]);
            this.companyFormN = res["data"];
            this.mode = "edit";
            this.companyLogoName =
              res["data"]["companySettings"]["companyLogoName"];
            if (res["data"]["companySettings"]["country"]) {
              const countryCode = res["data"]["companySettings"]["country"];
              this.selectedcountry = this.countryOptions.filter((option) => {
                return countryCode.split(",").includes(option.code);
              });
            }
            if (res["data"]["companySettings"]["baseCurrency"]) {
              const countryCode =
                res["data"]["companySettings"]["baseCurrency"];
              this.selectedBaseCurrencies = this.baseCurrencyOptions.filter(
                (option) => {
                  return countryCode.split(",").includes(option.code);
                }
              );
              this.updatePrimaryBaseCurrencyOptions(
                this.selectedBaseCurrencies
              );
            }
            if (res["data"]["companySettings"]["crossCurrency"]) {
              const countryCode =
                res["data"]["companySettings"]["crossCurrency"];
              this.selectCrossCurrency = this.crossCurrencyOptions.filter(
                (option) => {
                  return countryCode.split(",").includes(option.code);
                }
              );
            }
            if (res["data"]["companySettings"]["primaryBaseCurrency"]) {
              const baseCurrencyCode =
                res["data"]["companySettings"]["primaryBaseCurrency"];
              this.selectedPrimaryBaseCurrency = this.mapCodeToItem(
                baseCurrencyCode,
                this.baseCurrencyOptions
              );
            }
            if (res["data"]["companySettings"]["timeZone"]) {
              const timeZoneCode = res["data"]["companySettings"]["timeZone"];
              this.selectedTimeZone = this.mapCodeToItem(
                timeZoneCode,
                this.timeZoneOptions
              );
            }
            if (res["data"]["companySettings"]["numberFormat"]) {
              const numberFormatCode =
                res["data"]["companySettings"]["numberFormat"];
              this.selectNumberFormat = this.mapCodeToItem(
                numberFormatCode,
                this.numberFormatOptions
              );
            }
            if (res["data"]["companySettings"]["dateFormat"]) {
              const numberFormatCode =
                res["data"]["companySettings"]["dateFormat"];
              this.selectDateFormat = this.mapCodeToItem(
                numberFormatCode,
                this.dateFormatOptions
              );
            }
            if (res["data"]["companySettings"]["primaryLanguage"]) {
              const numberFormatCode =
                res["data"]["companySettings"]["primaryLanguage"];
              this.selectPrimaryLanguage = this.mapCodeToItem(
                numberFormatCode,
                this.primaryLanguageOptions
              );
            }
            if (res["data"]["companySettings"]["themes"]) {
              const themesCode = res["data"]["companySettings"]["themes"];
              this.selectThemes = this.mapCodeToItem(
                String(themesCode),
                this.themeOptions
              );
              console.log("theme", this.selectThemes);
              console.log("theme", themesCode);
              console.log("theme", this.themeOptions);
            }
            if (res["data"]["accountsSettings"]["accounting"]) {
              const numberFormatCode =
                res["data"]["accountsSettings"]["accounting"];
              this.selectAccounting = this.mapCodeToItem(
                numberFormatCode,
                this.accountingOptions
              );
            }
            if (
              res["data"]["remittanceSettings"]["requiredDualCounter"] === "Y"
            ) {
              const requiredDualCounterCode = "1";
              this.selectRequiredDualCounter = this.mapCodeToItem(
                requiredDualCounterCode,
                this.requiredDualCounterOptions
              );
            } else {
              const requiredDualCounterCode = "2";
              this.selectRequiredDualCounter = this.mapCodeToItem(
                requiredDualCounterCode,
                this.requiredDualCounterOptions
              );
            }
            if (res["data"]["loginSettings"]["captchaRequired"] === "Y") {
              const requiredDualCounterCode = "1";
              this.selectCaptchaRequired = this.mapCodeToItem(
                requiredDualCounterCode,
                this.captchaRequiredOptions
              );
            } else {
              const requiredDualCounterCode = "2";
              this.selectCaptchaRequired = this.mapCodeToItem(
                requiredDualCounterCode,
                this.captchaRequiredOptions
              );
            }
            if (res["data"]["loginSettings"]["passwordPolicy"] === "Y") {
              const requiredDualCounterCode = "1";
              this.selectPasswordPolicy = this.mapCodeToItem(
                requiredDualCounterCode,
                this.setPasswordPolicyOptions
              );
            } else {
              const requiredDualCounterCode = "2";
              this.selectPasswordPolicy = this.mapCodeToItem(
                requiredDualCounterCode,
                this.setPasswordPolicyOptions
              );
            }
          }
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        console.log("error in getting", err);
        this.coreService.showWarningToast(
          "Something went wrong, Please try again later"
        );
      }
    );
  }

  checkValidation() {
    // let msgList = ["Company Name", "Country"];
    // if (
    //   this.companyFormN["companySettings"].companyName == "" ||
    //   this.companyFormN["companySettings"].companyName == null ||
    //   this.companyFormN["companySettings"].companyName == undefined
    // ) {
    //   console.log("ente in checj");
    //   this.coreService.showWarningToast(
    //     "Please Enter required Fields:" + msgList
    //   );
    // }
  }

  setUploadBtnStyle(set: boolean, btn: any) {
    if (set) {
      if (btn) {
        btn.style.border = "1px solid #4759e4";
      }
    } else {
      btn.style.border = "none";
    }
  }

  onFileSelected(event: any): void {
    const fileInput = event.target;
    const file = fileInput.files[0];
    console.log("fileInput", fileInput);
    console.log("file", file);
    console.log("file", this.companyLogoName);
    this.companyLogoNameStore = file["name"];
    this.companyLogoName = file["name"];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = reader.result as string;
        this.fileBase64Data = base64Data;
      };

      reader.readAsDataURL(file);
    }
  }

  upperCaseSpaceFormat(value: string): string {
    // Trim extra spaces and convert to uppercase
    return value.trim().toUpperCase().replace(/\s+/g, " ");
  }

  isValidEmailFormat(emails: string): boolean {
    const emailAddresses = emails.split(";").map((email) => email.trim());
    const invalidEmails = emailAddresses.filter(
      (email) => !this.isValidEmail(email)
    );
    return invalidEmails.length === 0;
  }

  isValidEmail(email: string): boolean {
    // Regular expression for email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  onSubmit() {
    this.coreService.displayLoadingScreen();
    console.log("enter in click", this.companyFormN);
    // this.checkValidation();
    let companyNameMissing = false;
    let countryMissing = false;
    let houseNumberMissing = false;
    let blockNumberMissing = false;
    let streetNameMissing = false;
    let timeZoneMissing = false;
    let baseCurrencyMissing = false;
    let primaryBaseCurrencyMissing = false;
    let crossCurrencyMissing = false;
    let primaryLanguageMissing = false;
    let accountingMissing = false;
    let captchaRequiredMissing = false;
    let setPasswordPolicyMissing = false;

    this.newValues = {};

    for (const key in this.companyFormN) {
      if (this.companyFormN.hasOwnProperty(key)) {
        if (
          typeof this.companyFormN[key] === "object" &&
          this.companyFormN[key] !== null
        ) {
          this.newValues[key] = { ...this.companyFormN[key] };
        } else {
          this.newValues[key] = this.companyFormN[key];
        }
      }
    }

    this.newValues = { ...this.companyFormN };
    if (this.companyFormN.hasOwnProperty("companySettings")) {
      this.newValues["companySettings"]["companyLogo"] = this.fileBase64Data;
      if (this.selectedcountry) {
        this.newValues["companySettings"]["country"] = this.selectedcountry
          .map((country) => country.code)
          .join(",");
      }
      if (this.selectedBaseCurrencies) {
        this.newValues["companySettings"]["baseCurrency"] =
          this.selectedBaseCurrencies.map((country) => country.code).join(",");
      }
      if (this.selectCrossCurrency) {
        this.newValues["companySettings"]["crossCurrency"] =
          this.selectCrossCurrency.map((country) => country.code).join(",");
      }
      if (this.selectedPrimaryBaseCurrency) {
        this.newValues["companySettings"]["primaryBaseCurrency"] =
          this.selectedPrimaryBaseCurrency["code"];
      }
      if (this.selectedTimeZone) {
        this.newValues["companySettings"]["timeZone"] =
          this.selectedTimeZone["code"];
      }
      if (this.selectPrimaryLanguage) {
        this.newValues["companySettings"]["primaryLanguage"] =
          this.selectPrimaryLanguage["code"];
      }
      if (this.selectThemes) {
        this.newValues["companySettings"]["themes"] = this.selectThemes["code"];
      }
      if (this.selectNumberFormat) {
        this.newValues["companySettings"]["numberFormat"] =
          this.selectNumberFormat["code"];
      }
      if (this.selectDateFormat) {
        this.newValues["companySettings"]["dateFormat"] =
          this.selectDateFormat["code"];
      }
      if (this.selectAccounting) {
        this.newValues["accountsSettings"]["accounting"] =
          this.selectAccounting["code"];
      }
      if (this.companyLogoName) {
        this.newValues["companySettings"]["companyLogoName"] =
          this.companyLogoName;
      }

      // this.newValues["remittanceSettings"]["requiredDualCounter"] =
      //   this.selectRequiredDualCounter["name"];
      // this.newValues["loginSettings"]["captchaRequired"] =
      //   this.selectCaptchaRequired["name"];
      // this.newValues["loginSettings"]["passwordPolicy"] =
      //   this.selectPasswordPolicy["name"];
      if (this.selectRequiredDualCounter["name"] === "YES") {
        this.newValues["remittanceSettings"]["requiredDualCounter"] = "Y";
      } else {
        this.newValues["remittanceSettings"]["requiredDualCounter"] = "N";
      }
      if (this.selectCaptchaRequired["name"] === "YES") {
        this.newValues["loginSettings"]["captchaRequired"] = "Y";
      } else {
        this.newValues["loginSettings"]["captchaRequired"] = "N";
      }
      if (this.selectPasswordPolicy["name"] === "YES") {
        this.newValues["loginSettings"]["passwordPolicy"] = "Y";
      } else {
        this.newValues["loginSettings"]["passwordPolicy"] = "N";
      }

      this.newValues["companySettings"]["companyName"] =
        this.upperCaseSpaceFormat(
          this.newValues["companySettings"]["companyName"]
        );
      this.newValues["companySettings"]["buildingNumber"] =
        this.upperCaseSpaceFormat(
          this.newValues["companySettings"]["buildingNumber"]
        );
      this.newValues["companySettings"]["blockNumber"] =
        this.upperCaseSpaceFormat(
          this.newValues["companySettings"]["blockNumber"]
        );
      this.newValues["companySettings"]["streetName"] =
        this.upperCaseSpaceFormat(
          this.newValues["companySettings"]["streetName"]
        );

      if (
        !this.newValues["companySettings"]["companyName"] ||
        this.newValues["companySettings"]["companyName"] === ""
      ) {
        companyNameMissing = true;
      }
      if (
        !this.newValues["companySettings"]["country"] ||
        this.newValues["companySettings"]["country"] === ""
      ) {
        countryMissing = true;
      }
      if (
        !this.newValues["companySettings"]["timeZone"] ||
        this.newValues["companySettings"]["timeZone"] === ""
      ) {
        timeZoneMissing = true;
      }
      if (
        !this.newValues["companySettings"]["streetName"] ||
        this.newValues["companySettings"]["streetName"] === ""
      ) {
        streetNameMissing = true;
      }
      if (
        !this.newValues["companySettings"]["blockNumber"] ||
        this.newValues["companySettings"]["blockNumber"] === ""
      ) {
        blockNumberMissing = true;
      }
      if (
        !this.newValues["companySettings"]["buildingNumber"] ||
        this.newValues["companySettings"]["buildingNumber"] === ""
      ) {
        houseNumberMissing = true;
      }
      if (
        !this.newValues["companySettings"]["baseCurrency"] ||
        this.newValues["companySettings"]["baseCurrency"] === ""
      ) {
        baseCurrencyMissing = true;
      }
      if (
        !this.newValues["companySettings"]["primaryBaseCurrency"] ||
        this.newValues["companySettings"]["primaryBaseCurrency"] === ""
      ) {
        primaryBaseCurrencyMissing = true;
      }
      if (
        !this.newValues["companySettings"]["crossCurrency"] ||
        this.newValues["companySettings"]["crossCurrency"] === ""
      ) {
        crossCurrencyMissing = true;
      }
      if (
        !this.newValues["companySettings"]["primaryLanguage"] ||
        this.newValues["companySettings"]["primaryLanguage"] === ""
      ) {
        primaryLanguageMissing = true;
      }
      if (
        !this.newValues["accountsSettings"]["accounting"] ||
        this.newValues["accountsSettings"]["accounting"] === ""
      ) {
        accountingMissing = true;
      }
      if (
        !this.newValues["loginSettings"]["captchaRequired"] ||
        this.newValues["loginSettings"]["captchaRequired"] === ""
      ) {
        captchaRequiredMissing = true;
      }
      if (
        !this.newValues["loginSettings"]["passwordPolicy"] ||
        this.newValues["loginSettings"]["passwordPolicy"] === ""
      ) {
        setPasswordPolicyMissing = true;
      }
    }

    console.log("save", this.newValues);
    if (!this.isValidEmailFormat(this.companyFormN.companySettings.emailId)) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please enter a valid email format.");
      return; // Stop execution here if email format is invalid
    } else if (companyNameMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please fill the Company Name.");
    } else if (countryMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please select the Country.");
    } else if (houseNumberMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast(
        "Please fill the House/Buiding Number."
      );
    } else if (blockNumberMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please fill the Block Number.");
    } else if (streetNameMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please fill the Street Name.");
    } else if (timeZoneMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please select the Time Zone.");
    } else if (baseCurrencyMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please select the Base Currency.");
    } else if (primaryBaseCurrencyMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast(
        "Please select the Primary Base Currency."
      );
    } else if (crossCurrencyMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please select the Cross Currency.");
    } else if (primaryLanguageMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please select the Primary Language.");
    } else if (accountingMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please select the Accounting.");
    } else if (captchaRequiredMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please select the Captcha Required.");
    } else if (setPasswordPolicyMissing) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast(
        "Please select the Set Password Policy."
      );
    } else {
      let service;
      if (this.mode == "edit") {
        let data = this.newValues;

        service = this.compamnyService.updateCompanySettings(data, this.userId);
        console.log("::", data);
      } else {
        let data = this.newValues;
        console.log("saveeee", data);
        service = this.compamnyService.saveCompanySettings(data, this.userId);
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
                this.coreService.removeLoadingScreen();
                this.getCompanySettingsData();
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

  onReset() {
    this.coreService.setSidebarBtnFixedStyle(false);
    this.confirmationService.confirm({
      message: "Are you sure, you want to clear applied changes ?",
      key: "resetCompanySettingsConfirmation",
      accept: () => {
        this.setHeaderSidebarBtn();
        this.companyFormN = {
          clientCode: "CMX000091",
          licenseCountry: "In",
          status: "A",
          companySettings: {
            companyName: "",
            buildingNumber: "",
            blockNumber: "",
            streetName: "",
            pinCode: "",
            timeZone: "",
            emailId: "",
            mobileNumber: "",
            phoneNumber: "",
            companyLogo: "",
            companyLogoName: "",
            country: "",
            baseCurrency: "",
            primaryBaseCurrency: "",
            crossCurrency: "",
            numberFormat: "",
            dateFormat: "",
            primaryLanguage: "",
            themes: "",
          },
          remittanceSettings: {
            requiredDualCounter: "",
            prefixForRemittanceRefNo: "",
            correspondentRouting: "",
            autoRoutingTypeCode: "",
            showRateViewInRemittance: "",
            allowNewCustomerAdditionFromRemittance: "",
            allowCustomerProfileEditFromRemittance: "",
            allowBeneficiaryProfileEditFromRemittance: "",
            allowSpecialRateRequestFromRemittance: "",
            allowBufferInRateToTeller: "",
            allowOnAccountFacility: "",
            allowSpecialDiscountRate: "",
            allowCreditFacility: "",
          },
          accountsSettings: {
            prefixForBankVoucherNumber: "",
            prefixForCashVoucherNumber: "",
            accounting: "",
          },
          forexSettings: {
            prefixForForexRefNo: "",
          },
          incomingSettings: {
            prefixForIncomingRefNo: "",
          },
          loginSettings: {
            captchaRequired: "",
            passwordPolicy: "",
          },
        };
        this.selectedcountry = [];
        this.selectedBaseCurrencies = [];
        this.selectCrossCurrency = [];
        this.selectedPrimaryBaseCurrency = "";
        this.selectPrimaryLanguage = "";
        this.selectThemes = "";
        this.selectNumberFormat = "";
        this.selectDateFormat = "";
        this.selectAccounting = "";
        this.selectedTimeZone = "";
        this.selectCaptchaRequired = "";
        this.selectPasswordPolicy = "";
        this.autoRoutingOptions = [];
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
      },
    });
  }

  getDropdownOptions() {
    //1
    this.compamnyService.getAccountingMasterData().subscribe(
      (res) => {
        this.accountingOptions = res["data"]["accounting"].map((data) => {
          return {
            name: data.codeName,
            code: data.code,
          };
        });
      },
      (err) => {
        this.coreService.showWarningToast(
          "Some error while fetching doc data, Try again in sometime"
        );
      }
    );
    //2
    this.compamnyService.getAuthenticationTypeMasterData().subscribe(
      (res) => {},
      (err) => {
        this.coreService.showWarningToast(
          "Some error while fetching doc data, Try again in sometime"
        );
      }
    );
    //3
    this.compamnyService.getDateFormatMasterData().subscribe(
      (res) => {
        this.dateFormatOptions = res["data"]["dateFormat"].map((data) => {
          return {
            name: data.codeName,
            code: data.code,
          };
        });
      },
      (err) => {
        this.coreService.showWarningToast(
          "Some error while fetching doc data, Try again in sometime"
        );
      }
    );
    //4
    this.compamnyService.getNumberFormatMasterData().subscribe(
      (res) => {
        this.numberFormatOptions = res["data"]["numberFormat"].map((data) => {
          return {
            name: data.codeName,
            code: data.code,
          };
        });
      },
      (err) => {
        this.coreService.showWarningToast(
          "Some error while fetching doc data, Try again in sometime"
        );
      }
    );
    //5
    this.compamnyService.getAutoRoutingTypeMasterData().subscribe(
      (res) => {
        this.autoRoutingOptions = res["data"]["autoRouting"];
      },
      (err) => {
        this.coreService.showWarningToast(
          "Some error while fetching doc data, Try again in sometime"
        );
      }
    );
    //6
    this.compamnyService.getSystemCurrencyMasterData().subscribe(
      (res) => {
        this.baseCurrencyOptions = res["data"]["baseCurrency"].map((data) => {
          return {
            name: data.currency,
            code: data.code,
          };
        });
        this.crossCurrencyOptions = res["data"]["crossCurrency"].map((data) => {
          return {
            name: data.currency,
            code: data.code,
          };
        });
      },
      (err) => {
        this.coreService.showWarningToast(
          "Some error while fetching doc data, Try again in sometime"
        );
      }
    );
    //7
    this.compamnyService.getSystemLanguageMasterData().subscribe(
      (res) => {
        this.primaryLanguageOptions = res["data"]["primaryLanguage"].map(
          (data) => {
            return {
              name: data.languageName,
              code: data.code,
            };
          }
        );
      },
      (err) => {
        this.coreService.showWarningToast(
          "Some error while fetching doc data, Try again in sometime"
        );
      }
    );
    //8
    this.compamnyService.getYesNoMasterData().subscribe(
      (res) => {
        this.requiredDualCounterOptions = res["data"][
          "requiredDualCounter"
        ].map((data) => {
          return {
            name: data.codeName,
            code: data.code,
          };
        });
        this.setPasswordPolicyOptions = res["data"]["setPasswordPolicy"].map(
          (data) => {
            return {
              name: data.codeName,
              code: data.code,
            };
          }
        );
        this.captchaRequiredOptions = res["data"]["captchaRequired"].map(
          (data) => {
            return {
              name: data.codeName,
              code: data.code,
            };
          }
        );
      },
      (err) => {
        this.coreService.showWarningToast(
          "Some error while fetching doc data, Try again in sometime"
        );
      }
    );
    //9
    this.compamnyService.getSystemCountryMasterData().subscribe(
      (res) => {
        this.countryOptions = res["data"]["country"].map((data) => {
          return {
            name: data.country,
            code: data.code,
          };
        });
        this.timeZoneOptions = res["data"]["country"].map((data) => {
          return {
            name: data.timeZone,
            code: data.code,
          };
        });
      },
      (err) => {
        this.coreService.showWarningToast(
          "Some error while fetching doc data, Try again in sometime"
        );
      }
    );
    //10
    this.compamnyService.getSystemThemeMasterData().subscribe(
      (res) => {
        this.themeOptions = res["data"]["theme"].map((data) => {
          return {
            name: data.codeName,
            code: data.code,
          };
        });
      },
      (err) => {
        this.coreService.showWarningToast(
          "Some error while fetching doc data, Try again in sometime"
        );
      }
    );
    //11
    this.compamnyService.getPasswordSpecialCharacterMasterData().subscribe(
      (res) => {},
      (err) => {
        this.coreService.showWarningToast(
          "Some error while fetching doc data, Try again in sometime"
        );
      }
    );
  }
}
