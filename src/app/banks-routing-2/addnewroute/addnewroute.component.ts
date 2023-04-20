import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { CoreService } from "src/app/core.service";

import { BankRoutingService } from "../bank-routing.service";
import { TransactionCriteriaModal2 } from "../transaction-criteria-modal/transaction-criteria-modal";
import { Table } from "primeng/table";
import { CriteriaTemplateData } from "../banks-routing.model";
import { map, take } from "rxjs/operators";
import { forkJoin } from "rxjs";
import { ConfirmDialog } from "primeng/confirmdialog";

@Component({
  selector: "app-addnewroute",
  templateUrl: "./addnewroute.component.html",
  styleUrls: ["./addnewroute.component.scss"],
  providers: [DialogService, MessageService],
})
export class AddnewrouteComponent2 implements OnInit {
  @ViewChild("table", { static: false }) table!: Table;

  primaryColor = "var(--primary-color)";

  formName = "Bank Routings";
  applicationName = "Web Application";

  dummyTemplateJson = {
    data: [
      {
        id: 221,
        userID: "yogeshm",
        criteriaName: "test1",
        criteriaMap:
          "Organization != SBI;Country != India;Correspondent = HDFC",
        lcySlab: null,
        createdDate: "2023-02-27T08:06:00.451+00:00",
        status: "A",
      },
      {
        id: 261,
        userID: "yogeshm",
        criteriaName: "India HDFC",
        criteriaMap: "Organization = HDFC;Country = India",
        lcySlab: null,
        createdDate: "2023-03-05T23:01:40.949+00:00",
        status: "A",
      },
      {
        id: 282,
        userID: "yogeshm",
        criteriaName: "Japan HDFC slab",
        criteriaMap: "Organization = HDFC;LCY Amount = Slab;Country = Japan",
        lcySlab: "from:1::to:10",
        createdDate: "2023-03-07T16:28:06.252+00:00",
        status: "A",
      },
      {
        id: 269,
        userID: "yogeshm",
        criteriaName: "test1ddd",
        criteriaMap: "Organization = HDFC;Country = India;LCY Amount = Slab",
        lcySlab: "from:5::to:5#from:10::to:10",
        createdDate: "2023-03-07T06:05:00.927+00:00",
        status: "A",
      },
      {
        id: 241,
        userID: "yogeshm",
        criteriaName: "ttttt",
        criteriaMap: "Organization != SBI;Country != India",
        lcySlab: null,
        createdDate: "2023-02-27T16:11:44.181+00:00",
        status: "A",
      },
      {
        id: 281,
        userID: "yogeshm",
        criteriaName: "India HDFC NEFT",
        criteriaMap: "Organization = HDFC;Country = India;Service Type = NEFT",
        lcySlab: "null",
        createdDate: "2023-03-07T16:16:39.497+00:00",
        status: "A",
      },
      {
        id: 283,
        userID: "yogeshm",
        criteriaName: "India HDFC Cash",
        criteriaMap:
          "Organization = HDFC;Country = India;Service Category = Cash",
        lcySlab: "null",
        createdDate: "2023-03-07T16:37:37.636+00:00",
        status: "A",
      },
      {
        id: 284,
        userID: "yogeshm",
        criteriaName: "test",
        criteriaMap:
          "Country = India;Organization = HDFC;Organization = SBI;Service Category = Bank;Service Type != NEFT",
        lcySlab: "null",
        createdDate: "2023-03-07T19:53:36.298+00:00",
        status: "A",
      },
    ],
  };
  bankRoutesData: any = [];
  editBankRouteApiData: any = [];
  bankRoutesColumns = [
    { field: "country", header: "Country", editable: false, visible: true },
    {
      field: "routeBankName",
      header: "Route Bank Name",
      editable: false,
      visible: true,
    },
    {
      field: "routeServiceCategory",
      header: "Service Category",
      editable: false,
      visible: true,
    },
    {
      field: "routeServiceType",
      header: "Service type",
      editable: false,
      visible: true,
    },
    {
      field: "isCorrespondent",
      header: "Is Correspondent",
      editable: false,
      visible: true,
    },
    {
      field: "lcyAmountFrom",
      header: "LCY Amount From",
      editable: false,
      visible: false,
    },
    {
      field: "lcyAmountTo",
      header: "LCY Amount To",
      editable: false,
      visible: false,
    },
    {
      field: "routeToBankName",
      header: "Route to *",
      editable: true,
      visible: true,
    },
    {
      field: "routeToServiceCategory",
      header: "Service Category *",
      editable: true,
      visible: true,
    },
    {
      field: "routeToServiceType",
      header: "Service type *",
      editable: true,
      visible: true,
    },
  ];
  lcySlab = null;
  isSelectedRouteToBankName = false;
  isSelectedRouteToServiceCategory = false;
  apiResponse: any = {};
  hideValuesDropdown = false;
  showValueInput = false;
  isLcyControlSelected = false;
  criteriaText: any[] = [];
  criteriaCodeText: any[] = [];
  testData: any[] = [];
  criteriaSetData: any[] = [];
  criteriaOperations: any[] = [];
  clickforsave = false;
  userId = "";
  criteriaName = "";
  criteriaTemplatesDdlOptions: any = [];
  criteriaMapDdlOptions = [];
  criteriaEqualsDdlOptions = [];
  correspondentDdlOptions = [];
  selectedRowCollumn = [];

