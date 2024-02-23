import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { Observable, forkJoin } from "rxjs";
import { CoreService } from "src/app/core.service";
import { CustomerFormService } from "./customer-form.service";
import { Calendar } from "primeng/calendar";

import _lodashClone from "lodash-es/cloneDeep";
import _lodashIsEqual from "lodash-es/isequal";

import _lodashUnset from "lodash-es/unset";
import { take } from "rxjs/operators";
import { ViewportScroller } from "@angular/common";
import { ConfirmDialogModalService } from "../../modals/confirm-dialog-modal/confirm-dialog-modal.service";

@Component({
  selector: "app-customer-form",
  templateUrl: "./customer-form.component.html",
  styleUrls: ["./customer-form.component.scss"],
})
export class CustomerFormComponent implements OnInit, OnChanges {
  constructor(
    private coreService: CoreService,
    private formBuilder: FormBuilder,
    private router: Router,
    private confirmationService: ConfirmationService,
    private customerFormService: CustomerFormService,
    private scroller: ViewportScroller,
    private confirmDialogModalService: ConfirmDialogModalService
  ) {
    // this.getCustomerMasterData();
    this.getCustomerMasterDataFromAppControlAndRemittance();
  }

  @ViewChild("calendar") calendar: Calendar;

  @Input("mode") mode = "add";
  @Input("userId") userId = null;
  @Input("custType") custType = "IND";
  @Input("custId") custId = null;

  @Input("originalCustomerType") originalCustomerType = "IND";
  @Input("originalCustomerCode") originalCustomerCode = null;

  @Input("relatedParty") relatedParty = "C";
  @Input("isNormalCustomer") isNormalCustomer = true;
  @Input("newAddedCustAsParty") newAddedCustAsParty = null;

  @Input("editFromPartyTable") editFromPartyTable = false;

  @Output("showFormForRelatedParty") showFormForRelatedParty =
    new EventEmitter<string>();
  @Output("existingCustomerMissingDocCaseId") existingCustomerMissingDocCaseId =
    new EventEmitter<any>();
  @Output("editRelatedPartyId") editRelatedPartyId = new EventEmitter<any>();

  @Output("onNewlyAddedCustomerAsPartyDetails")
  onNewlyAddedCustomerAsPartyDetails = new EventEmitter<any>();

  @Output("onEditFromPartyTable")
  onEditFromPartyTable = new EventEmitter<any>();

  // --------------------AJAY STSARTSSSSSSSSSSSSSS

  errorFromDocumentComponent: any =
    // "Please tick, If Uploaded Documents are valid";
    null;

  editCustomerDataLoaded: boolean = false;

  idIssueCountryList: any = [];

  today = new Date();
  pastYear = new Date("01/01/1950");
  futureYear = new Date("01/01/2050");
  dobMaxDate = new Date(this.today.setFullYear(this.today.getFullYear() - 18));
  expiryMinDate = new Date();
  issueMaxDate = new Date();
  objectKeys = Object.keys;
  showForm: boolean = true;
  submitted = false;

  clickforview = false;
  customerDataForView: any = [];
  checked: boolean = false;
  isConfirmedCustomer = "false";

  filteredEmployer: any = [];

  customerForm: FormGroup;
  formSections: any[] = [];
  apiData: any = [];

  copyFormSection: any = [];

  masterData: any = {};

  deactivated: boolean = false;
  disabledFields: any = {};

  onActiveData: any = [];

  employerType = "Individual";
  CustomerData: any = null;

  customerUploadedDocumentsData: any[] = [];

  duplicateCheckFields = [];

  // --------------------AJAY ENDSSSSSSSSSSSSSSSSSSSS

  applicationName = JSON.parse(localStorage.getItem("applicationName"));
  moduleName = JSON.parse(localStorage.getItem("moduleName"));

  formName = "Customer Profile_Form Rules";
  licenseCountry = localStorage.getItem("licenseCountry");

  causingCriteriaFieldsArr = [];
  causingCriteriaMapObj = {};

  initFormRuleDataJson = [];

  initFormRuleFieldsNames = [];

  // for dup cust
  viewIndCustomerTableCols = [
    { header: "First Name", name: "firstNamePersonalDetails" },
    { header: "Middle Name", name: "middleNamePersonalDetails" },
    { header: "Last Name", name: "lastNamePersonalDetails" },
    { header: "Date of birth", name: "dateOfBirthPersonalDetails" },
    { header: "Country of birth", name: "countryOfBirthPersonalDetails" },
    { header: "Mobile Number", name: "contactMobileNumber" },
    { header: "Nationality", name: "nationalityPersonalDetails" },
  ];
  viewCorCustomerTableCols = [
    { header: "Company Name", name: "nameOfTheCorporate" },
    { header: "Date of Establishment", name: "dateOfEstablishment" },
    { header: "Country of Establishment", name: "countryOfEstablishment" },
    { header: "Mobile Number", name: "contactMobileNumber" },
  ];

  viewCustomerTableCols = [];

  // --------------------AJAY STARTSSSSSSSSSSSSSSSSSS
  documentSettingJsonData: any[] = null;
  causingCriteriaFieldsArrForDocSetting = [];
  causingCriteriaMapObjForDocSetting = {};

  // for repres/benef new flow
  customerType = "";
  customerFieldType = "";
  criteriaTypechange = "";
  type = "Individual";

  criteriaType: any = "text";

  customerData: any = [];
  userTypeOptions = [
    { name: "Individual", code: "Individual" },
    // { name: "Corporate", code: "Corporate" },
  ];

  searchCriteriaApiData = [];

  searchCriteriaOptions = [];
  searchCriteria = [];
  currentCriteriaKey = "";
  currentCriteriaValue = "";
  currentCriteria = "";

  currentCriteriaMapKey = "";
  searchCriteriaMap = [];
  currentCriteriaMap = "";
  criteriaMap = "NA";

  pageNumber = 1;
  pageSize = 5;
  totalPages = 5;
  totalRecords = 0;
  sortBy = "id";
  orderBy = "DESC";

  allRequiredDocumentsPresent = null;

  selectedPartyType: any = null;

  currentSelectedCustomerAsParty: any = null;

  showTable: any = false;

  globalSearch = true;

  lastLazyLoadEvent = null;

  addedPartyDetailsTableData: any = [];

  selectedCustomerDocList: any = [];
  requiredDocsListFromSettings: any = [];

  showNoDataFound: boolean = false;

  columns: any[] = [
    {
      field: "customerCode",
      header: "Customer Code",
      width: "10%",
      searchWidth: "120px",
    },
    {
      field: "fullName",
      header: "Customer Full Name",
      width: "40%",
      searchWidth: "100%",
    },
    {
      field: "mobileNumber",
      header: "Mobile Number",
      width: "15%",
      searchWidth: "120px",
    },
    { field: "idType", header: "ID Type", width: "15%", searchWidth: "120px" },
    {
      field: "idNumber",
      header: "ID Number",
      width: "5%",
      searchWidth: "120px",
    },
  ];
  // for repres/benef new flow ends

  relatedPartyTypeCode: any = null;

  // for multiDetails
  multiDetailsSectionData = {
    "Related Parties Details": "relatedParties",
  };

  // ! Multisection related function OLD FLOW starts
  // hasValue(formSectionValue: any): boolean {
  //   return Object.values(formSectionValue).some(
  //     (value) => value !== null && value !== undefined && value !== ""
  //   );
  // }

  // editSectionDetails(sectionRowData: any, section: any, sectionRowIndex: any) {
  //   console.log(":;", sectionRowData, section);
  //   section["editingIndex"] = sectionRowIndex;
  //   for (let key in sectionRowData) {
  //     let value: any;
  //     if (sectionRowData[key]["isMasterData"]) {
  //       value = {
  //         code: sectionRowData[key]["valueToSend"],
  //         codeName: sectionRowData[key]["valueToDisplay"],
  //       };
  //     } else {
  //       value = sectionRowData[key]["valueToDisplay"];
  //     }
  //     this.customerForm.get(section.formName).get(key).patchValue(value);
  //   }
  // }

  // addSectionDetails(section: any) {
  //   console.log(":;", section.fields);
  //   console.log(":;secForm", this.customerForm.get(section.formName));
  //   section["submitted"] = true;
  //   if (
  //     this.customerForm.get(section.formName) &&
  //     this.customerForm.get(section.formName).valid
  //   ) {
  //     let sectionDataValues = _lodashClone(
  //       this.customerForm.get(section.formName).value
  //     );
  //     for (let key in sectionDataValues) {
  //       if (
  //         sectionDataValues[key] &&
  //         typeof sectionDataValues[key] != "string"
  //       ) {
  //         if (typeof sectionDataValues[key] == "object") {
  //           if ((sectionDataValues[key] as Object) instanceof Date) {
  //             sectionDataValues[key] = (
  //               sectionDataValues[key] as Date
  //             ).toLocaleDateString("en-GB");
  //           }
  //         }
  //       }
  //     }

  //     let formattedSectionData = _lodashClone(sectionDataValues);
  //     for (const key in formattedSectionData) {
  //       if (formattedSectionData.hasOwnProperty(key)) {
  //         formattedSectionData[key] = { isMasterData: false };
  //       }
  //     }
  //     for (let key in sectionDataValues) {
  //       if (
  //         sectionDataValues[key] &&
  //         typeof sectionDataValues[key] != "string"
  //       ) {
  //         if (typeof sectionDataValues[key] == "object") {
  //           if ((sectionDataValues[key] as Object).hasOwnProperty("code")) {
  //             formattedSectionData[key]["valueToDisplay"] =
  //               sectionDataValues[key].codeName;
  //             formattedSectionData[key]["valueToSend"] =
  //               sectionDataValues[key].code;
  //             formattedSectionData[key]["isMasterData"] = true;
  //           }
  //         }
  //       } else {
  //         formattedSectionData[key]["valueToDisplay"] = sectionDataValues[key];
  //         formattedSectionData[key]["valueToSend"] = sectionDataValues[key];
  //       }
  //       let fieldDataArr = section.fields.filter(
  //         (field) => field.fieldName == key
  //       );
  //       formattedSectionData[key]["label"] = fieldDataArr.length
  //         ? fieldDataArr[0]["fieldLabel"]
  //         : key;
  //     }
  //     console.log(":;", this.multiDetailsSectionData);

  //     if (
  //       section.hasOwnProperty("editingIndex") &&
  //       section["editingIndex"] >= 0
  //     ) {
  //       this.multiDetailsSectionData[section.formName][
  //         +section["editingIndex"]
  //       ] = formattedSectionData;
  //     } else {
  //       this.multiDetailsSectionData[section.formName].push(
  //         formattedSectionData
  //       );
  //     }

  //     this.customerForm.get(section.formName).reset();

  //     this.copyFormSection
  //       .filter((copySection) => copySection.formName == section.formName)[0]
  //       ["fields"].forEach((field) => {
  //         this.customerForm
  //           .get(section.formName)
  //           ?.get(field.name)
  //           .patchValue(
  //             field.fieldType == "dropdownSingle" ||
  //               field.fieldType == "dropdownMulti"
  //               ? field.defaultValue
  //               : field.defaultValue && field.defaultValue != "null"
  //               ? field.defaultValue
  //               : ""
  //           );
  //       });