  criteriaDataDetailsJson: any = {
    data: {
      Organization: [
        {
          id: 1,
          code: "SBI",
          codeName: "SBI",
          isCorrespondent: "Y",
          status: "A",
        },
        {
          id: 2,
          code: "HDFC",
          codeName: "HDFC",
          isCorrespondent: "Y",
          status: "A",
        },
        {
          id: 3,
          code: "ICICI",
          codeName: "ICICI",
          isCorrespondent: "N",
          status: "A",
        },
      ],
      dependance: {
        // Organization: "Country",
        "Service Type": "Service Category",
      },
      listCriteria: {
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
            id: 151,
            fieldName: "LCY Amount",
            displayName: "LCY Amount",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 5,
            iSMandatory: "no",
          },
          {
            id: 152,
            fieldName: "Service Category",
            displayName: "Service Category",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 4,
            iSMandatory: "yes",
          },
          {
            id: 154,
            fieldName: "Country",
            displayName: "Country",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 2,
            iSMandatory: "yes",
          },
          {
            id: 153,
            fieldName: "Organization",
            displayName: "Organization",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 3,
            iSMandatory: "yes",
          },
          {
            id: 155,
            fieldName: "Service Type",
            displayName: "Service Type",
            fieldType: "Dropdown",
            operations: "Is Equal To,Is Not Equal To",
            orderID: 1,
            iSMandatory: "yes",
          },
        ],
      },
      Country: [
        {
          id: 1,
          code: "USA",
          countryName: "Amarica",
          status: "A",
        },
        {
          id: 2,
          code: "IND",
          countryName: "India",
          status: "A",
        },
        {
          id: 3,
          code: "JPN",
          countryName: "Japan",
          status: "A",
        },
        {
          id: 4,
          code: "CHI",
          countryName: "Chaina",
          status: "A",
        },
        {
          id: 5,
          code: "PAK",
          countryName: "Pakistna",
          status: "A",
        },
        {
          id: 6,
          code: "UK",
          countryName: "England",
          status: "A",
        },
      ],
      mandatory: "[Country, Organization]",
      "Service Category": [
        {
          id: 1,
          code: "Bank",
          codeName: "Bank",
          status: "A",
        },
        {
          id: 2,
          code: "Cash",
          codeName: "Cash",
          status: "A",
        },
        {
          id: 3,
          code: "Utility",
          codeName: "Utility",
          status: "A",
        },
      ],
      "Service Type": [
        {
          id: 1,
          code: "NEFT",
          codeName: "NEFT",
          status: "A",
        },
        {
          id: 2,
          code: "RTGS",
          codeName: "RTGS",
          status: "A",
        },
        {
          id: 3,
          code: "IMPS",
          codeName: "IMPS",
          status: "A",
        },
        {
          id: 4,
          code: "Cash pick up",
          codeName: "Cash pick up",
          status: "A",
        },
        {
          id: 5,
          code: "A/C transfer",
          codeName: "A/C transfer",
          status: "A",
        },
      ],
    },
    status: "200",
  };

  // cmCriteriaDataDetails: any = [];
  cmCriteriaDataDetails: any =
    this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails;

  // cmCriteriaDataDetails: any = [
  //   {
  //     id: 153,
  //     fieldName: "Organization",
  //     displayName: "Organization",
  //     fieldType: "Dropdown",
  //     operations: "Is Equal To,Is Not Equal To",
  //     orderID: 3,
  //     iSMandatory: "yes",
  //     values: ["HDFC", "SBI", "ICICI", "Any"],
  //   },
  //   {
  //     id: 154,
  //     fieldName: "Country",
  //     displayName: "Country",
  //     fieldType: "Dropdown",
  //     operations: "Is Equal To,Is Not Equal To",
  //     orderID: 2,
  //     iSMandatory: "yes",
  //     values: ["India", "US", "UK", "Any"],
  //   },
  //   {
  //     id: 152,
  //     fieldName: "Service Category",
  //     displayName: "Service Category",
  //     fieldType: "Dropdown",
  //     operations: "Is Equal To,Is Not Equal To",
  //     orderID: 5,
  //     iSMandatory: "yes",
  //     values: ["Cash", "Online", "NEFT", "Any"],
  //   },
  //   {
  //     id: 151,
  //     fieldName: "Correspondent",
  //     displayName: "Correspondent",
  //     fieldType: "Dropdown",
  //     operations: "Is Equal To,Is Not Equal To",
  //     orderID: 1,
  //     iSMandatory: "yes",
  //     values: ["HDFC", "SBI", "ICICI", "Any"],
  //   },
  //   {
  //     id: 155,
  //     fieldName: "Service Type",
  //     displayName: "Service Type",
  //     fieldType: "Dropdown",
  //     operations: "Is Equal To,Is Not Equal To",
  //     orderID: 4,
  //     iSMandatory: "yes",
  //     values: ["Bank", "Utility", "Any"],
  //   },
  //   {
  //     id: 156,
  //     fieldName: "LCY Amount",
  //     displayName: "LCY Amount",
  //     fieldType: "Dropdown",
  //     operations: "Slab",
  //     orderID: 6,
  //     iSMandatory: "yes",
  //     values: [],
  //   },
  // ];

  // cmCriteriaMandatory = [];
  cmCriteriaMandatory = this.criteriaDataDetailsJson.data.mandatory
    .replace(/["|\[|\]]/g, "")
    .split(", ");

  savedLcySlabs = false;
  nullRange = true;
  isLcySlabsCriteria = false;

  ref: DynamicDialogRef;
  txnCriteriaRangeFormData: any;

  selectCriteriaForm: any;
  validCriteria = false;

  removeAddCriteriaListener: any;
  AddCriteriaClickListener: boolean = false;

  routeToBankNameOption = [];
  routeToServiceCategoryOption = [];
  routeToServiceTypeOption = [];
  routeId = "";

  $oninitLcyFormSubscription: any;
  mode = "add";

  selectedTemplate = this.criteriaTemplatesDdlOptions.length
    ? "Select Template"
    : "No saved templates";

  criteriaMasterData: any = {};
  cmCriteriaDependency: any = {};

  independantCriteriaArr: any = [];

  constructor(
    private bankRoutingService: BankRoutingService,
    private activatedRoute: ActivatedRoute,
    private ngxToaster: ToastrService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private fb: UntypedFormBuilder,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private confirmationService: ConfirmationService
  ) {}

  @ViewChild("cd") cd: ConfirmDialog;
  @ViewChild("addCriteriaBtn") addCriteriaBtn: ElementRef;

  ngOnInit(): void {
    this.mode = "add";
    // this.getAddBankRouteCriteriaData();
    this.getCriteriaMasterData();
    this.setSelectAppForm1();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.$oninitLcyFormSubscription = this.bankRoutingService
      .getTransactionCriteriaRange()
      .subscribe((res) => {
        this.txnCriteriaRangeFormData = res;
        if (!!Object.keys(this.txnCriteriaRangeFormData).length) {
          this.txnCriteriaRangeFormData["txnCriteriaRange"].forEach((range) => {
            if (Object.values(range).filter((rng) => rng == null).length == 0) {
              this.savedLcySlabs = true;
            } else {
              this.savedLcySlabs = false;
            }
          });
        } else {
          this.savedLcySlabs = false;
        }
      });

    const params = this.activatedRoute.snapshot.params;
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];
    this.getAllTemplates();

    if (params && params.id) {
      this.mode = "edit";
      this.getBanksRoutingForEditApi(params.id);
      this.routeId = params.id;
    }

    //check mandatory fieds
    this.bankRoutesColumns.forEach((element) => {
      this.cmCriteriaMandatory.forEach((item) => {
        element.header == item && (element.header = element.header + " *");
        item == "Organization" &&
          element.field == "routeBankName" &&
          (element.header = element.header + " *");
      });
    });
  }
  setSelectAppForm1() {
    this.selectCriteriaForm = this.fb.group({
      criteria: new UntypedFormControl({ value: "", disabled: false }, [
        Validators.required,
      ]),
      operation: new UntypedFormControl(
        { value: "", disabled: !this.criteriaEqualsDdlOptions.length },
        [Validators.required]
      ),
      value: new UntypedFormControl(
        { value: "", disabled: !this.correspondentDdlOptions.length },
        [Validators.required]
      ),
    });
  }

  getBanksRoutingForEditApi(routeCode: any) {
    this.bankRoutingService.getBanksRoutingForEdit(routeCode).subscribe(
      (res) => {
        this.editBankRouteApiData = res;

        // Ajay code
        if ((res as any).data[0]["criteriaMap"]) {
          this.criteriaText = (res as any).data[0]["criteriaMap"].split(";");
        }
        let lcySlabForm = {};
        let lcySlabArr = [];
        if (res["LCY"] == "Yes") {
          (res as any).data[0]["lcySlab"].split("#").forEach((rngTxt) => {
            let fromVal = rngTxt.split("::")[0].split(":")[1];
            let toVal = rngTxt.split("::")[1].split(":")[1];
            lcySlabArr.push({
              from: +fromVal,
              to: +toVal,
            });
          });
          lcySlabForm = {
            txnCriteriaRange: lcySlabArr,
          };

          this.bankRoutingService.setTransactionCriteriaRange(lcySlabForm);
        }
        // Ajay code end

        // suresh code
        this.bankRoutesData = res["data"];
        if (this.editBankRouteApiData.LCY == "Yes") {
          this.bankRoutesColumns.forEach((x) => {
            (x.field == "lcyAmountFrom" || x.field == "lcyAmountTo") &&
              (x.visible = true);
          });
        } else {
          this.bankRoutesColumns.forEach((x) => {
            (x.field == "lcyAmountFrom" || x.field == "lcyAmountTo") &&
              (x.visible = false);
          });
        }

        // suresh code end
      },
      (err) => {
        console.log("Error in getBanksRoutingForEditApi", err);
      }
    );
  }

  getCriteriaMasterData() {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.bankRoutingService.getCriteriaMasterData(
        this.formName,
        this.applicationName
      ),
      addBankRouteCriteriaData:
        this.bankRoutingService.getAddBankRouteCriteriaData(),
    })
      .pipe(
        take(1),
        map((response) => {
          const criteriaMasterData = response.criteriaMasterData;
          this.criteriaDataDetailsJson = response.addBankRouteCriteriaData;
          this.cmCriteriaDataDetails =
            this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails;

          let crArr = [];
          this.criteriaMapDdlOptions = crArr;
          console.log(this.criteriaDataDetailsJson.data);
          this.cmCriteriaMandatory = this.criteriaDataDetailsJson.data.mandatory
            .replace(/["|\[|\]]/g, "")
            .split(", ");
          console.log(" this.cmCriteriaMandatory", this.cmCriteriaMandatory);

          console.log(
            " Dependance",
            this.criteriaDataDetailsJson.data.dependance
          );
          this.cmCriteriaDependency =
            this.criteriaDataDetailsJson.data.dependance;
          this.cmCriteriaDataDetails.forEach((element) => {
            let isMandatory = false;
            let isDependent = false;
            let dependencyList = "";
            let dependenceObj = this.criteriaDataDetailsJson.data.dependance;
            if (
              this.cmCriteriaMandatory &&
              this.cmCriteriaMandatory.indexOf(element.fieldName) >= 0
            ) {
              isMandatory = true;
            }
            if (
              Object.keys(dependenceObj).length &&
              dependenceObj[element.fieldName] &&
              dependenceObj[element.fieldName] != "null"
            ) {
              isDependent = true;
              dependencyList = dependenceObj[element.fieldName];
            } else {
              this.independantCriteriaArr.push(element.displayName);
            }

            crArr.push({
              name: element.displayName,
              code: element.fieldName,
              isMandatory: isMandatory,
              isDependent: isDependent,
              dependencyList: dependencyList,
            });
          });
          return criteriaMasterData;
        })
      )
      .subscribe(
        (res) => {
          console.log(res);
          this.criteriaMasterData = res;
        },
        (err) => {
          console.log("Error in Initiating dropdown values", err);
        }
      )
      .add(() => {
        this.coreService.removeLoadingScreen();
      });
  }

  getAddBankRouteCriteriaData() {
    this.coreService.displayLoadingScreen();
    this.bankRoutingService
      .getAddBankRouteCriteriaData()
      .subscribe(
        (res) => {
          this.criteriaDataDetailsJson = res;
          this.cmCriteriaDataDetails =
            this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails;

          let crArr = [];
          this.criteriaMapDdlOptions = crArr;
          console.log(this.criteriaDataDetailsJson.data);
          this.cmCriteriaMandatory = this.criteriaDataDetailsJson.data.mandatory
            .replace(/["|\[|\]]/g, "")
            .split(", ");
          console.log(" this.cmCriteriaMandatory", this.cmCriteriaMandatory);
          console.log(
            " Dependance",
            this.criteriaDataDetailsJson.data.dependance
          );
          this.cmCriteriaDataDetails.forEach((element) => {
            let isMandatory = false;
            let isDependent = false;
            let dependencyList = "";
            let dependenceObj = this.criteriaDataDetailsJson.data.dependance;
            if (
              this.cmCriteriaMandatory &&
              this.cmCriteriaMandatory.indexOf(element.fieldName) >= 0
            ) {
              isMandatory = true;
            }
            console.log("dependenceObj", dependenceObj[element.fieldName]);
            if (
              Object.keys(dependenceObj).length &&
              dependenceObj[element.fieldName] &&
              dependenceObj[element.fieldName] != "null"
            ) {
              isDependent = true;
              dependencyList = dependenceObj[element.fieldName];
            } else {
              this.independantCriteriaArr.push(element.displayName);
            }

            crArr.push({
              name: element.displayName,
              code: element.fieldName,
              isMandatory: isMandatory,
              isDependent: isDependent,
              dependencyList: dependencyList,
            });
          });
        },
        (err) => {
          console.log("::error loading AddBankRouteCriteriaData", err);
        }
      )
      .add(() => {
        this.coreService.removeLoadingScreen();
      });
  }

  get criteriaCtrl() {
    return this.selectCriteriaForm.get("criteria");
  }
  get operationCtrl() {
    return this.selectCriteriaForm.get("operation");
  }
  get valueCtrl() {
    return this.selectCriteriaForm.get("value");
  }

  addCriteriaMap() {
    console.log(this.operationCtrl.value);
    let value = "";
    let valueCode = "";
    if (this.criteriaCtrl.value.name == "LCY Amount") {
      if (this.operationCtrl.value.name == "Slab") {
        value = "Slab";
        valueCode = "Slab";
      } else {
        value = this.valueCtrl.value;
        valueCode = this.valueCtrl.value;
      }
    } else {
      value = this.valueCtrl.value.name;
      valueCode = this.valueCtrl.value.code;
    }

    console.log(value, valueCode);
    let criteria =
      this.criteriaCtrl.value.name +
      " " +
      this.operationCtrl.value.code +
      " " +
      value;
    let criteriaCode =
      this.criteriaCtrl.value.name +
      " " +
      this.operationCtrl.value.code +
      " " +
      valueCode;
    let index = this.criteriaText.indexOf(criteria);
    //validations
    if (this.criteriaText.length && index != -1) {
      this.ngxToaster.warning(
        criteria + " already added, please add different case"
      );
    } else if (this.criteriaText.length) {
      if (criteria.includes("=") || criteria.includes("!=")) {
        let isCurrentCriteriaNotEqualCondition = false;
        let isCurrentCriteriaEqualCondition = false;
        let splitdata;

        if (criteria.includes("!=")) {
          isCurrentCriteriaNotEqualCondition = true;
          splitdata = criteria.replace(/[!=]/g, "");
        } else {
          isCurrentCriteriaEqualCondition = true;
          splitdata = criteria.replace(/[=]/g, "");
        }
        this.validCriteria = true;

        this.criteriaText.every((element) => {
          let splitText;
          if (element.includes("!=")) {
            splitText = element.replace(/[!=]/g, "");
          } else {
            splitText = element.replace(/[=]/g, "");
          }

          if (splitText.split("  ")[0] == splitdata.split("  ")[0]) {
            if (splitText.split("  ")[1] == splitdata.split("  ")[1]) {
              this.ngxToaster.warning(
                " Please select different criteria for " +
                  splitdata.split("  ")[0]
              );
              this.validCriteria = false;
              return false;
            } else {
              let isAlreadyCriteriaNotEqualCondition = false;
              let isAlreadyCriteriaEqualCondition = false;

              if (element.includes("!=")) {
                isAlreadyCriteriaNotEqualCondition = true;
              } else {
                isAlreadyCriteriaEqualCondition = true;
              }

              if (
                isAlreadyCriteriaEqualCondition ==
                  !isCurrentCriteriaEqualCondition &&
                isAlreadyCriteriaNotEqualCondition ==
                  !isCurrentCriteriaNotEqualCondition
              ) {
                console.log("::new validation passed");
              } else {
                if (
                  !(
                    splitText.split("  ")[1] != "Any" &&
                    splitdata.split("  ")[1] != "Any"
                  )
                ) {
                  this.ngxToaster.warning(
                    "Please delete existing criteria " +
                      element +
                      ", then add " +
                      criteria
                  );
                  this.validCriteria = false;
                  return false;
                } else {
                  return true;
                }
              }
            }
          } else {
            return true;
          }
        });

        if (this.validCriteria) {
          this.checkLcySlabCriteria(criteria, criteriaCode);
        }
      }
    } else {
      this.checkLcySlabCriteria(criteria, criteriaCode);
    }
  }

  checkLcySlabCriteria(criteria: any, criteriaCode: any) {
    if (this.isLcySlabsCriteria) {
      if (this.$oninitLcyFormSubscription) {
        this.$oninitLcyFormSubscription.unsubscribe();
      }

      this.bankRoutingService.getTransactionCriteriaRange().subscribe((res) => {
        console.log("::::getTransactionRange called in checking", res);
        this.txnCriteriaRangeFormData = res;

        if (!!Object.keys(res).length) {
          console.log("rng data present");
          res["txnCriteriaRange"].forEach((range) => {
            if (Object.values(range).filter((rng) => rng == null).length == 0) {
              console.log("rng data present not null");
              this.savedLcySlabs = true;
            } else {
              console.log("rng data present null");
              this.savedLcySlabs = false;
            }
          });
        } else {
          console.log("rng data absent");
          this.savedLcySlabs = false;
        }

        if (this.savedLcySlabs) {
          console.log("lcy present");
          if (
            !this.criteriaText.filter(
              (criteria) => criteria == "LCY Amount = Slab"
            ).length
          ) {
            this.criteriaText.push(criteria);
            this.criteriaCodeText.push(criteriaCode);
            this.resetCriteriaDropdowns();
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          } else {
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          }
        } else {
          console.log(
            "lcy absent",
            this.removeAddCriteriaListener,
            this.AddCriteriaClickListener
          );
          if (!this.AddCriteriaClickListener) {
            console.log("eventlistener absent");
            this.removeAddCriteriaListener = this.renderer.listen(
              this.addCriteriaBtn.nativeElement,
              "click",
              (evt) => {
                this.showTransCriteriaModal();
              }
            );
            this.AddCriteriaClickListener = true;
          }
        }
      });
    } else {
      this.criteriaText.push(criteria);
      this.criteriaCodeText.push(criteriaCode);
      this.resetCriteriaDropdowns();
    }
  }

  isCriteriaSelectable(event: any) {
    let formattedCriteriaArr = [];
    formattedCriteriaArr = this.criteriaCodeText.map((crt) => {
      let formatCrt;
      if (crt.includes("!=")) {
        formatCrt = crt.replace(/[!=]/g, "");
      } else if (crt.includes(">=")) {
        formatCrt = crt.replace(/[>=]/g, "");
      } else if (crt.includes("<=")) {
        formatCrt = crt.replace(/[<=]/g, "");
      } else if (crt.includes("<")) {
        formatCrt = crt.replace(/[<]/g, "");
      } else if (crt.includes(">")) {
        formatCrt = crt.replace(/[>]/g, "");
      } else {
        formatCrt = crt.replace(/[=]/g, "");
      }
      return formatCrt.split("  ")[0];
    });

    console.log(formattedCriteriaArr, this.cmCriteriaDependency, event["name"]);

    if (Object.keys(this.cmCriteriaDependency).includes(event["name"])) {
      console.log(
        formattedCriteriaArr,
        formattedCriteriaArr.includes(this.cmCriteriaDependency[event["name"]])
      );
      if (
        formattedCriteriaArr.includes(this.cmCriteriaDependency[event["name"]])
      ) {
        if (formattedCriteriaArr.includes(event["name"])) {
          this.ngxToaster.warning(
            `${event["name"]} is already added. Select any other Criteria.`
          );
          return false;
        } else {
          return true;
        }
      } else {
        this.ngxToaster.warning(
          `${event["name"]} is dependant on ${
            this.cmCriteriaDependency[event["name"]]
          }, Select it first.`
        );
        return false;
      }
    } else {
      console.log(
        formattedCriteriaArr.includes(event["name"]),
        formattedCriteriaArr.includes(this.cmCriteriaDependency[event["name"]])
      );
      if (
        formattedCriteriaArr.includes(
          this.cmCriteriaDependency[event["name"]]
        ) ||
        formattedCriteriaArr.includes(event["name"])
      ) {
        this.ngxToaster.warning(
          `${event["name"]} is already added. Select any other Criteria.`
        );
        return false;
      }
      return true;
    }
  }

  onCriteriaSelect(event: any) {
    console.log("::criteria", event, this.cmCriteriaDependency);
    this.hideValuesDropdown = false;
    this.showValueInput = false;
    if (this.isCriteriaSelectable(event)) {
      // this.ngxToaster.success(`${event["name"]} is selectable`);
      this.onChange("criteria", event);
    } else {
      this.resetCriteriaDropdowns();
    }
  }

  getCorrespondentValues(fieldName: any, displayName: any) {
    // let criteriaMapValue = "Country = IND;Organization = SBI;State = Any;State != MH";
    let criteriaMapValue = this.criteriaCodeText.join(";");

    console.log(criteriaMapValue);
    console.log(
      this.formName,
      this.applicationName,
      criteriaMapValue,
      fieldName,
      displayName
    );
    this.coreService.displayLoadingScreen();
    this.bankRoutingService
      .getCorrespondentValuesData(
        this.formName,
        this.applicationName,
        criteriaMapValue,
        fieldName,
        displayName
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          console.log(res);
          if (res[fieldName]) {
            this.valueCtrl.enable();
            this.hideValuesDropdown = false;
            this.showValueInput = false;

            console.log(res[fieldName]);
            this.correspondentDdlOptions = res[fieldName].map((val) => {
              return { name: val["codeName"], code: val["code"] };
            });
          } else {
            if (res["message"]) {
              this.ngxToaster.warning(res["message"]);
              this.resetCriteriaDropdowns();
            } else {
              this.ngxToaster.warning("Criteria Map is not proper");
              this.resetCriteriaDropdowns();
            }
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log("Error in getting values", err);
          this.resetCriteriaDropdowns();
          // this.ngxToaster.warning(
          //   `${displayName} is already added. Select any other Criteria.`
          // );
        }
      );
  }

  resetCriteriaDropdowns() {
    this.criteriaCtrl.reset();
    this.operationCtrl.reset();
    this.valueCtrl.reset();
    this.valueCtrl.disable();
    this.operationCtrl.disable();
    this.correspondentDdlOptions = [];
  }

  onChange(controlId, event) {
    switch (controlId) {
      case "criteria":
        let selectedCorrespondent = this.cmCriteriaDataDetails.filter(
          (x) => event.code == x.fieldName
        );
        let operations;
        this.hideValuesDropdown = false;
        this.showValueInput = false;
        if (selectedCorrespondent[0].fieldName == "LCY Amount") {
          this.isLcyControlSelected = true;
          console.log("LCY control selected", this.isLcyControlSelected);
          operations = selectedCorrespondent[0].operations.split(",");
          this.valueCtrl.reset();
          this.valueCtrl.disable();
          this.correspondentDdlOptions = [];
        } else {
          console.log(
            "other control selected, is LCY",
            this.isLcyControlSelected
          );
          this.isLcyControlSelected = false;
          this.correspondentDdlOptions = [];
          this.valueCtrl.patchValue("");
          this.getCorrespondentValues(event.name, event.code);
          operations = selectedCorrespondent[0].operations.split(",");
        }
        this.criteriaEqualsDdlOptions = [];
        console.log("corres", selectedCorrespondent);
        this.operationCtrl.patchValue("");
        if (operations.length) {
          this.operationCtrl.enable();
          operations.forEach((opr) => {
            let oprCode = "=";
            switch (opr) {
              case "Is Equal To":
                oprCode = "=";
                break;
              case "Is Not Equal To":
                oprCode = "!=";
                break;
              case "Is Greater Than":
                oprCode = ">";
                break;
              case "Is Greater Than Equal To":
                oprCode = ">=";
                break;
              case "Is Less Than":
                oprCode = "<";
                break;
              case "Is Less Than Equal To":
                oprCode = "<=";
                break;
              case "Slab":
                oprCode = "=";
                break;
            }
            // let oprCode = opr == "Is Equal To" || opr == "Slab" ? "=" : "!=";
            this.criteriaEqualsDdlOptions.push({
              name: opr,
              code: oprCode,
            });
          });
        } else {
          this.operationCtrl.disable();
        }
        // let values =
        //   this.criteriaDataDetailsJson.data[selectedCorrespondent[0].fieldName];
        // if (values && values.length) {
        //   this.valueCtrl.enable();
        //   this.hideValuesDropdown = false;
        //   values.forEach((element) => {
        //     this.correspondentDdlOptions.push({
        //       name: element.codeName ? element.codeName : element.countryName,
        //       code: element.code,
        //     });
        //   });
        //   this.correspondentDdlOptions.push({
        //     name: "Any",
        //     code: "Any",
        //   });
        // } else {
        //   this.valueCtrl.disable();
        //   this.hideValuesDropdown = true;
        // }
        break;

      case "condition":
        this.hideValuesDropdown = false;
        this.showValueInput = false;
        if (
          event.name == "Slab" &&
          !this.criteriaText.filter(
            (criteria) => criteria == "LCY Amount = Slab"
          ).length
        ) {
          this.isLcySlabsCriteria = true;
          this.valueCtrl.disable();
          this.hideValuesDropdown = true;
          this.showValueInput = false;
          if (!this.AddCriteriaClickListener) {
            this.removeAddCriteriaListener = this.renderer.listen(
              this.addCriteriaBtn.nativeElement,
              "click",
              (evt) => {
                this.showTransCriteriaModal();
              }
            );
            this.AddCriteriaClickListener = true;
          }
        } else if (event.name == "Slab") {
          console.log("listner", this.AddCriteriaClickListener);
          if (this.AddCriteriaClickListener) {
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          }
          this.isLcySlabsCriteria = true;
          this.valueCtrl.disable();
          this.hideValuesDropdown = true;
          this.showValueInput = false;
        } else if (this.isLcyControlSelected) {
          console.log("Insert Input Text for Value");
          this.valueCtrl.enable();
          this.hideValuesDropdown = true;
          this.showValueInput = true;
          if (this.AddCriteriaClickListener) {
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          }
          this.isLcySlabsCriteria = false;
        } else {
          this.hideValuesDropdown = false;
          if (this.AddCriteriaClickListener) {
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          }
          this.isLcySlabsCriteria = false;
        }
        break;
      default:
        break;
    }
  }

  changeCriteriaFields(criteriaName: any) {
    const criteria = this.testData.find(
      (item) => item.displayName === criteriaName
    );
    this.criteriaOperations = criteria.operations.split(",");
  }

  ondeletecriteria(i: any, criteria: any) {
    if (criteria == "LCY Amount = Slab") {
      this.savedLcySlabs = false;

      this.bankRoutingService.setTransactionCriteriaRange({
        txnCriteriaRange: [{ from: null, to: null }],
      });
      if (this.isLcySlabsCriteria) {
        this.removeAddCriteriaListener = this.renderer.listen(
          this.addCriteriaBtn.nativeElement,
          "click",
          (evt) => {
            this.showTransCriteriaModal();
          }
        );
        this.AddCriteriaClickListener = true;
      } else {
        console.log("not LCY criteria current");
      }
    }

    let arr2 = [...this.criteriaText];
    let arr1 = [...this.independantCriteriaArr];
    let independantIndexes = [];

    arr2.forEach((arr2Item, i) => {
      console.log(arr1, arr2Item.split(" ")[0], arr1.includes("LCY Amount"));
      arr1.forEach((arr1Item) => {
        if (arr1Item.includes(arr2Item.split(" ")[0])) {
          independantIndexes.push(i);
          console.log(arr2Item, arr1Item, i);
        }
      });
    });

    let formatCrt = this.criteriaText[i];
    if (formatCrt.includes("!=")) {
      formatCrt = formatCrt.replace(/[!=]/g, "");
    } else {
      formatCrt = formatCrt.replace(/[=]/g, "");
    }

    console.log(
      Object.values(this.cmCriteriaDependency),
      formatCrt.split("  ")[0],
      independantIndexes
    );

    if (
      Object.values(this.cmCriteriaDependency).includes(
        formatCrt.split("  ")[0]
      )
    ) {
      console.log("dependant");
      this.confirmationService.confirm({
        message: `All dependant criteria will be deleted, you want to delete ?`,
        key: "criteriaDeleteConfirm",
        accept: () => {
          this.deleteCriteria(formatCrt, criteria);
        },
      });
    } else {
      this.criteriaText.splice(i, 1);
      this.criteriaCodeText.splice(i, 1);
    }

    console.log(this.independantCriteriaArr, this.criteriaText);

    this.resetCriteriaDropdowns();
  }

  deleteCriteria(formatCrt, criteria) {
    let applicableKeys = [...Object.keys(this.cmCriteriaDependency)];
    let selectedKeys = [];
    let allChildDependants = [];

    let childDependants = [formatCrt.split("  ")[0]];

    while (childDependants.length) {
      selectedKeys = [];
      selectedKeys = [...childDependants];
      childDependants = [];
      selectedKeys.forEach((selcCrit) => {
        applicableKeys.forEach((applCrit) => {
          if (this.cmCriteriaDependency[applCrit] === selcCrit) {
            childDependants.push(applCrit);
            allChildDependants.push(applCrit);
          }
        });
      });
    }

    let critTxt = [...this.criteriaText];
    let critCodeTxt = [...this.criteriaCodeText];
    let removeCrit = [];
    let removeCodeCrit = [];

    allChildDependants = [
      ...Array.from(new Set(allChildDependants)),
      formatCrt.split("  ")[0],
    ];

    critTxt.forEach((crtTxt) => {
      let formatCrt = crtTxt;
      if (formatCrt.includes("!=")) {
        formatCrt = formatCrt.replace(/[!=]/g, "");
      } else {
        formatCrt = formatCrt.replace(/[=]/g, "");
      }
      formatCrt = formatCrt.split("  ")[0];
      allChildDependants.forEach((deps) => {
        if (deps == formatCrt) {
          removeCrit.push(crtTxt);
        }
      });
    });

    critCodeTxt.forEach((crtCodeTxt) => {
      let formatCrt = crtCodeTxt;
      if (formatCrt.includes("!=")) {
        formatCrt = formatCrt.replace(/[!=]/g, "");
      } else {
        formatCrt = formatCrt.replace(/[=]/g, "");
      }
      formatCrt = formatCrt.split("  ")[0];
      allChildDependants.forEach((deps) => {
        if (deps == formatCrt) {
          removeCodeCrit.push(crtCodeTxt);
        }
      });
    });

    this.criteriaText = this.criteriaText.filter((el) => {
      return !removeCrit.includes(el);
    });
    this.criteriaCodeText = this.criteriaCodeText.filter((el) => {
      return !removeCodeCrit.includes(el);
    });

    console.log("::to remove crit", removeCrit);

    console.log("::remaining crit ", this.criteriaText);

    this.ngxToaster.warning(
      `All dependent values of ${criteria} has been removed`
    );
  }

  openClickForSave() {
    if (this.criteriaText.length) {
      this.clickforsave = true;
    } else {
      this.ngxToaster.warning("Please add criteria.");
    }
  }

  checkMandatoryCondition(formattedCriteriaArr: any) {
    if (
      this.cmCriteriaMandatory.every((r) => formattedCriteriaArr.includes(r))
    ) {
      let criteriaObj = {};
      criteriaObj["slabs"] = null;
      if (
        this.criteriaText.filter((criteria) => criteria == "LCY Amount = Slab")
          .length
      ) {
        criteriaObj["slabs"] =
          this.txnCriteriaRangeFormData["txnCriteriaRange"];
      }
      criteriaObj["criteriaMap"] = this.criteriaText.join(";");

      return criteriaObj;
    } else {
      this.ngxToaster.warning(
        `Please add all mandatory criteria for applying the criteria. Mandatory criteria are ${this.cmCriteriaMandatory.join(
          ", "
        )}`
      );
      return false;
    }
  }

  checkDependanceCondition(formattedCriteriaArr: any) {
    let dependencyCheckPassed = true;

    let containsAll = (arr1, arr2) =>
      arr2.every((arr2Item) => arr1.includes(arr2Item));

    Object.keys(this.criteriaDataDetailsJson.data.dependance).forEach(
      (dependantCrt) => {
        if (
          formattedCriteriaArr.includes(dependantCrt) &&
          this.criteriaDataDetailsJson.data.dependance[dependantCrt] != "null"
        ) {
          if (
            // formattedCriteriaArr.includes(
            //   this.criteriaDataDetailsJson.data.dependance[dependantCrt]
            // )
            containsAll(
              formattedCriteriaArr,
              this.criteriaDataDetailsJson.data.dependance[dependantCrt].split(
                ","
              )
            )
          ) {
            console.log(
              "And its dependant is also present",
              this.criteriaDataDetailsJson.data.dependance[dependantCrt]
            );
          } else {
            dependencyCheckPassed = false;
            this.ngxToaster.warning(
              `${dependantCrt} is dependant on ${this.criteriaDataDetailsJson.data.dependance[dependantCrt]}, Please select that also`
            );
            return dependencyCheckPassed;
          }
        }
      }
    );
    return dependencyCheckPassed;
  }

  applyCriteria() {
    let formattedCriteriaArr = this.criteriaText.map((crt) => {
      let formatCrt;
      if (crt.includes("!=")) {
        formatCrt = crt.replace(/[!=]/g, "");
      } else {
        formatCrt = crt.replace(/[=]/g, "");
      }
      return formatCrt.split("  ")[0];
    });

    let finalCriteriaObj;

    if (this.checkMandatoryCondition(formattedCriteriaArr)) {
      finalCriteriaObj = this.checkMandatoryCondition(formattedCriteriaArr);
      console.log(
        "mandatory passed",
        this.checkMandatoryCondition(formattedCriteriaArr)
      );
      if (this.checkDependanceCondition(formattedCriteriaArr)) {
        console.log("mandatory and dependance passed");
        const postDataCriteria = new FormData();

        let criteriaMap = finalCriteriaObj.criteriaMap;
        let slabText = null;
        postDataCriteria.append("criteriaMap", criteriaMap);
        postDataCriteria.append("lcySlab", slabText);
        postDataCriteria.append("userId", this.userId);
        if (finalCriteriaObj.slabs) {
          let slabs = finalCriteriaObj.slabs;
          let slabArr = [];
          slabs.forEach((slab) => {
            let rngArr = [];
            Object.entries(slab).forEach((rng) => {
              rngArr.push(rng.join(":"));
            });
            slabArr.push(rngArr.join("::"));
          });
          slabText = slabArr.join("#");
        }

        this.lcySlab = slabText;
        postDataCriteria.set("lcySlab", slabText);

        this.routeBankCriteriaSearchApi(postDataCriteria);
      } else {
        this.bankRoutesData = [];
      }
    }
  }

  routeBankCriteriaSearchApi(formData: any) {
    this.coreService.displayLoadingScreen();
    this.bankRoutingService
      .postRouteBankCriteriaSearch(formData)
      .subscribe(
        (res) => {
          console.log("criteriasearch DATA", res);
          if (!res["msg"]) {
            console.log("routeBankCriteriaSearchApi resp", res);
            this.apiResponse = res;
            this.ngxToaster.success(`Criteria Applied Successfully`);
            this.getBanksRoutingData(this.userId);
          } else {
            this.ngxToaster.warning(res["msg"]);
            this.bankRoutesData = [];
          }
        },
        (err) => {
          console.log("error in BankCriteriaSearchApi", err);
        }
      )
      .add(() => {
        this.coreService.removeLoadingScreen();
      });
  }

  saveCriteriaAsTemplate() {
    if (this.criteriaName == "") {
      this.ngxToaster.warning("Name of Criteria Template cannot be Empty");
      return;
    }

    const formData = new FormData();
    formData.append("userId", this.userId);
    formData.append("criteriaName", this.criteriaName);
    formData.append("criteriaMap", this.criteriaText.join(";"));

    let slabText = null;
    let slabs = this.txnCriteriaRangeFormData.txnCriteriaRange;
    if (slabs && slabs.length) {
      let slabArr = [];
      slabs.forEach((slab) => {
        let rngArr = [];
        Object.entries(slab).forEach((rng) => {
          rngArr.push(rng.join(":"));
        });
        slabArr.push(rngArr.join("::"));
      });
      slabText = slabArr.join("#");
    }
    this.lcySlab = slabText;
    formData.append("lcySlab", this.lcySlab);
    this.bankRoutingService
      .currentCriteriaSaveAsTemplate(formData)
      .subscribe((response) => {
        if (response.msg == "Criteria Template already exists.") {
          this.clickforsave = false;
          this.criteriaName = "";
          this.ngxToaster.warning(response.msg);
        } else {
          this.selectedTemplate = this.criteriaName;
          this.ngxToaster.success(response.msg);
          this.clickforsave = false;
          this.criteriaName = "";
          this.getAllTemplates();
        }
      });
  }

  getAllTemplates() {
    this.bankRoutingService
      .getAllCriteriaTemplates(this.userId)
      .subscribe((response) => {
        if (response.data && response.data.length) {
          console.log("::templates", response);
          this.criteriaTemplatesDdlOptions = response.data;
          this.criteriaTemplatesDdlOptions.forEach((val) => {
            val["name"] = val["criteriaName"];
            val["code"] = val["criteriaName"];
            val["lcySlab"] = val["lcySlab"];
          });
        } else {
          this.ngxToaster.warning(response.msg);
        }
      });
  }

  selectCriteriaTemplate(item) {
    this.selectCriteriaForm.reset();
    let selectedData: CriteriaTemplateData =
      this.criteriaTemplatesDdlOptions.filter((x: { criteriaName: any }) => {
        return x.criteriaName == item.criteriaName;
      })[0];
    this.criteriaText = selectedData.criteriaMap.split(";");
    console.log(this.criteriaText);
    if (
      !this.criteriaText?.filter((criteria) => criteria == "LCY Amount = Slab")
        .length
    ) {
      if (!this.AddCriteriaClickListener) {
        this.removeAddCriteriaListener = this.renderer.listen(
          this.addCriteriaBtn.nativeElement,
          "click",
          (evt) => {
            this.showTransCriteriaModal();
          }
        );
        this.AddCriteriaClickListener = true;
      }

      this.bankRoutingService.setTransactionCriteriaRange({
        txnCriteriaRange: [{ from: null, to: null }],
      });
    } else {
      let lcySlabForm = {};
      let lcySlabArr = [];
      selectedData["lcySlab"].split("#").forEach((rngTxt) => {
        let fromVal = rngTxt.split("::")[0].split(":")[1];
        let toVal = rngTxt.split("::")[1].split(":")[1];
        lcySlabArr.push({
          from: +fromVal,
          to: +toVal,
        });
      });
      lcySlabForm = {
        txnCriteriaRange: lcySlabArr,
      };
      console.log("::setting form LCYYYYYYYY", lcySlabForm);
      this.bankRoutingService.setTransactionCriteriaRange(lcySlabForm);
    }
  }

  showTransCriteriaModal() {
    this.ref = this.dialogService.open(TransactionCriteriaModal2, {
      width: "40%",
      contentStyle: { overflow: "auto" },
      baseZIndex: 10000,
      styleClass: "txn-criteria-modal",
      data: { txnCriteriaRange: this.txnCriteriaRangeFormData },
    });
    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.txnCriteriaRangeFormData = data;
      }
    });
  }

  selectedColumn(column, row, index) {
    console.log(row);
    switch (column) {
      case "routeToBankName":
        this.mode == "add" &&
          (this.selectedRowCollumn[index].routeToBank = true);
        this.bankRoutesData[index]["routeToServiceCategory"] = "";
        break;
      case "routeToServiceCategory":
        if (this.mode == "add") {
          this.bankRoutesData[index]["routeToServiceType"] = "";
          if (!this.selectedRowCollumn[index].routeToBank) {
            this.ngxToaster.warning("Please select the route to bank first");
            this.selectedRowCollumn[index].routeToServiceCategory = false;
          } else {
            this.selectedRowCollumn[index].routeToServiceCategory = true;
          }
        }
        break;
      case "routeToServiceType":
        if (this.mode == "add") {
          if (!this.selectedRowCollumn[index].routeToServiceCategory) {
            this.ngxToaster.warning("Please select the service category first");
            this.selectedRowCollumn[index].routeToServiceType = false;
          } else {
            this.selectedRowCollumn[index].routeToServiceType = true;
          }
        }

        break;
      default:
        break;
    }
  }

  getBanksRoutingData(id: string) {
    this.bankRoutesData = this.apiResponse.data;
    this.bankRoutesData.forEach((element) => {
      element.routeToBankNameOption = element.routeToBankName;
      element.routeToServiceCategoryOption = element.routeToServiceCategory;
      element.routeToServiceTypeOption = element.routeToServiceType;
      element.routeToBankName = "";
      element.routeToServiceType = "";
      element.routeToServiceCategory = "";
      this.selectedRowCollumn.push({
        routeToBank: false,
        routeToServiceCategory: false,
        routeToServiceType: false,
      });
    });
    if (this.apiResponse.LCY == "Yes") {
      this.bankRoutesColumns.forEach((x) => {
        (x.field == "lcyAmountFrom" || x.field == "lcyAmountTo") &&
          (x.visible = true);
      });
    } else {
      this.bankRoutesColumns.forEach((x) => {
        (x.field == "lcyAmountFrom" || x.field == "lcyAmountTo") &&
          (x.visible = false);
      });
    }
  }

  saveAddNewRoute(action) {
    let payload = [];
    let isRequiredFields = false;
    this.bankRoutesData.forEach((element) => {
      if (
        element.routeToBankName == "" ||
        element.routeToServiceCategory == "" ||
        element.routeToServiceType == ""
      ) {
        isRequiredFields = true;
      } else {
        element["userId"] = this.userId;
        element["routeDesc"] =
          "Based on the critetria selected banks will be routed to preferred routing bank";
        element["lcyAmountTo"] = element.lcyAmountTo
          ? element.lcyAmountTo
          : null;
        element["lcyAmountFrom"] = element.lcyAmountFrom
          ? element.lcyAmountFrom
          : null;
        payload.push(element);
      }
    });

    console.log(
      this.bankRoutesData[0]["lcySlab"],
      this.lcySlab,
      this.getSlabCriteriaText(
        this.txnCriteriaRangeFormData["txnCriteriaRange"]
      )
    );
    if (
      this.bankRoutesData[0]["criteriaMap"] &&
      this.checkArrSimilarity(
        this.criteriaText,
        this.bankRoutesData[0]["criteriaMap"].split(";")
      )
    ) {
      if (
        !this.bankRoutesData[0]["lcySlab"] ||
        this.bankRoutesData[0]["lcySlab"] == "null" ||
        this.getSlabCriteriaText(
          this.txnCriteriaRangeFormData["txnCriteriaRange"]
        ) == this.bankRoutesData[0]["lcySlab"]
      ) {
        console.log("Payload", { data: payload });
        if (isRequiredFields) {
          this.ngxToaster.warning("Please Select required fields.");
        } else {
          this.coreService.displayLoadingScreen();
          let service;
          if (this.routeId != "") {
            service = this.bankRoutingService.updateRoute(
              this.routeId,
              this.userId,
              {
                data: payload,
              }
            );
          } else {
            service = this.bankRoutingService.addNewRoute({ data: payload });
          }
          service
            .subscribe(
              (res) => {
                if (res["msg"]) {
                  this.ngxToaster.success(res.msg);
                  if (action == "save") {
                    this.router.navigate([`navbar/bank-routing`]);
                  } else if (action == "saveAndAddNew") {
                    this.router.navigate([`navbar/bank-routing/addnewroute`]);
                  }
                }
              },
              (err) => {
                console.log("error in saveAddNewRoute", err);
              }
            )
            .add(() => {
              this.coreService.removeLoadingScreen();
            });
        }
      } else {
        this.ngxToaster.warning(
          "LCY Criteria has been modified, Please apply it first"
        );
      }
    } else {
      this.ngxToaster.warning(
        "Criterias has been modified, Please apply them first"
      );
    }
  }

  getSlabCriteriaText(slabs: any[]) {
    let slabArr = [];
    let slabText = null;
    slabs.forEach((slab) => {
      let rngArr = [];
      Object.entries(slab).forEach((rng) => {
        rngArr.push(rng.join(":"));
      });
      slabArr.push(rngArr.join("::"));
    });
    slabText = slabArr.join("#");
    return slabText;
  }

  checkArrSimilarity(arr1: any[], arr2: any[]) {
    console.log(arr1, arr2);
    const containsAll = (arr1, arr2) =>
      arr2.every((arr2Item) => arr1.includes(arr2Item));

    const sameMembers = (arr1, arr2) =>
      containsAll(arr1, arr2) && containsAll(arr2, arr1);

    return sameMembers(arr1, arr2);
  }

  getTooltip(criteria: any) {
    let tooltip = `${criteria.isMandatory ? "Mandatory Criteria \n" : ""} ${
      criteria.isDependent ? "Dependent on " + criteria.dependencyList : ""
    }`;
    if (criteria.isMandatory || criteria.isDependent) {
      return tooltip;
    } else {
      return false;
    }
  }

  reset() {
    this.bankRoutesData = [];
    this.setSelectAppForm1();
    this.criteriaText = [];
    this.bankRoutesData[0]["criteriaMap"] = [];
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }

    this.bankRoutingService.setTransactionCriteriaRange({
      txnCriteriaRange: [{ from: null, to: null }],
    });
  }
}