  //     section["submitted"] = false;
  //     section["editingIndex"] = -1;
  //   }
  // }

  // getFieldLabels(sectionData: any) {
  //   return Object.values(sectionData).map((data) => data["label"]);
  // }
  // ! Multisection related function OLD FLOW ends

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(":: custCHanges", changes);
    if (changes.custType) {
      console.log(":: custTypeCHanges", changes.custType.currentValue);
      this.coreService.displayLoadingScreen();
      this.employerType =
        changes.custType.currentValue == "IND" ? "Individual" : "Corporate";
      this.getCausingCriteriaFields(
        this.userId,
        this.applicationName["code"],
        this.moduleName["code"],
        this.formName
      );

      this.getCausingCriteriaFieldsForDocSetting(
        this.userId,
        this.applicationName["code"],
        this.moduleName["code"],
        "Document Settings"
      );

      if (changes.relatedParty && changes.relatedParty.isFirstChange) {
        this.relatedPartyTypeCode = changes.relatedParty.currentValue;
      }

      // customer-search related apis
      if (this.relatedPartyTypeCode == "C") {
        this.getApiDataForsearchCriteria();
        this.currentCriteriaMapKey = "id = ";
        this.currentCriteriaKey = "Customer Code = ";
      }
    }

    if (
      changes.newAddedCustAsParty &&
      changes.newAddedCustAsParty.currentValue
    ) {
      this.addPartyDetailsIntoTable(
        null,
        "newAdd",
        changes.newAddedCustAsParty.currentValue
      );
    }
  }

  // ! Related Party related starts
  checkCustomerStateForEdit(
    partyCustomerCode: any,
    partyTypeCode: any,
    isNormalCustomer: any
  ) {
    this.onEditFromPartyTable.emit(true);
    if (isNormalCustomer) {
      this.editCustomerForMissingDocs(partyCustomerCode, partyTypeCode);
    } else {
      // edit relatedParty ------
      this.editCustomerAsParty(partyCustomerCode, partyTypeCode);
    }
  }

  //* addAsParty related starts
  addNewCustomerAsParty(partyTypeCode: any) {
    this.showFormForRelatedParty.emit(partyTypeCode);
    this.existingCustomerMissingDocCaseId.emit(null);

    this.currentSelectedCustomerAsParty = null;
    this.clearAllRequiredDocsPresentFlag();

    // set BreadCrumbs
    this.coreService
      .getBreadCrumbMenu()
      .pipe(take(1))
      .subscribe((currBCrumbs) => {
        console.log(":::currB", currBCrumbs);
        currBCrumbs.push({
          label: "Add Related Party",
          routerLink: "",
        });
        this.coreService.setBreadCrumbMenuFromInternalPages(currBCrumbs);
      });
  }
  //* addAsParty related ends

  editCustomerAsParty(partyId: any, partyTypeCode: any) {
    this.showFormForRelatedParty.emit(partyTypeCode);
    this.editRelatedPartyId.emit(partyId);

    this.currentSelectedCustomerAsParty = null;
    this.clearAllRequiredDocsPresentFlag();

    // set BreadCrumbs
    this.coreService
      .getBreadCrumbMenu()
      .pipe(take(1))
      .subscribe((currBCrumbs) => {
        console.log(":::currB", currBCrumbs);
        currBCrumbs.push({
          label: "Edit Related Party",
          routerLink: "",
        });
        this.coreService.setBreadCrumbMenuFromInternalPages(currBCrumbs);
      });
  }

  //* editCustomerForMissingDoc related STARTS
  editCustomerForMissingDocs(custCode: any, partyTypeCode: any) {
    console.log("EDITING");
    this.showFormForRelatedParty.emit(partyTypeCode);
    this.existingCustomerMissingDocCaseId.emit(custCode);

    this.currentSelectedCustomerAsParty = null;
    this.clearAllRequiredDocsPresentFlag();

    // set BreadCrumbs
    this.coreService
      .getBreadCrumbMenu()
      .pipe(take(1))
      .subscribe((currBCrumbs) => {
        console.log(":::currB", currBCrumbs);
        currBCrumbs.push({
          label: "Edit Customer (Related Party)",
          routerLink: "",
        });
        this.coreService.setBreadCrumbMenuFromInternalPages(currBCrumbs);
      });
  }
  //* editCustomerForMissingDoc related ENDS

  onChangePartyType() {
    this.causingCriteriaMapObjForDocSetting["relatedParty"] =
      this.selectedPartyType["code"];
    this.currentSelectedCustomerAsParty = null;
    this.clearAllRequiredDocsPresentFlag();
    console.log(this.causingCriteriaMapObjForDocSetting);
  }

  onRowSelect(rowSelectEvent: any) {
    console.log("::selected", rowSelectEvent);
    console.log("::selectedCust", this.currentSelectedCustomerAsParty);
    this.clearAllRequiredDocsPresentFlag();

    let custCode = rowSelectEvent?.data?.customerCode;
    let $getCustomerDataObs =
      this.customerFormService.getCustomerFormDataForEdit(
        custCode,
        this.userId,
        this.custType
      );

    let causingCriteriaFieldValueArr = [];
    for (const [crtField, value] of Object.entries(
      this.causingCriteriaMapObjForDocSetting
    )) {
      causingCriteriaFieldValueArr.push(`${crtField} = ${value}`);
    }
    let causingCriteriaMap = causingCriteriaFieldValueArr.length
      ? causingCriteriaFieldValueArr.join(";")
      : "NA";

    let $getDocSettingsObs =
      this.customerFormService.getDocumentDataByCriteriaMap(causingCriteriaMap);

    this.coreService.displayLoadingScreen();
    forkJoin([$getCustomerDataObs, $getDocSettingsObs]).subscribe({
      next: ([resCustomerData, resDocSettings]) => {
        // Getting CUSTOMER DOCS START
        console.log("Result from $getCustomerDataObs:", resCustomerData);
        if (resCustomerData["status"] == "200") {
          console.log(
            "::custDocData",
            resCustomerData["data"]["uploadDocuments"]
          );
          this.selectedCustomerDocList =
            resCustomerData["data"]["uploadDocuments"];
        }
        // Getting CUSTOMER DOCS END
        // Getting DOCUMENT SETTING for selected PARTY TYPE START
        console.log("Result from $getDocSettingsObs:", resDocSettings);
        if (resDocSettings["DocumentSettingData"]) {
          console.log("::partyType", this.selectedPartyType);
          console.log(
            "::reqDocsFromSettings",
            resDocSettings["DocumentSettingData"]
          );
          this.requiredDocsListFromSettings =
            resDocSettings["DocumentSettingData"];
        }
        // Getting DOCUMENT SETTING for selected PARTY TYPE END

        let allRequiredDocsPresent = true;
        this.requiredDocsListFromSettings
          .filter((reqDoc) => reqDoc["IsMandatory"] == "true")
          .forEach((filteredReqDoc) => {
            if (
              !this.selectedCustomerDocList.find(
                (custDoc) =>
                  custDoc["documentType"] == filteredReqDoc["Document"]
              )
            ) {
              allRequiredDocsPresent = false;
            }
          });

        rowSelectEvent["data"]["allRequiredDocsPresent"] =
          allRequiredDocsPresent;

        this.allRequiredDocumentsPresent = allRequiredDocsPresent;

        console.log("::allDocsAlreadyPresent", allRequiredDocsPresent);
      },
      complete: () => {
        console.log("Both observables completed");

        this.coreService.removeLoadingScreen();
      },
      error: (error) => {
        if (error.errors) {
          error.errors.forEach((err, index) => {
            console.error(`Error occurred in observable${index + 1}:`, err);
          });
        } else {
          console.error("Unknown error occurred:", error);
        }
      },
    });
  }
  onRowUnselect(rowSelectEvent: any) {
    console.log("::Unselected", rowSelectEvent);
  }

  clearAllRequiredDocsPresentFlag() {
    this.customerData.forEach((custData) => {
      custData["allRequiredDocsPresent"] = null;
    });
    this.allRequiredDocumentsPresent = null;
  }

  addPartyDetailsIntoTable(data: any, addWay: any = "link", partyCode?: any) {
    if (
      this.addedPartyDetailsTableData.find(
        (partyD) => partyD["partyCustomerCode"] == partyCode
      )
    ) {
      this.coreService.showWarningToast(
        "This Customer is already present in Related Parties !"
      );
      return;
    } else {
      let finalPartyDetailForTable = {
        isNormalCustomer: false,
      };
      if (addWay == "link") {
        finalPartyDetailForTable["partyType"] = this.selectedPartyType["code"];
        finalPartyDetailForTable["partyCustomerCode"] = data["customerCode"];
        finalPartyDetailForTable["fullName"] = data["fullName"];
        finalPartyDetailForTable["mobileNumber"] = data["mobileNumber"];
        finalPartyDetailForTable["status"] = "A";

        finalPartyDetailForTable["isNormalCustomer"] = true;

        this.addedPartyDetailsTableData.push(finalPartyDetailForTable);
        this.coreService.showSuccessToast(
          "Customer successfully added in Related Parties."
        );
      } else if (addWay == "newAdd") {
        let customerData = null;
        this.coreService.displayLoadingScreen();
        this.customerFormService
          // ! change getForEdit Id to partyCode when API ready
          .getCustomerFormDataForEdit(partyCode, this.userId, this.custType)
          .subscribe(
            (res) => {
              this.coreService.removeLoadingScreen();
              if (res["status"] == "200") {
                customerData = res["data"];
                console.log(":: newCustAsPartyDetails", customerData);
                finalPartyDetailForTable["partyType"] =
                  this.selectedPartyType["code"];
                finalPartyDetailForTable["partyCustomerCode"] =
                  customerData["id"];
                finalPartyDetailForTable["fullName"] = customerData["fullName"];
                finalPartyDetailForTable["mobileNumber"] =
                  customerData["contactMobileNumber"];
                finalPartyDetailForTable["status"] = "A";

                finalPartyDetailForTable["isNormalCustomer"] = false;

                this.addedPartyDetailsTableData.push(finalPartyDetailForTable);
                this.coreService.showSuccessToast(
                  "Customer successfully added in Related Parties."
                );
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
    }

    console.log(":: relatedPartyDetailsTable", this.addedPartyDetailsTableData);

    let relatedPartiesFormData = new FormData();

    this.addedPartyDetailsTableData.forEach((partyDetailObj, i) => {
      Object.keys(partyDetailObj).forEach((partyDetailKey) => {
        relatedPartiesFormData.append(
          `relatedParties[${i}].${partyDetailKey}`,
          partyDetailObj[partyDetailKey]
        );
      });
    });

    for (var pair of relatedPartiesFormData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }
  }

  getPartyNameFromMasterByCode(code: any) {
    if (this.masterData["masterRelatedParties"]) {
      return this.masterData["masterRelatedParties"].filter(
        (party) => party.code == code
      )[0]["codeName"];
    } else {
      return "";
    }
  }

  onRelatedPartyStatusChange(currentStatus: any) {
    console.log(":::currStatus", currentStatus);
    let requiredStatus = "A";
    if (currentStatus == "A") {
      requiredStatus = "D";
    }

    // this.confirmationService.confirm({
    //   message: "Are you sure",
    //   key: "confirmDialog",
    // });
  }

  // onConfirm() {
  //   console.log("Confirmed");
  //   // Your confirmation logic here
  // }

  // onReject() {
  //   console.log("Rejected");
  //   // Your rejection logic here
  // }

  // * customer-search related starts
  loadCustomers(e: any) {
    // this.resetSortIcons();
    if (JSON.stringify(this.lastLazyLoadEvent) === JSON.stringify(e)) {
      return false;
    }

    if (!this.globalSearch) {
      this.pageNumber = e.first ? e.first / this.pageSize + 1 : 1;
      console.log(
        "::event, pageSize, pageNumber",
        e,
        this.pageSize,
        this.pageNumber
      );
      let updatedCriteriaMap = this.criteriaMap;
      if (e.rows) {
        this.pageSize = e.rows;
      }
      if (e.sortField) {
        if (e.sortOrder == 1) {
          this.orderBy = "DESC";
        } else {
          this.orderBy = "ASC";
        }
        switch (e.sortField) {
          case "customerCode":
            this.sortBy = "id";
            break;
          case "fullName":
            if (this.customerType && this.customerType == "Corporate") {
              this.sortBy = "nameOfTheCorporate";
            } else {
              this.sortBy = "fullName";
            }
            break;
          case "nationality":
            this.sortBy = "nationalityPersonalDetails";
            break;
          case "mobileNumber":
            this.sortBy = "contactMobileNumber";
            break;
          case "idType":
            this.sortBy = "documentType";
            break;
          case "idNumber":
            this.sortBy = "idNumber";
            break;
          case "beneficiaryCount":
            this.sortBy = "beneficiaryCount";
            break;
          case "status":
            this.sortBy = "status";
            break;

          default:
            this.sortBy = "id";
            break;
        }
      } else {
        this.sortBy = "id";
        this.orderBy = "DESC";
      }
      if (e.filters && Object.keys(e.filters).length > 0) {
        let filterCrtMap = "";
        for (const prop in e.filters) {
          switch (prop) {
            case "customerCode":
              filterCrtMap = `id = ${e.filters[prop]["value"]}`;
              break;
            case "fullName":
              if (this.customerType && this.customerType == "Corporate") {
                filterCrtMap = `nameOfTheCorporate = ${e.filters[prop]["value"]}`;
              } else {
                filterCrtMap = `fullName = ${e.filters[prop]["value"]}`;
              }
              break;
            case "nationality":
              filterCrtMap = `nationalityPersonalDetails = ${e.filters[prop]["value"]}`;
              break;
            case "mobileNumber":
              filterCrtMap = `contactMobileNumber = ${e.filters[prop]["value"]}`;
              break;
            case "idType":
              filterCrtMap = `documentType = ${e.filters[prop]["value"]}`;
              break;
            case "idNumber":
              filterCrtMap = `idNumber = ${e.filters[prop]["value"]}`;
              break;
            case "beneficiaryCount":
              filterCrtMap = `beneficiaryCount = ${e.filters[prop]["value"]}`;
              break;

            default:
              filterCrtMap = "";
              break;
          }
          if (updatedCriteriaMap?.length && updatedCriteriaMap != "NA") {
            if (filterCrtMap?.length) {
              updatedCriteriaMap += `;${filterCrtMap}`;
            }
          } else {
            updatedCriteriaMap = filterCrtMap;
          }
        }
        console.log("updatedCriteriaMap", updatedCriteriaMap);
        this.getCustomerListData(updatedCriteriaMap);
      } else {
        this.getCustomerListData(this.criteriaMap);
      }
    }
    this.sortBy = "id";
    this.orderBy = "DESC";
    this.globalSearch = false;

    this.lastLazyLoadEvent = _lodashClone(e);
  }

  getApiDataForsearchCriteria() {
    // this.coreService.displayLoadingScreen();
    this.customerFormService
      .getDataForsearchCriteria(
        this.userId,
        this.applicationName["code"],
        this.moduleName["code"],
        "Customer Profile"
      )
      .subscribe(
        (res) => {
          // this.coreService.removeLoadingScreen();
          this.searchCriteriaApiData = res["data"];
          this.searchCriteriaOptions = this.searchCriteriaApiData.map(
            (data) => {
              return {
                name: data.displayName,
                code: data.fieldName,
              };
            }
          );
          this.searchCriteriaOptions.unshift(
            ...[{ name: "Customer Code", code: "id" }]
          );
        },
        (err) => {
          // this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast("Error in fething data");
        }
      );
  }
  onUserTypeChange(value: any) {
    this.formName = "Customer Profile";
    console.log("type", value);
    if (value == "Corporate") {
      console.log("colums", this.columns);
      this.columns.forEach((column) => {
        if (column.field === "fullName") {
          column.header = "Corporate Name";
        }
      });
    } else {
      this.columns.forEach((column) => {
        if (column.field === "fullName") {
          column.header = "Customer Full Name";
        }
      });
    }
    this.type = value;
    this.criteriaMap = "NA";
    this.searchCriteria = [];
    this.currentCriteriaValue = null;
    this.currentCriteriaKey = "Customer Code = ";
    this.currentCriteriaMapKey = "id = ";
    this.searchCriteriaMap = [];
    this.getApiDataForsearchCriteria();
    this.showTable = false;
    this.globalSearch = true;
    // this.getCustomerListData(this.criteriaMap);
    this.customerFieldType = null;
    this.criteriaType = "text";
  }

  onCriteriaChange(value: any) {
    this.criteriaTypechange = value;
    this.currentCriteriaValue = null;
    this.currentCriteriaKey = `${
      this.searchCriteriaOptions.filter((opt) => {
        return opt.code == value;
      })[0]["name"]
    } = `;
    this.currentCriteriaMapKey = `${
      this.searchCriteriaOptions.filter((opt) => {
        return opt.code == value;
      })[0]["code"]
    } = `;
    this.criteriaType = this.searchCriteriaApiData.filter((opt) => {
      return opt.fieldName == value;
    })[0]
      ? this.searchCriteriaApiData.filter((opt) => {
          return opt.fieldName == value;
        })[0].criteriaType
      : "text";
    setTimeout(() => {
      if (this.criteriaType == "SQL") {
        this.searchCustomerMap(this.customerType);
      }
    }, 1000);
  }
  ondeletecriteria(i: any, criteria: any) {
    this.searchCriteria.splice(i, 1);
    this.searchCriteriaMap.splice(i, 1);
    this.currentCriteriaValue = null;
    this.criteriaMap =
      this.searchCriteriaMap.length > 1
        ? this.searchCriteriaMap.join(";")
        : this.searchCriteriaMap.length == 1
        ? this.searchCriteriaMap[0]
        : "NA";
    this.globalSearch = true;
    this.showTable = false;
    this.showNoDataFound = false;
    if (this.searchCriteria.length) {
      this.getCustomerListData(this.criteriaMap);
    } else if (this.criteriaType == "SQL") {
      this.customerFieldType = null;
    }
  }
  searchCustomerMap(type: any) {
    console.log("currentkey", this.currentCriteriaMapKey);
    console.log("search", this.searchCriteriaMap);
    console.log("criteriaType", this.criteriaType);
    console.log("criteriaType", this.currentCriteriaValue);
    if (
      this.searchCriteriaMap.filter((crt) => {
        return (
          crt.split(" = ")[0] == this.currentCriteriaMapKey.split(" = ")[0]
        );
      }).length > 0
    ) {
      this.coreService.showWarningToast(
        "This search criteria is already exists, delete it first."
      );
    } else {
      if (this.criteriaType == "SQL") {
        if (this.currentCriteria && this.currentCriteria.length > 0) {
          this.searchCriteria.push(this.currentCriteria);
          this.searchCriteriaMap.push(this.currentCriteriaMapKey);
          this.criteriaMap = this.searchCriteriaMap.join(";");
          console.log("criteriaMapSQL", this.criteriaMap);
        } else {
          this.coreService.showWarningToast("Please enter the search value");
          return;
        }
      } else if (
        (typeof this.currentCriteriaValue == "string" &&
          this.currentCriteriaValue?.trim().length) ||
        this.currentCriteriaValue
      ) {
        if (this.criteriaType == "date") {
          let criteriaData = new Date(
            this.currentCriteriaValue
          ).toLocaleDateString("en-GB");
          console.log("criteriaData", criteriaData);
          this.currentCriteria = this.currentCriteriaKey + criteriaData;
          this.searchCriteria.push(this.currentCriteria);

          this.currentCriteriaMap = this.currentCriteriaMapKey + criteriaData;
          this.searchCriteriaMap.push(this.currentCriteriaMap);
          this.criteriaMap = this.searchCriteriaMap.join(";");
        } else {
          this.currentCriteria =
            this.currentCriteriaKey + this.currentCriteriaValue;
          this.searchCriteria.push(this.currentCriteria);

          this.currentCriteriaMap =
            this.currentCriteriaMapKey + this.currentCriteriaValue;
          this.searchCriteriaMap.push(this.currentCriteriaMap);
          this.criteriaMap = this.searchCriteriaMap.join(";");
        }
      }
      this.globalSearch = true;
      this.showTable = false;
      this.getCustomerListData(this.criteriaMap);
      if (!(this.criteriaType == "SQL")) {
        this.currentCriteriaValue = null;
      }
      // this.customerFieldType = null;
      // this.currentCriteriaKey = "Customer Code = ";
      // this.currentCriteriaMapKey = "id = ";
    }
  }

  getCustomerListData(criteriaMap: any) {
    this.coreService.displayLoadingScreen();
    let service: Observable<any>;

    console.log(
      "::header",
      this.userId,
      criteriaMap,
      `${this.pageNumber}`,
      `${this.pageSize}`,
      this.type,
      this.sortBy,
      this.orderBy
    );
    service = this.customerFormService.getCustomerListDataOnSearch(
      this.userId,
      criteriaMap,
      `${this.pageNumber}`,
      `${this.pageSize}`,
      this.type,
      this.sortBy,
      this.orderBy
    );

    service.subscribe(
      (res) => {
        this.coreService.removeLoadingScreen();
        if (res["status"] == "200") {
          if (res["error"]) {
            this.showTable = false;
            this.coreService.showWarningToast(res["error"]);
            this.customerData = [];
          } else {
            if (!res.data?.CmCorporateCustomerDetails.length) {
              this.showTable = false;
              this.showNoDataFound = true;
            } else {
              this.showTable = true;
            }
            this.customerData = res.data?.CmCorporateCustomerDetails;
            this.totalPages = res.data?.TotalPages;
            this.totalRecords = res.data?.TotalCount;
            // this.totalRecords = res.data.PaginationDetails.totalCount;
            // this.customerCode = res.customerCode?.map((code) => {
            //   if (code) return { label: code, value: code };
            // });
            // this.fullName = res.customerFullName?.map((code) => {
            //   if (code) return { label: code, value: code };
            // });
            // this.nationality = res.nationality?.map((code) => {
            //   if (code) return { label: code, value: code };
            // });
            // this.mobileNumber = res.mobileNumber?.map((code) => {
            //   if (code) return { label: code, value: code };
            // });
            // this.idType = res.idType?.map((code) => {
            //   if (code) return { label: code, value: code };
            // });
            // this.idNumber = res.idNumber?.map((code) => {
            //   if (code) return { label: code, value: code };
            // });
          }
        } else {
          this.showTable = false;
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        // this.coreService.showWarningToast("Error in fething data");
        this.showTable = false;
      }
    );
  }

  clearCriteria() {
    this.criteriaMap = "NA";
    this.searchCriteria = [];
    this.currentCriteriaValue = null;
    this.currentCriteriaKey = "Customer Code = ";
    this.currentCriteriaMapKey = "id = ";
    this.searchCriteriaMap = [];
    this.getApiDataForsearchCriteria();
    this.globalSearch = true;
    this.showTable = false;
    this.customerFieldType = null;
    this.criteriaType = "text";
  }

  searchByEnter(e: any) {
    if (this.selectedPartyType && this.customerType) {
      this.searchCustomerMap(this.customerType);
    } else if (!this.customerType) {
      this.coreService.showWarningToast("Please select Customer Type");
    } else if (!this.selectedPartyType) {
      this.coreService.showWarningToast("Please select Party Type");
    }
  }

  // * customer-search related ends

  // ! Related Party related ends

  // ! Customer Master Data API starts
  // getCustomerMasterData() {
  //   this.customerFormService.getCustomerMaster().subscribe(
  //     (res) => {
  //       this.masterData = res["data"];

  //       // remove customer from partyType dropdown
  //       if (this.masterData["masterRelatedParties"]) {
  //         this.masterData["masterRelatedParties"] = this.masterData[
  //           "masterRelatedParties"
  //         ].filter((party) => party.code != "C");
  //       }

  //       // salaryDateMaster
  //       for (let i = 1; i <= 30; i++) {
  //         this.masterData.salaryDateEmpDetails.push({
  //           code: `${i}`,
  //           codeName: `${i}`,
  //         });
  //       }

  //       // idIssueCountryList
  //       this.idIssueCountryList = this.masterData["idIssueCountry"];
  //     },
  //     (err) => {
  //       this.coreService.showWarningToast("Error in fething data");
  //     }
  //   );
  // }

  getCustomerMasterDataFromAppControlAndRemittance() {
    this.customerFormService
      .getCustomerMasterDataFromAppControlAndRemittance()
      .subscribe(
        (responses: any[]) => {
          // Handle successful responses
          console.log("Response from API 1:", responses[0]);
          console.log("Response from API 2:", responses[1]);
          this.masterData = {
            ...responses[0]["data"],
            ...responses[1]["data"],
          };
          // remove customer from partyType dropdown
          if (this.masterData["masterRelatedParties"]) {
            this.masterData["masterRelatedParties"] = this.masterData[
              "masterRelatedParties"
            ].filter((party) => party.code != "C");
          }

          // salaryDateMaster
          for (let i = 1; i <= 30; i++) {
            this.masterData.salaryDateEmpDetails.push({
              code: `${i}`,
              codeName: `${i}`,
            });
          }

          // idIssueCountryList
          this.idIssueCountryList = this.masterData["idIssueCountry"];
        },
        (error) => {
          // Handle error if any API request fails
          console.error("Error:", error);
          // You can show an error message to the user or handle it in any other way
        }
      );
  }
  // ! Customer Master Data API ends

  // ! Customer Form Validation & Helper Fn related starts
  handleDateSelect(calendar: Calendar) {
    setTimeout(() => {
      if (calendar.inputfieldViewChild.nativeElement) {
        calendar.inputfieldViewChild.nativeElement.focus();
      }
    }, 0);
  }

  validMinDate(fieldName: string) {
    if (
      fieldName == "idExpiryDate" ||
      fieldName == "visaExpiryDate" ||
      fieldName == "licenseExpiryDate" ||
      fieldName == "representativeIdExpiryDate" ||
      fieldName == "representativeVisaExpiryDate" ||
      fieldName == "representativeAuthorizationLetterExpiryDate"
    ) {
      return new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    } else {
      return this.pastYear;
    }
  }
  validMaxDate(fieldName: string) {
    if (
      fieldName == "idIssueDate" ||
      fieldName == "dateOfEstablishment" ||
      fieldName == "representativeIdIssueDate"
    ) {
      return new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    } else if (
      fieldName == "dateOfBirth" ||
      fieldName == "representativeDateOfBirth" ||
      fieldName == "dateOfBirthPersonalDetails"
    ) {
      return this.dobMaxDate;
    } else {
      return this.futureYear;
    }
  }
  validDefDate(fieldName: string) {
    if (
      fieldName == "dateOfBirth" ||
      fieldName == "representativeDateOfBirth" ||
      fieldName == "dateOfBirthPersonalDetails"
    ) {
      return this.dobMaxDate;
    } else {
      return new Date();
    }
  }

  checkValidValuesText(e: any, fieldData: any) {
    if (fieldData.validValues && fieldData.validValues.length && e) {
      let match = true;
      if (e.length) {
        match = false;
      }
      fieldData.validValues.forEach((val) => {
        // if (val.startsWith(e)) {
        if (val == e) {
          match = true;
        }
      });
      if (!match) {
        let currCtrl = this.customerForm
          .get(fieldData.formName)
          ?.get(fieldData.name);
        if (currCtrl) {
          currCtrl.setErrors({
            invalidValue: true,
          });
        }
      }
    }
  }
  checkValidValuesDate(e: any, fieldData: any) {
    if (fieldData.validValues && fieldData.validValues.length) {
      let match = true;
      if (e) {
        match = false;
        fieldData.validValues.forEach((val) => {
          // if (val.startsWith(e)) {
          if (val == e.toLocaleDateString("en-GB")) {
            match = true;
          }
        });
      }
      if (!match) {
        let currCtrl = this.customerForm
          .get(fieldData.formName)
          ?.get(fieldData.name);
        if (currCtrl) {
          currCtrl.setErrors({
            invalidValue: true,
          });
        }
      }
    }
  }

  disableFormControls() {
    Object.keys(this.customerForm.controls).forEach((controlName) => {
      this.customerForm.get(controlName).disable();
    });
  }
  enableFormControls() {
    console.log("disfields", this.disabledFields);
    Object.keys(this.customerForm.controls).forEach((controlName) => {
      console.log("control", controlName);
      this.customerForm.get(controlName).enable();
    });
    if (Object.keys(this.disabledFields).length) {
      Object.keys(this.disabledFields).forEach((section) => {
        console.log(section);
        console.log(this.disabledFields[section]);
        console.log(
          this.customerForm.get(section).get(this.disabledFields[section])
        );
        this.customerForm
          .get(section)
          .get(this.disabledFields[section])
          .disable();
      });
    }
  }

  isSectionVisible(section: any) {
    let visible = false;
    section.fields.forEach((field) => {
      if (field.visible) {
        visible = true;
      }
    });
    return visible;
  }

  sameAddress(event: any, fieldName: any) {
    if (fieldName == "permanentAddressSameAsAbove") {
      let address;
      if (event.checked) {
        address = {
          permanentCountry: this.customerForm
            .get("Contact Details")
            ?.get("contactCountry")?.value,
          permanentHouseBuildingNumber: this.customerForm
            .get("Contact Details")
            ?.get("contactHouseBulidingNumber")?.value,
          permanentBlockNumber: this.customerForm
            .get("Contact Details")
            ?.get("contactBlockNumber")?.value,
          permanentStreetNumber: this.customerForm
            .get("Contact Details")
            ?.get("contactStreetNumber")?.value,
          permanentCity: this.customerForm
            .get("Contact Details")
            ?.get("contactCity")?.value,
          permanentPinZipcode: this.customerForm
            .get("Contact Details")
            ?.get("contactPinZipcode")?.value,
        };
      } else {
        address = {
          permanentCountry: "",
          permanentHouseBuildingNumber: "",
          permanentBlockNumber: "",
          permanentStreetNumber: "",
          permanentCity: "",
          permanentPinZipcode: "",
        };
      }

      this.customerForm.get("Contact Details").patchValue(address);
    }
  }
  // ! Customer Form Validation Fn related ends

  // ! Causing Criteria related Fn Starts
  getCausingCriteriaFields(
    userId: any,
    appName: any,
    modName: any,
    formName: any
  ) {
    this.customerFormService
      .getCausingCriteriaFields(userId, appName, modName, formName)
      .subscribe((res) => {
        if (res["Criteria FieldNames"]) {
          console.log(":::", Object.values(res["Criteria FieldNames"]));
          this.causingCriteriaFieldsArr = _lodashClone(
            Object.values(res["Criteria FieldNames"])
          );

          this.setCausingCriteriaMapObj(this.causingCriteriaFieldsArr);

          this.getformRuleData(this.causingCriteriaMapObj, true);
        }
      });
  }
  getCausingCriteriaFieldsForDocSetting(
    userId: any,
    appName: any,
    modName: any,
    formName: any
  ) {
    this.customerFormService
      .getCausingCriteriaFields(userId, appName, modName, formName)
      .subscribe((res) => {
        if (res["Criteria FieldNames"]) {
          console.log("::: Doc crt", Object.values(res["Criteria FieldNames"]));
          this.causingCriteriaFieldsArrForDocSetting = _lodashClone(
            Object.values(res["Criteria FieldNames"])
          );

          this.setCausingCriteriaMapObjForDocSetting(
            this.causingCriteriaFieldsArrForDocSetting
          );

          this.getDocSettingJsonData(
            this.causingCriteriaMapObjForDocSetting,
            true
          );
        }
      });
  }
  setCausingCriteriaMapObj(causingCrtFieldsArr: any) {
    causingCrtFieldsArr.forEach((crtField: string) => {
      if (crtField == "licenceCountry") {
        this.causingCriteriaMapObj["licenceCountry"] = this.licenseCountry;
      } else if (crtField == "Customer Type") {
        this.causingCriteriaMapObj["Customer Type"] =
          this.custType == "IND" ? "IND" : "COR";
      } else {
        this.causingCriteriaMapObj[crtField] = "NA";
      }

      console.log(":::relatedPartyTypeCode", this.relatedPartyTypeCode);
      console.log(":::isNormalCustomer", this.isNormalCustomer);
      if (this.relatedPartyTypeCode != "C" && !this.isNormalCustomer) {
        this.causingCriteriaMapObj["relatedParty"] = this.relatedPartyTypeCode;
      }
    });
  }
  setCausingCriteriaMapObjForDocSetting(causingCrtFieldsArr: any) {
    causingCrtFieldsArr.forEach((crtField: string) => {
      if (crtField == "Country") {
        this.causingCriteriaMapObjForDocSetting["Country"] =
          this.licenseCountry;
      } else if (crtField == "Form") {
        this.causingCriteriaMapObjForDocSetting["Form"] = "Customer Profile";
      } else if (crtField == "Customer Type") {
        this.causingCriteriaMapObjForDocSetting["Customer Type"] =
          this.custType == "IND" ? "IND" : "COR";
      } else {
        this.causingCriteriaMapObjForDocSetting[crtField] = "NA";
      }

      if (this.relatedPartyTypeCode != "C") {
        this.causingCriteriaMapObjForDocSetting["relatedParty"] =
          this.relatedPartyTypeCode;
      }
    });
  }
  formatCausingCriteriaMap(crtField, value, fieldType) {
    if (value) {
      let codeValue = value;
      switch (fieldType) {
        case "dropdownSingle":
          codeValue = value.code;
          break;
        default:
      }
      console.log(":::updated crt field", crtField, codeValue);
      this.causingCriteriaMapObj[crtField] = codeValue;
      this.getformRuleData(this.causingCriteriaMapObj);
    }
  }

  formatCausingCriteriaMapForDocSetting(crtField, value, fieldType) {
    if (value) {
      let codeValue = value;
      switch (fieldType) {
        case "dropdownSingle":
          codeValue = value.code;
          break;
        default:
      }
      console.log(":::updated crt field", crtField, codeValue);
      this.causingCriteriaMapObjForDocSetting[crtField] = codeValue;
      this.getDocSettingJsonData(this.causingCriteriaMapObj);
    }
  }
  // ! Causing Criteria related Fn ends

  // ! Get Formrule Data APIs and setting Form related Fn starts
  getformRuleData(causingCriteriaMapObj: any, init: boolean = false) {
    console.log(this.causingCriteriaMapObj);

    let causingCriteriaFieldValueArr = [];
    this.causingCriteriaFieldsArr.forEach((docCrt) => {
      causingCriteriaFieldValueArr.push(
        `${docCrt} = ${this.causingCriteriaMapObj[docCrt]}`
      );
    });
    // for (const [crtField, value] of Object.entries(causingCriteriaMapObj)) {
    //   console.log(`${crtField}: ${value}`);
    //   causingCriteriaFieldValueArr.push(`${crtField} = ${value}`);
    // }

    let causingCriteriaMap = causingCriteriaFieldValueArr.length
      ? causingCriteriaFieldValueArr.join(";")
      : "NA";
    // if (this.custType == "IND") {
    this.customerFormService
      .getFormRuleDataByCritreriaMap(causingCriteriaMap)
      .subscribe(
        (res) => {
          this.showForm = true;
          if (res["msg"]) {
            this.coreService.showWarningToast(res["msg"]);
            this.apiData = {};
            this.coreService.removeLoadingScreen();
          } else {
            if (init) {
              this.setFormByData(res);
              if (this.mode == "edit") {
                this.getIndividualCustomer(this.custId);
              }
            } else {
              console.log(":::res", res);
              this.modifyFormFieldsRules(res);
            }
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error while fetching data, Try again in sometime"
          );
          this.coreService.removeLoadingScreen();
        }
      );
    // }
  }

  setFormByData(data: any) {
    // NEW JSON START

    this.initFormRuleDataJson = _lodashClone(data.Rules);

    let groupedData = data.Rules.reduce((acc, field) => {
      const fieldSectionName = field.displaySection;
      (acc[fieldSectionName] = acc[fieldSectionName] || []).push(field);
      return acc;
    }, {});
    console.log(":::", groupedData);
    let allFSec = [];
    this.initFormRuleFieldsNames = [];
    Object.keys(groupedData).forEach((key) => {
      let fSec = {
        formName: key,
        seqOrder: groupedData[key][0]["displaySectionOrder"],
        fields: groupedData[key]
          .map((secData) => {
            this.initFormRuleFieldsNames.push(secData["fieldId"]);
            if (secData["checkDuplicate"] == "Yes") {
              this.duplicateCheckFields.push(secData["fieldId"]);
            }
            // ! setting relatedPartyParty start
            if (
              Object.keys(this.multiDetailsSectionData).includes(key) &&
              secData["fieldId"] == "relatedPartyType"
            ) {
              this.selectedPartyType =
                secData["defaultValue"] && secData["defaultValue"] != "null"
                  ? JSON.parse(secData["defaultValue"])
                  : null;
            }
            // ! setting relatedPartyParty ends
            let fData = {
              formName: key,
              displaySectionOrder: secData["displaySectionOrder"],
              name: secData["fieldId"],
              formLableFieldSequence: +secData["fieldDisplayOrder"],
              fieldName: secData["fieldId"],
              fieldType: secData["fieldType"] ? secData["fieldType"] : "text",
              fieldSubtype: secData["fieldSubtype"]
                ? secData["fieldSubtype"]
                : "",
              fieldLabel: secData["fieldDisplayName"],
              required: secData["isMandatory"] == "True" ? true : false,
              enable: secData["isEnable"] == "True" ? true : false,
              visible: secData["isVisible"] == "True" ? true : false,
              validLength: secData["validLength"] ? secData["validLength"] : "",
              defaultValue:
                secData["defaultValue"] && secData["defaultValue"] != "null"
                  ? JSON.parse(secData["defaultValue"])
                  : false,
              newLineField:
                secData["displayInNewLine"] == "True" ? true : false,
              apiKey: secData["apiKey"],
              minLength:
                secData["minLength"]?.length > 0 &&
                secData["minLength"] != "null"
                  ? +secData["minLength"]
                  : false,
              maxLength:
                secData["maxLength"]?.length > 0 &&
                secData["maxLength"] != "null"
                  ? +secData["maxLength"]
                  : false,
              regex:
                secData["regex"] &&
                secData["regex"] != "null" &&
                secData["regex"].trim().length
                  ? secData["regex"]
                  : false,
              regexMsg:
                secData["regexMessage"] && secData["regexMessage"].trim().length
                  ? secData["regexMessage"]
                  : false,
              validValues:
                secData["validValues"] && secData["validValues"].length
                  ? JSON.parse(secData["validValues"])
                  : false,
              displayValidValuesOnHover:
                secData["displayValidValuesOnHover"] &&
                secData["displayValidValuesOnHover"] == "Yes"
                  ? secData["displayValidValuesOnHover"]
                  : false,
              prefix:
                secData["prefix"] && secData["prefix"].trim().length
                  ? secData["prefix"]
                  : false,
              suffix:
                secData["suffix"] && secData["suffix"].trim().length
                  ? secData["suffix"]
                  : false,
              setOptions:
                secData["setOptions"] && secData["setOptions"].length
                  ? JSON.parse(secData["setOptions"])
                  : false,
              minDate:
                secData["fieldType"] == "date"
                  ? secData["minDate"]
                    ? new Date(secData["minDate"])
                    : this.validMinDate(secData["fieldId"])
                  : this.pastYear,
              maxDate:
                secData["fieldType"] == "date"
                  ? secData["maxDate"]
                    ? new Date(secData["maxDate"])
                    : this.validMaxDate(secData["fieldId"])
                  : this.futureYear,
              defaultDate:
                secData["fieldType"] == "date"
                  ? secData["initialDate"]
                    ? new Date(secData["initialDate"])
                    : this.validDefDate(secData["fieldId"])
                  : new Date(),
              blockMessageCode:
                secData["blockMessageCode"] &&
                secData["blockMessageCode"].length
                  ? JSON.parse(secData["blockMessageCode"])
                  : false,
              warningMessageCode:
                secData["warningMessageCode"] &&
                secData["warningMessageCode"].length
                  ? JSON.parse(secData["warningMessageCode"])
                  : false,
              block: secData["block"] == "True" ? true : false,
              warning: secData["warning"] == "True" ? true : false,
            };
            return fData;
          })
          .sort((a, b) => a.formLableFieldSequence - b.formLableFieldSequence),
      };
      allFSec.push(fSec);
    });
    console.log(":::new", allFSec);
    // NEW JSON END

    this.apiData = data;
    this.customerForm = this.formBuilder.group({});
    this.formSections = allFSec.sort((a, b) => a.seqOrder - b.seqOrder);
    console.log(this.formSections);
    this.disabledFields = {};
    this.formSections.forEach((section) => {
      let haveVisibleFields = false;
      const sectionGroup = new UntypedFormGroup({});
      section.fields.forEach((field) => {
        if (!field.enable) {
          this.disabledFields[section.formName] = field.name;
        }
        if (field.visible) {
          haveVisibleFields = true;
        }
        let validators = [];
        if (field.minLength) {
          validators.push(Validators.minLength(field.minLength));
        }
        if (field.maxLength) {
          validators.push(Validators.maxLength(field.maxLength));
        }
        if (field.required) {
          validators.push(Validators.required);
        }
        if (field.regex) {
          validators.push(Validators.pattern(field.regex));
        }
        sectionGroup.addControl(
          field.name,
          this.formBuilder.control(
            {
              value: field.defaultValue ? field.defaultValue : "",
              disabled: !field.enable,
            },
            validators
          )
        );
      });
      section["isVisible"] = haveVisibleFields ? true : false;
      this.customerForm.addControl(section.formName, sectionGroup);
    });
    console.log(this.customerForm);
    this.copyFormSection = _lodashClone(this.formSections);
    this.coreService.removeLoadingScreen();

    //
    if (this.causingCriteriaFieldsArr && this.causingCriteriaFieldsArr.length) {
      this.causingCriteriaFieldsArr.forEach((crtField) => {
        if (!(crtField == "licenceCountry" || crtField == "Customer Type")) {
          let fieldRule = this.initFormRuleDataJson.filter(
            (fieldRule) => fieldRule.fieldId == crtField
          )[0];
          if (fieldRule) {
            let fieldSecName = fieldRule.displaySection;
            let fieldType = fieldRule.fieldType;
            console.log(":::fieldRule", fieldSecName, crtField, fieldType);
            this.customerForm
              .get(fieldSecName)
              ?.get(crtField)
              .valueChanges.subscribe((value) => {
                console.log("::", value);
                this.formatCausingCriteriaMap(crtField, value, fieldType);
              });
          }
        }
      });
    }

    // docSettingCRT
    if (
      this.causingCriteriaFieldsArrForDocSetting &&
      this.causingCriteriaFieldsArrForDocSetting.length
    ) {
      this.causingCriteriaFieldsArrForDocSetting.forEach((crtField) => {
        if (
          !(
            crtField == "Country" ||
            crtField == "Customer Type" ||
            crtField == "Form"
          )
        ) {
          let fieldRule = this.initFormRuleDataJson.filter(
            (fieldRule) => fieldRule.fieldId == crtField
          )[0];
          if (fieldRule) {
            let fieldSecName = fieldRule.displaySection;
            let fieldType = fieldRule.fieldType;
            console.log(":::fieldRule", fieldSecName, crtField, fieldType);
            this.customerForm
              .get(fieldSecName)
              ?.get(crtField)
              .valueChanges.subscribe((value) => {
                console.log("::", value);
                this.formatCausingCriteriaMapForDocSetting(
                  crtField,
                  value,
                  fieldType
                );
              });
          }
        }
      });
    }
  }

  modifyFormFieldsRules(formRulesData: any) {
    formRulesData.Rules.forEach((fieldRule) => {
      if (fieldRule["checkDuplicate"] == "Yes") {
        this.duplicateCheckFields.push(fieldRule["fieldId"]);
      }
      // ! setting relatedPartyParty start
      if (
        Object.keys(this.multiDetailsSectionData).includes(
          fieldRule["displaySection"]
        ) &&
        fieldRule["fieldId"] == "relatedPartyType"
      ) {
        this.selectedPartyType =
          fieldRule["defaultValue"] && fieldRule["defaultValue"] != "null"
            ? JSON.parse(fieldRule["defaultValue"])
            : null;
      }
      // ! setting relatedPartyParty ends
      let fData = {
        formName: fieldRule["displaySection"],
        displaySectionOrder: fieldRule["displaySectionOrder"],
        name: fieldRule["fieldId"],
        formLableFieldSequence: +fieldRule["fieldDisplayOrder"],
        fieldName: fieldRule["fieldId"],
        fieldType: fieldRule["fieldType"] ? fieldRule["fieldType"] : "text",
        fieldSubtype: fieldRule["fieldSubtype"]
          ? fieldRule["fieldSubtype"]
          : "",
        fieldLabel: fieldRule["fieldDisplayName"],
        required: fieldRule["isMandatory"] == "True" ? true : false,
        enable: fieldRule["isEnable"] == "True" ? true : false,
        visible: fieldRule["isVisible"] == "True" ? true : false,
        validLength: fieldRule["validLength"] ? fieldRule["validLength"] : "",
        defaultValue:
          fieldRule["defaultValue"] && fieldRule["defaultValue"] != "null"
            ? JSON.parse(fieldRule["defaultValue"])
            : false,
        newLineField: fieldRule["displayInNewLine"] == "True" ? true : false,
        apiKey: fieldRule["apiKey"],
        minLength:
          fieldRule["minLength"]?.length > 0 && fieldRule["minLength"] != "null"
            ? +fieldRule["minLength"]
            : false,
        maxLength:
          fieldRule["maxLength"]?.length > 0 && fieldRule["maxLength"] != "null"
            ? +fieldRule["maxLength"]
            : false,
        regex:
          fieldRule["regex"] &&
          fieldRule["regex"] != "null" &&
          fieldRule["regex"].trim().length
            ? fieldRule["regex"]
            : false,
        regexMsg:
          fieldRule["regexMessage"] && fieldRule["regexMessage"].trim().length
            ? fieldRule["regexMessage"]
            : false,
        validValues:
          fieldRule["validValues"] && fieldRule["validValues"].length
            ? JSON.parse(fieldRule["validValues"])
            : false,
        displayValidValuesOnHover:
          fieldRule["displayValidValuesOnHover"] &&
          fieldRule["displayValidValuesOnHover"] == "Yes"
            ? fieldRule["displayValidValuesOnHover"]
            : false,
        prefix:
          fieldRule["prefix"] && fieldRule["prefix"].trim().length
            ? fieldRule["prefix"]
            : false,
        suffix:
          fieldRule["suffix"] && fieldRule["suffix"].trim().length
            ? fieldRule["suffix"]
            : false,
        setOptions:
          fieldRule["setOptions"] && fieldRule["setOptions"].length
            ? JSON.parse(fieldRule["setOptions"])
            : false,
        minDate:
          fieldRule["fieldType"] == "date"
            ? fieldRule["minDate"]
              ? new Date(fieldRule["minDate"])
              : this.validMinDate(fieldRule["fieldId"])
            : this.pastYear,
        maxDate:
          fieldRule["fieldType"] == "date"
            ? fieldRule["maxDate"]
              ? new Date(fieldRule["maxDate"])
              : this.validMaxDate(fieldRule["fieldId"])
            : this.futureYear,
        defaultDate:
          fieldRule["fieldType"] == "date"
            ? fieldRule["initialDate"]
              ? new Date(fieldRule["initialDate"])
              : this.validDefDate(fieldRule["fieldId"])
            : new Date(),
        blockMessageCode:
          fieldRule["blockMessageCode"] && fieldRule["blockMessageCode"].length
            ? JSON.parse(fieldRule["blockMessageCode"])
            : false,
        warningMessageCode:
          fieldRule["warningMessageCode"] &&
          fieldRule["warningMessageCode"].length
            ? JSON.parse(fieldRule["warningMessageCode"])
            : false,
        block: fieldRule["block"] == "True" ? true : false,
        warning: fieldRule["warning"] == "True" ? true : false,
      };

      if (!fData.enable) {
        this.disabledFields[fieldRule["displaySection"]] = fData.name;
      }
      // if (fData.visible) {
      //   haveVisibleFields = true;
      // }
      let validators = [];
      if (fData.minLength) {
        validators.push(Validators.minLength(fData.minLength as number));
      }
      if (fData.maxLength) {
        validators.push(Validators.maxLength(fData.maxLength as number));
      }
      if (fData.required) {
        validators.push(Validators.required);
      }
      if (fData.regex) {
        validators.push(Validators.pattern(fData.regex));
      }

      const fieldControl = this.formBuilder.control(
        {
          value: fData.defaultValue ? fData.defaultValue : "",
          disabled: !fData.enable,
        },
        validators
      );

      if (
        this.initFormRuleFieldsNames.find(
          (fieldId) => fieldRule["fieldId"] == fieldId
        )
      ) {
        // If same fieldId found
        let isAnyChangeInFieldRule = false;
        let sectionIndexPosition = -1;
        let fieldIndexPosition = -1;
        this.formSections.forEach((formSection, sectionIndex) => {
          if (formSection.formName == fieldRule["displaySection"]) {
            sectionIndexPosition = sectionIndex;
            formSection.fields.forEach((field, fieldIndex) => {
              if (field.name == fieldRule["fieldId"]) {
                console.log(":::::already", field);
                console.log(":::::new", fData);
                let fieldToIgnore = ["defaultDate", "maxDate", "minDate"];
                let alreadyPresentFieldCopy = _lodashClone(field);
                let newFieldCopy = _lodashClone(fData);
                fieldToIgnore.forEach((f) => {
                  delete alreadyPresentFieldCopy[f];
                  delete newFieldCopy[f];
                });
                console.log(":::::alreadyCop", alreadyPresentFieldCopy);
                console.log(":::::newCopy", newFieldCopy);
                console.log(
                  ":::::isSame",
                  _lodashIsEqual(alreadyPresentFieldCopy, newFieldCopy)
                );

                if (!_lodashIsEqual(alreadyPresentFieldCopy, newFieldCopy)) {
                  isAnyChangeInFieldRule = true;
                }

                fieldIndexPosition = fieldIndex;
              }
            });
          }
        });

        if (isAnyChangeInFieldRule) {
          // If any change in rules found
          if (sectionIndexPosition >= 0 && fieldIndexPosition >= 0) {
            this.formSections[sectionIndexPosition].fields.splice(
              fieldIndexPosition,
              1,
              fData
            );
            this.copyFormSection[sectionIndexPosition].fields.splice(
              fieldIndexPosition,
              1,
              fData
            );
          }
          if (fData.visible) {
            this.formSections[sectionIndexPosition]["isVisible"] = true;
            this.copyFormSection[sectionIndexPosition]["isVisible"] = true;
          }
          (
            this.customerForm.get(fieldRule["displaySection"]) as FormGroup
          ).removeControl(fieldRule["fieldId"]);
          (
            this.customerForm.get(fieldRule["displaySection"]) as FormGroup
          ).addControl(fieldRule["fieldId"], fieldControl);
        }
      } else {
        // If same fieldId not found
        this.initFormRuleFieldsNames.push(fieldRule["fieldId"]);
        let sectionIndexPosition = -1;
        this.formSections.forEach((formSection, sectionIndex) => {
          if (formSection.formName == fieldRule["displaySection"]) {
            sectionIndexPosition = sectionIndex;
          }
        });
        if (sectionIndexPosition >= 0) {
          // if section is present
          let insertIndex = this.formSections[
            sectionIndexPosition
          ].fields.findIndex(
            (field) =>
              +field.formLableFieldSequence > +fData.formLableFieldSequence
          );

          if (!(insertIndex >= 0)) {
            insertIndex = this.formSections[sectionIndexPosition].fields.length;
          }

          this.formSections[sectionIndexPosition].fields.splice(
            insertIndex,
            0,
            fData
          );
          this.copyFormSection[sectionIndexPosition].fields.splice(
            insertIndex,
            0,
            fData
          );

          if (fData.visible) {
            this.formSections[sectionIndexPosition]["isVisible"] = true;
            this.copyFormSection[sectionIndexPosition]["isVisible"] = true;
          }

          (
            this.customerForm.get(fieldRule["displaySection"]) as FormGroup
          ).addControl(fieldRule["fieldId"], fieldControl);
        } else {
          console.log(":::: NOT FOUND SECTION", fieldRule["displaySection"]);
          // if section is also not present
          let newFormSection = {
            formName: fieldRule["displaySection"],
            seqOrder: fieldRule["displaySectionOrder"],
            fields: [fData],
            isVisible: fData.visible ? true : false,
          };
          let insertIndex = this.formSections.findIndex(
            (section) => +section.seqOrder > +fData.displaySectionOrder
          );

          if (!(insertIndex >= 0)) {
            insertIndex = this.formSections.length;
          }
          this.formSections.splice(insertIndex, 0, newFormSection);
          this.copyFormSection.splice(insertIndex, 0, newFormSection);

          const newSectionGroup = new UntypedFormGroup({});
          newSectionGroup.addControl(fieldRule["fieldId"], fieldControl);
          this.customerForm.addControl(
            fieldRule["displaySection"],
            newSectionGroup
          );
        }
      }
    });

    console.log(":::", this.initFormRuleFieldsNames);
    console.log(":::", this.formSections);
  }
  // ! Get Formrule Data APIs and setting Form related Fn ends

  // ! Get DocSetting Data APIs Fn starts
  getDocSettingJsonData(
    causingCriteriaMapObjForDocSetting: any,
    init: boolean = false
  ) {
    console.log(this.causingCriteriaMapObjForDocSetting);
    console.log(this.causingCriteriaFieldsArrForDocSetting);

    let causingCriteriaFieldValueArr = [];
    this.causingCriteriaFieldsArrForDocSetting.forEach((docCrt) => {
      causingCriteriaFieldValueArr.push(
        `${docCrt} = ${this.causingCriteriaMapObjForDocSetting[docCrt]}`
      );
    });
    // for (const [crtField, value] of Object.entries(
    //   causingCriteriaMapObjForDocSetting
    // )) {
    //   console.log(`${crtField}: ${value}`);
    //   causingCriteriaFieldValueArr.push(`${crtField} = ${value}`);
    // }

    let causingCriteriaMap = causingCriteriaFieldValueArr.length
      ? causingCriteriaFieldValueArr.join(";")
      : "NA";

    this.customerFormService
      .getDocumentDataByCriteriaMap(causingCriteriaMap)
      .subscribe(
        (res) => {
          console.log("DOC DATA", res);
          if (res["DocumentSettingData"]) {
            this.documentSettingJsonData = res["DocumentSettingData"];
          } else {
            this.documentSettingJsonData = [];
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error while fetching doc data, Try again in sometime"
          );
        }
      );
  }
  // ! Get DocSetting Data APIs Fn ends

  // ! Customer Edit API & set Form Data related Fn start
  getIndividualCustomer(custId: any) {
    // let res = {
    //   data: {
    //     id: 866,
    //     nameOfTheCorporate: null,
    //     selectTheCustomerFromOrganisation: null,
    //     countryOfEstablishment: null,
    //     dateOfEstablishment: null,
    //     businessPurpose: null,
    //     countryOfOperation: null,
    //     businessActivites: null,
    //     legalStatus: null,
    //     countryOfTrade: null,
    //     licenseNo: null,
    //     licenseExpiryDate: null,
    //     creditToParty: null,
    //     onAccountPaymentMode: null,
    //     contactCountry: "IN",
    //     contactMobileNumber: "7890567890",
    //     contactPhoneNumber: "1150678456",
    //     contactEmailId: "swetha@gmail.com",
    //     contactHouseBulidingNumber: "No: 20/1,",
    //     contactBlockNumber: "DD",
    //     contactStreetNumber: "KULAM 1st Cross Street",
    //     contactCity: "CHENNAI",
    //     contactPinZipcode: "600021",
    //     permanentAddressSameAsAbove: true,
    //     permanentCountry: "IN",
    //     permanentHouseBuildingNumber: "No: 20/1,",
    //     permanentBlockNumber: "DD",
    //     permanentStreetNumber: "KULAM 1st Cross Street",
    //     permanentCity: "CHENNAI",
    //     permanentPinZipcode: "600021",
    //     status: "Active",
    //     beneficiaryCount: 0,
    //     createdBy: "vidya",
    //     updatedBy: "vidya",
    //     customerType: "Individual",
    //     firstNamePersonalDetails: "PRIYA",
    //     middleNamePersonalDetails: "VASHANTHI",
    //     lastNamePersonalDetails: "KK",
    //     genderPersonalDetails: "Female",
    //     dateOfBirthPersonalDetails: null,
    //     countryOfBirthPersonalDetails: null,
    //     nationalityPersonalDetails: null,
    //     customerGroupPersonalDetails: null,
    //     politicallyExposedPersonPersonalDetails: "No",
    //     creditToPartyPersonalDetails: false,
    //     onAccountPaymentModePersonalDetails: false,
    //     employerNameEmpDetails: "SARA",
    //     professionEmpDetails: "Driver",
    //     salaryDateEmpDetails: "6",
    //     monthlySalaryEmpDetails: "100",
    //     visaStatusEmpDetails: "Work Permit",
    //     fullName: "PRIYA VASHANTHI KK",
    //     representativeIdCopyUploadName: null,
    //     representativeAuthorizationLetterName: null,
    //     uploadDocuments: [
    //       {
    //         id: 1153,
    //         idNumber: "788655567899",
    //         documentName: "Aadhar",
    //         idIssueDate: null,
    //         idExpiryDate: null,
    //         idIssueAuthority: "AUTHORITY OF INDIA",
    //         idIssueCountry: "IN",
    //         imageByPassed: false,
    //         hereByConfirm: true,
    //         uploadFrontSideFile: null,
    //         uploadBackSideFile: null,
    //         uploadFrontSide: null,
    //         uploadBackSide: null,
    //         uploadFrontSideOriginal: null,
    //         uploadBackSideOriginal: null,
    //         customerId: 866,
    //         status: "Active",
    //         customerType: "Individual",
    //         operation: "add",
    //         createdBy: "vidya",
    //         createdDateTime: null,
    //         updatedBy: null,
    //         updatedDateTime: null,
    //       },
    //       {
    //         id: 1151,
    //         idNumber: "1106784567",
    //         documentName: "PAN",
    //         idIssueDate: null,
    //         idExpiryDate: null,
    //         idIssueAuthority: "AUTHORITY OF INDIA",
    //         idIssueCountry: "IN",
    //         imageByPassed: false,
    //         hereByConfirm: true,
    //         uploadFrontSideFile: null,
    //         uploadBackSideFile: null,
    //         uploadFrontSide: null,
    //         uploadBackSide: null,
    //         uploadFrontSideOriginal: null,
    //         uploadBackSideOriginal: null,
    //         customerId: 866,
    //         status: "Active",
    //         customerType: "Individual",
    //         operation: "add",
    //         createdBy: "vidya",
    //         createdDateTime: null,
    //         updatedBy: null,
    //         updatedDateTime: null,
    //       },
    //     ],
    //     relatedPartiesDetails: [
    //       {
    //         partyType: "B",
    //         partyCustomerCode: "847",
    //         status: "A",
    //         isNormalCustomer: true,
    //         fullName: "MURALI KRISHNA S",
    //         mobileNumber: "8890756789",
    //       },
    //       {
    //         id: 21,
    //         partyType: "B",
    //         partyCustomerCode: "866",
    //         customerCode: 1066,
    //         status: "A",
    //         isNormalCustomer: true,
    //         mobileNumber: "8712885183",
    //         fullName: "sue k rajuu",
    //       },
    //     ],
    //   },
    //   status: "200",
    // };
    this.customerFormService
      .getCustomerFormDataForEdit(custId, this.userId, this.custType)
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          if (res["status"] == "200") {
            // setTimeout(() => {
            this.setCustomerFormData(res["data"]);
            this.onActiveData = res["data"];
            console.log("data", res["data"]);
            console.log("data1", this.onActiveData);
            if (res["data"]["status"] == "Inactive") {
              this.disableFormControls();
              this.deactivated = true;
            }
            // }, 2000);
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
  setCustomerFormData(data: any) {
    this.CustomerData = data;
    this.formSections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field["fieldName"] in data) {
          if (
            field.fieldType == "dropdownSingle" ||
            field.fieldType == "dropdownMulti"
          ) {
            let filterData = this.masterData[field["fieldName"]]?.filter(
              (msField) => {
                return msField.code == data[field["fieldName"]];
              }
            );
            let value = filterData?.length
              ? {
                  code: filterData[0].code,
                  codeName: filterData[0].codeName,
                }
              : "";
            this.customerForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(value);
          } else if (field.fieldType == "checkbox") {
            let value = data[field["fieldName"]] == true ? true : false;
            this.customerForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(value);
          } else if (field.fieldType == "date") {
            let dateFormatted = data[field["fieldName"]]
              ? !isNaN(Date.parse(data[field["fieldName"]]))
                ? new Date(data[field["fieldName"]]).toLocaleDateString("en-GB")
                : new Date(
                    data[field["fieldName"]].split("/").reverse().join("-")
                  ).toLocaleDateString("en-GB")
              : "";

            this.customerForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(dateFormatted);
          } else {
            this.customerForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(data[field["fieldName"]]);
          }
        }
      });
    });

    // * setting docs in Doc Setting Component
    this.customerUploadedDocumentsData = data["uploadDocuments"];

    // * setting relatedParty details
    this.addedPartyDetailsTableData = data["relatedParties"] || [];
    console.log(":::isNormalCust", this.isNormalCustomer);
    console.log(":::isPartyTypeCode", this.relatedPartyTypeCode);
  }
  // ! Customer Edit API & set Form Data related Fn ends

  // ! Customer Save/Update related start
  onSubmit(): void {
    this.submitted = true;
    // ! Checking validity for Doc Component
    if (!this.errorFromDocumentComponent) {
      this.saveIndCustomer();
    } else {
      this.scroller.scrollToAnchor("document-collection-form");
      this.coreService.showWarningToast(this.errorFromDocumentComponent);
      return;
    }
  }

  saveIndCustomer() {
    let multiDetailsSectionNames = Object.keys(this.multiDetailsSectionData);
    let multiDetailsSectionCodes = Object.values(this.multiDetailsSectionData);

    let validForm = true;

    this.formSections.forEach((section) => {
      if (
        !multiDetailsSectionNames.includes(section.formName) &&
        this.customerForm.get(section.formName).invalid
      ) {
        validForm = false;
      }
    });
    if (!validForm) {
      this.coreService.showWarningToast(
        "Customer data form is invalid, please check"
      );
      return;
    }

    //!  Beneficial owner 100% validation starts
    // let beneValidPass = true;
    // this.formSections.forEach((section) => {
    //   if (
    //     section.formName == "Beneficial Owner Details" &&
    //     multiDetailsSectionNames.includes("Beneficial Owner Details")
    //   ) {
    //     let benePercent = 0;
    //     this.multiDetailsSectionData["Beneficial Owner Details"].forEach(
    //       (beneData) => {
    //         if (
    //           beneData.percentage["valueToSend"] &&
    //           !Number.isNaN(Number(beneData.percentage["valueToSend"]))
    //         ) {
    //           benePercent += +beneData.percentage["valueToSend"];
    //         } else {
    //           benePercent += 0;
    //         }
    //       }
    //     );
    //     console.log("::benCheck%Total", benePercent);
    //     if (benePercent < 100) {
    //       beneValidPass = false;
    //       this.coreService.showWarningToast(
    //         "Add all the beneficial owner details, total beneficial owner % value should equal to 100 "
    //       );
    //       return;
    //     } else if (benePercent > 100) {
    //       beneValidPass = false;
    //       this.coreService.showWarningToast(
    //         "Total beneficial owner % value should equal to 100"
    //       );
    //       return;
    //     }
    //   }
    // });

    // if (!beneValidPass) {
    //   return;
    // }
    //!  Beneficial owner 100% validation ENDS

    this.isConfirmedCustomer = this.checked ? "true" : "false";

    // this.coreService.displayLoadingScreen();

    let data = this.customerForm.getRawValue();

    console.log(data);

    let payloadData = {};

    for (let key in data) {
      if (!multiDetailsSectionNames.includes(key)) {
        payloadData = { ...payloadData, ...data[key] };
      }
    }

    let formData = new FormData();
    // ! Payload formatting for other than uploadDocuments & relatedParties sections STARTS
    this.formSections.forEach((section) => {
      if (!multiDetailsSectionNames.includes(section.formName)) {
        section.fields.forEach((field) => {
          if (
            field.fieldType == "dropdownSingle" ||
            field.fieldType == "dropdownMulti"
          ) {
            let value = payloadData[field["fieldName"]]
              ? payloadData[field["fieldName"]]["code"]
              : "";
            payloadData[field["fieldName"]] = value;
          } else if (field.fieldType == "checkbox") {
            let value = payloadData[field["fieldName"]] == true ? true : false;
            payloadData[field["fieldName"]] = value;
          } else if (field.fieldType == "date") {
            let dateFormatted = payloadData[field["fieldName"]]
              ? !isNaN(Date.parse(payloadData[field["fieldName"]]))
                ? new Date(payloadData[field["fieldName"]]).toLocaleDateString(
                    "en-GB"
                  )
                : new Date(
                    payloadData[field["fieldName"]]
                      .split("/")
                      .reverse()
                      .join("-")
                  ).toLocaleDateString("en-GB")
              : "";
            payloadData[field["fieldName"]] = dateFormatted;
          } else {
            payloadData[field["fieldName"]] =
              payloadData[field["fieldName"]] == "null" ||
              payloadData[field["fieldName"]] == null
                ? ""
                : payloadData[field["fieldName"]];
          }
        });
      }
    });
    // ! Payload formatting for other than uploadDocuments & relatedParties sections ENDS

    // ! Payload formatting for uploadDocuments & relatedParties sections STARTS

    // % Payload formatting for multiSections OLD FLOW STARTS
    // for (let key in this.multiDetailsSectionData) {
    //   let dtoName =
    //     key
    //       .split(" ")
    //       .map((word, index) => {
    //         return index === 0
    //           ? word.toLowerCase()
    //           : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    //       })
    //       .join("") + "Dto";
    //   if (this.multiDetailsSectionData[key].length) {
    //     this.multiDetailsSectionData[key].forEach((details, index) => {
    //       for (let fieldId in details) {
    //         formData.append(
    //           `${dtoName}[${index}].${fieldId}`,
    //           details[fieldId]["valueToSend"]
    //         );
    //       }
    //     });
    //   }
    // }
    // % Payload formatting for multiSections OLD FLOW ENDS

    // * Payload formatting for relatedParties sections STARTS
    let paramNeedToSend = [
      "partyType",
      "partyCustomerCode",
      "status",
      "isNormalCustomer",
    ];

    multiDetailsSectionCodes.forEach((sectionCode) => {
      if (this.addedPartyDetailsTableData.length) {
        this.addedPartyDetailsTableData.forEach((details, index) => {
          for (let fieldId in details) {
            if (paramNeedToSend.includes(fieldId)) {
              formData.append(
                `${sectionCode}[${index}].${fieldId}`,
                details[fieldId]
              );
            }
          }
        });
      }
    });
    // * Payload formatting for relatedParties sections ENDS

    //! Payload formatting for uploadDocuments & relatedParties sections ENDS

    payloadData["languageCode"] = "EN";

    //! EDIT CASE Payload formatting STARTS
    if (this.mode == "edit") {
      payloadData["createdBy"] = this.CustomerData["createdBy"]
        ? this.CustomerData["createdBy"]
        : "";
      payloadData["createdDateTime"] = this.CustomerData["createdDateTime"]
        ? this.CustomerData["createdDateTime"]
        : "";
      payloadData["updatedBy"] = this.CustomerData["updatedBy"]
        ? this.CustomerData["updatedBy"]
        : "";
      payloadData["updatedDateTime"] = this.CustomerData["updatedDateTime"]
        ? this.CustomerData["updatedDateTime"]
        : "";
      payloadData["id"] = this.custId;

      for (let key in payloadData) {
        formData.append(key, payloadData[key]);
      }

      this.updateIndividualCustomer(formData, this.custId);
    }

    //! EDIT CASE Payload formatting ENDS

    //! ADD CASE Payload formatting STARTS
    else {
      for (let key in payloadData) {
        formData.append(key, payloadData[key]);
      }

      this.saveIndividualCustomer(formData);
    }

    //! ADD CASE Payload formatting ENDS
    for (var pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }
    console.log(":::originalCustomerType", this.originalCustomerType);
    console.log(":::originalCustomerCode", this.originalCustomerCode);

    console.log(JSON.stringify(payloadData, null, 2));
  }

  saveIndividualCustomer(payload: any) {
    this.customerFormService
      .saveCustomerFormData(
        payload,
        this.userId,
        this.custType,
        this.isConfirmedCustomer,
        this.duplicateCheckFields,
        this.isNormalCustomer ? "C" : this.relatedPartyTypeCode
      )
      .subscribe(
        (res) => {
          if (res["status"] == "200") {
            if (res["error"]) {
              // this.coreService.showWarningToast(res["error"]);
              this.coreService.setHeaderStickyStyle(false);
              this.coreService.setSidebarBtnFixedStyle(false);
              this.confirmationService.confirm({
                message:
                  `<img src="../../../assets/warning.svg"><br/><br/>` +
                  `${res["error"]};<br/>` +
                  `click Yes to view details`,
                key: "resetINDWarning",
                accept: () => {
                  this.customerDataForView = [];
                  this.clickforview = true;
                  this.viewCustomerTableCols =
                    this.custType == "IND"
                      ? this.viewIndCustomerTableCols
                      : this.viewCorCustomerTableCols;

                  this.customerDataForView.push(res["Duplicate Data"]);
                },
                reject: () => {
                  this.setHeaderSidebarBtn();
                  this.confirmationService.close;
                },
              });
              this.coreService.removeLoadingScreen();
            } else {
              if (res["msg"]) {
                this.coreService.showSuccessToast(res["msg"]);
              } else {
                this.coreService.showSuccessToast(
                  "Profile data successfully saved"
                );
              }
              // ? assuming getting customerCode in response
              // ! if on sub-page related party start
              if (this.relatedPartyTypeCode != "C") {
                // % redirecting back to main page
                this.showFormForRelatedParty.emit("C");
                this.existingCustomerMissingDocCaseId.emit(null);
                this.onEditFromPartyTable.emit(false);

                // % sending customerCode back to main page
                console.log(";:: sent from form", res["customerCode"]);
                this.onNewlyAddedCustomerAsPartyDetails.emit(
                  res["customerCode"]
                );
                return;
              }
              // ! if on sub-page related party ends
              else {
                this.router.navigate(["navbar", "customer-profile"]);
              }
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
          this.coreService.removeLoadingScreen();
        }
      );
  }

  updateIndividualCustomer(payload: any, custId: any) {
    this.customerFormService
      .updateCustomerFormData(
        payload,
        this.userId,
        this.custType,
        this.isConfirmedCustomer,
        this.duplicateCheckFields,
        this.isNormalCustomer ? "C" : this.relatedPartyTypeCode
      )
      .subscribe(
        (res) => {
          if (res["status"] == "200") {
            if (res["error"]) {
              // this.coreService.showWarningToast(res["error"]);
              this.coreService.setHeaderStickyStyle(false);
              this.coreService.setSidebarBtnFixedStyle(false);
              this.confirmationService.confirm({
                message:
                  `<img src="../../../assets/warning.svg"><br/><br/>` +
                  `${res["error"]};<br/>` +
                  `click Yes to view details`,
                key: "resetINDWarning",
                accept: () => {
                  this.customerDataForView = [];
                  this.clickforview = true;
                  this.customerDataForView.push(res["Duplicate Data"]);
                },
                reject: () => {
                  this.confirmationService.close;

                  this.setHeaderSidebarBtn();
                },
              });
              this.coreService.removeLoadingScreen();
            } else {
              if (res["msg"]) {
                this.coreService.showSuccessToast(res["msg"]);
              } else {
                this.coreService.showSuccessToast(
                  "Profile data updated successfully"
                );
              }

              // ? getting customerCode in function call params
              // ! if on sub-page related party start
              if (this.relatedPartyTypeCode != "C") {
                if (this.editFromPartyTable) {
                  // RELOAD go get Customer with updated related Party
                  this.router
                    .navigateByUrl("/", { skipLocationChange: true })
                    .then(() => {
                      this.router.navigate([
                        "navbar",
                        "customer-profile",
                        "addnewcustomer",
                        this.originalCustomerType,
                        this.originalCustomerCode,
                        "edit",
                      ]);
                    });
                } else {
                  // % redirecting back to main page
                  this.showFormForRelatedParty.emit("C");
                  this.existingCustomerMissingDocCaseId.emit(null);
                  this.onEditFromPartyTable.emit(false);

                  // % sending customerCode back to main page
                  console.log(";:: sent from form", custId);
                  this.onNewlyAddedCustomerAsPartyDetails.emit(custId);
                  return;
                }
              }
              // ! if on sub-page related party ends
              else {
                this.router.navigate(["navbar", "customer-profile"]);
              }
            }
          } else {
            this.coreService.removeLoadingScreen();
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
  // ! Customer Save/Update related ends

  // ! Customer Save/Update Duplicate Error related starts
  onCustomerSubmit() {
    this.coreService.setHeaderStickyStyle(true);
    this.coreService.setSidebarBtnFixedStyle(true);
    this.onSubmit();
  }

  onCustomerReject() {
    this.coreService.setHeaderStickyStyle(true);
    this.coreService.setSidebarBtnFixedStyle(true);
    this.router.navigate(["navbar", "customer-profile"]);
  }

  closeDialog() {
    this.setHeaderSidebarBtn();
    this.checked = false;
  }
  // ! Customer Save/Update Duplicate Error related starts

  // ! Customer Status related start
  onActive(data: any) {
    this.confirmStatus();
  }
  confirmStatus() {
    let type = "";
    let reqStatus = "";
    if (this.deactivated == true) {
      reqStatus = "Active";
      type = "activate";
    } else {
      reqStatus = "Inactive";
      type = "deactivate";
    }
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    let completeMsg = "";
    completeMsg =
      `<img src="../../../assets/warning.svg"><br/><br/>` +
      `Do you wish to ` +
      type +
      ` the Customer Record: ${this.onActiveData["id"]}?`;

    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatus",
      accept: () => {
        this.updateStatus(
          reqStatus,
          this.onActiveData,
          this.onActiveData["customerType"]
        );
        this.setHeaderSidebarBtn();
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
      },
    });
  }
  updateStatus(reqStatus: any, data: any, cusType: any) {
    this.coreService.displayLoadingScreen();
    this.updateCustomerStatus(data["id"], reqStatus, cusType);
  }

  updateCustomerStatus(cusId: any, status: any, cusType: any) {
    let service: Observable<any>;
    console.log(this.userId, status, cusId.toString(), cusType);
    service = this.customerFormService.updateCustomerCorporateStatus(
      this.userId,
      status,
      cusId.toString(),
      cusType
    );
    service.subscribe(
      (res) => {
        if (res["status"] == "200") {
          this.coreService.showSuccessToast(res["data"]);
          this.coreService.removeLoadingScreen();
          this.deactivated = !this.deactivated;
          if (this.deactivated) {
            this.disableFormControls();
          } else {
            this.enableFormControls();
          }
        } else {
          this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast(res["msg"]);
        }
      },
      (err) => {
        console.log(err);
        this.coreService.removeLoadingScreen();
      }
    );
  }
  // ! Customer Status related ends

  searchEmployer(e) {
    this.customerFormService
      .getEmployeeDetailsByLetters(this.employerType, e.query)
      .subscribe((res) => {
        this.filteredEmployer = [];
        res["data"]?.forEach((ele) => {
          this.filteredEmployer.push(ele);
        });
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

  onReset(): void {
    this.coreService.setHeaderStickyStyle(false);
    this.coreService.setSidebarBtnFixedStyle(false);
    this.confirmationService.confirm({
      message:
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        "Resetting will result in the removal of all data. Are you sure you want to proceed ?",
      key: "resetINDWarning",
      accept: () => {
        this.submitted = false;
        if (this.customerForm) {
          this.customerForm.reset();
        }
        this.setHeaderSidebarBtn();
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
      },
    });
  }

  onClickBack() {
    this.showFormForRelatedParty.emit("C");
    this.existingCustomerMissingDocCaseId.emit(null);
    this.onEditFromPartyTable.emit(false);

    // set BreadCrumbs
    this.coreService
      .getBreadCrumbMenu()
      .pipe(take(1))
      .subscribe((currBCrumbs) => {
        console.log(":::currB", currBCrumbs);
        currBCrumbs.pop();
        this.coreService.setBreadCrumbMenuFromInternalPages(currBCrumbs);
      });
  }
}
