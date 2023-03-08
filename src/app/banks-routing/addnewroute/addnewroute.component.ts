import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { MessageService } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { element } from "protractor";
import { first, take, takeWhile } from "rxjs/operators";
import { CoreService } from "src/app/core.service";

import { BankRoutingService } from "../bank-routing.service";
import { TransactionCriteriaModal } from "../transaction-criteria-modal/transaction-criteria-modal";
import { Table } from "primeng/table";

@Component({
  selector: "app-addnewroute",
  templateUrl: "./addnewroute.component.html",
  styleUrls: ["./addnewroute.component.css"],
  providers: [DialogService, MessageService],
})
export class AddnewrouteComponent implements OnInit {
  @ViewChild("table", { static: false }) table!: Table;
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
      header: "Route to",
      editable: true,
      visible: true,
    },
    {
      field: "routeToServiceCategory",
      header: "Service Category",
      editable: true,
      visible: true,
    },
    {
      field: "routeToServiceType",
      header: "Service type",
      editable: true,
      visible: true,
    },
  ];
  lcySlab = null;
  isSelectedRouteToBankName = false;
  isSelectedRouteToServiceCategory = false;
  apiResponse: any = {};
  hideValuesDropdown = false;
  criteriaText: any[] = [];
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
  // criteriaMap: any = {
  //   criteria: "",
  //   condition: "",
  //   val: "",
  // };
  //data from API

  criteriaDataDetailsJson: any = {
    // data: {
    //   Organization: [
    //     {
    //       id: 1,
    //       code: "SBI",
    //       codeName: "SBI",
    //       isCorrespondent: "Y",
    //       status: "A",
    //     },
    //     {
    //       id: 2,
    //       code: "HDFC",
    //       codeName: "HDFC",
    //       isCorrespondent: "Y",
    //       status: "A",
    //     },
    //     {
    //       id: 3,
    //       code: "ICICI",
    //       codeName: "ICICI",
    //       isCorrespondent: "N",
    //       status: "A",
    //     },
    //   ],
    //   dependance: {
    //     // Organization: "Country",
    //     "Service Type": "Service Category",
    //   },
    //   viewCriteria: {
    //     id: 83,
    //     applications: "Web Application",
    //     form: "Bank Routings",
    //     totalCriteraiField: 5,
    //     status: "A",
    //     createdBy: "Yogesh",
    //     createdByID: "yogeshm",
    //     createdDate: "2023-02-22T12:31:45.905+00:00",
    //     cmCriteriaDataDetails: [
    //       {
    //         id: 151,
    //         fieldName: "LCY Amount",
    //         displayName: "LCY Amount",
    //         fieldType: "Dropdown",
    //         operations: "Is Equal To,Is Not Equal To",
    //         orderID: 5,
    //         iSMandatory: "no",
    //       },
    //       {
    //         id: 152,
    //         fieldName: "Service Category",
    //         displayName: "Service Category",
    //         fieldType: "Dropdown",
    //         operations: "Is Equal To,Is Not Equal To",
    //         orderID: 4,
    //         iSMandatory: "yes",
    //       },
    //       {
    //         id: 154,
    //         fieldName: "Country",
    //         displayName: "Country",
    //         fieldType: "Dropdown",
    //         operations: "Is Equal To,Is Not Equal To",
    //         orderID: 2,
    //         iSMandatory: "yes",
    //       },
    //       {
    //         id: 153,
    //         fieldName: "Organization",
    //         displayName: "Organization",
    //         fieldType: "Dropdown",
    //         operations: "Is Equal To,Is Not Equal To",
    //         orderID: 3,
    //         iSMandatory: "yes",
    //       },
    //       {
    //         id: 155,
    //         fieldName: "Service Type",
    //         displayName: "Service Type",
    //         fieldType: "Dropdown",
    //         operations: "Is Equal To,Is Not Equal To",
    //         orderID: 1,
    //         iSMandatory: "yes",
    //       },
    //     ],
    //   },
    //   Country: [
    //     {
    //       id: 1,
    //       code: "USA",
    //       countryName: "Amarica",
    //       status: "A",
    //     },
    //     {
    //       id: 2,
    //       code: "IND",
    //       countryName: "India",
    //       status: "A",
    //     },
    //     {
    //       id: 3,
    //       code: "JPN",
    //       countryName: "Japan",
    //       status: "A",
    //     },
    //     {
    //       id: 4,
    //       code: "CHI",
    //       countryName: "Chaina",
    //       status: "A",
    //     },
    //     {
    //       id: 5,
    //       code: "PAK",
    //       countryName: "Pakistna",
    //       status: "A",
    //     },
    //     {
    //       id: 6,
    //       code: "UK",
    //       countryName: "England",
    //       status: "A",
    //     },
    //   ],
    //   mandatory: "[Country, Organization]",
    //   "Service Category": [
    //     {
    //       id: 1,
    //       code: "Bank",
    //       codeName: "Bank",
    //       status: "A",
    //     },
    //     {
    //       id: 2,
    //       code: "Cash",
    //       codeName: "Cash",
    //       status: "A",
    //     },
    //     {
    //       id: 3,
    //       code: "Utility",
    //       codeName: "Utility",
    //       status: "A",
    //     },
    //   ],
    //   "Service Type": [
    //     {
    //       id: 1,
    //       code: "NEFT",
    //       codeName: "NEFT",
    //       status: "A",
    //     },
    //     {
    //       id: 2,
    //       code: "RTGS",
    //       codeName: "RTGS",
    //       status: "A",
    //     },
    //     {
    //       id: 3,
    //       code: "IMPS",
    //       codeName: "IMPS",
    //       status: "A",
    //     },
    //     {
    //       id: 4,
    //       code: "Cash pick up",
    //       codeName: "Cash pick up",
    //       status: "A",
    //     },
    //     {
    //       id: 5,
    //       code: "A/C transfer",
    //       codeName: "A/C transfer",
    //       status: "A",
    //     },
    //   ],
    // },
    // status: "200",
  };

  cmCriteriaDataDetails: any = [];
  // this.criteriaDataDetailsJson.data.viewCriteria.cmCriteriaDataDetails;

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

  cmCriteriaMandatory = [];
  // this.criteriaDataDetailsJson.data.mandatory
  //   .replace(/["|\[|\]]/g, "")
  //   .split(", ");

  savedLcySlabs = false;
  isLcySlabsCriteria = false;

  ref: DynamicDialogRef;
  txnCriteriaRangeFormData: any;

  selectCriteriaForm: any;
  validCriteria = false;

  removeAddCriteriaListener: any;

  routeToBankNameOption = [];
  routeToServiceCategoryOption = [];
  routeToServiceTypeOption = [];
  routeId = "";

  constructor(
    private bankRoutingService: BankRoutingService,
    private activatedRoute: ActivatedRoute,
    private ngxToaster: ToastrService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private coreService: CoreService
  ) {}

  @ViewChild("addCriteriaBtn") addCriteriaBtn: ElementRef;

  ngOnInit(): void {
    this.getAddBankRouteCriteriaData();

    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.bankRoutingService.getTransactionCriteriaRange().subscribe((res) => {
      this.txnCriteriaRangeFormData = res;
      this.savedLcySlabs = !!Object.keys(this.txnCriteriaRangeFormData).length;
    });

    const params = this.activatedRoute.snapshot.params;
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];
    this.getAllTemplates();
    // this.getBanksRoutingData(this.userId);

    if (params && params.id) {
      console.log("::routeCode", params.id);
      this.getBanksRoutingForEditApi(params.id);
      this.routeId = params.id;
      // this.bankRoutingService
      //   .getPaymentModeByCriteriaId(params.id)
      //   .subscribe((response: any) => {
      //     const co =
      //       response.cmCriteriaData.cmCriteriaDataDetails[0].operations.split(
      //         ","
      //       );
      //     this.criteriaOperations = co;
      //     response.cmCriteriaData.cmCriteriaDataDetails.map((item: any) => {
      //       this.testData.push(item);
      //     });
      //   });
    }

    this.selectCriteriaForm = this.fb.group({
      criteria: new FormControl({ value: "", disabled: false }, [
        Validators.required,
      ]),
      operation: new FormControl(
        { value: "", disabled: !this.criteriaEqualsDdlOptions.length },
        [Validators.required]
      ),
      value: new FormControl(
        { value: "", disabled: !this.correspondentDdlOptions.length },
        [Validators.required]
      ),
    });
  }

  getBanksRoutingForEditApi(routeCode: any) {
    this.bankRoutingService.getBanksRoutingForEdit(routeCode).subscribe(
      (res) => {
        console.log("::editData", res);
        this.editBankRouteApiData = res;
        // Ajay code
        this.criteriaText = (res as any).data[0]["criteriaMap"].split(";");
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
          console.log("::lcyform", lcySlabForm);
        }
        // Ajay code end

        // suresh code
        this.bankRoutesData = res["data"];
        this.routeToBankNameOption = this.bankRoutesData[0].routeToBankNameOption;
        this.routeToServiceCategoryOption = this.bankRoutesData[0].routeToServiceCategoryOption;
        this.routeToServiceTypeOption = this.bankRoutesData[0].routeToServiceTypeOption;
      
        if (this.editBankRouteApiData.LCY == "Yes") {
          this.bankRoutesColumns.forEach((x) => {
            (x.field == "lcyAmountFrom" || x.field == "lcyAmountTo") &&
              (x.visible = true);
            x.field == "isCorrespondent" && (x.visible = false);
          });
        }

        // suresh code end
      },
      (err) => {
        console.log("Error in getBanksRoutingForEditApi", err);
      }
    );
  }

  getAddBankRouteCriteriaData() {
    this.coreService.displayLoadingScreen();
    this.bankRoutingService
      .getAddBankRouteCriteriaData()
      .subscribe(
        (res) => {
          this.criteriaDataDetailsJson = res;
          this.cmCriteriaDataDetails =
            this.criteriaDataDetailsJson.data.viewCriteria.cmCriteriaDataDetails;

          let crArr = [];
          this.cmCriteriaDataDetails.forEach((element) => {
            crArr.push({
              name: element.displayName,
              code: element.fieldName,
            });
          });
          this.criteriaMapDdlOptions = crArr;

          this.cmCriteriaMandatory = this.criteriaDataDetailsJson.data.mandatory
            .replace(/["|\[|\]]/g, "")
            .split(", ");
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
    let criteria =
      this.criteriaCtrl.value.name +
      " " +
      this.operationCtrl.value.code +
      " " +
      (this.criteriaCtrl.value.name == "LCY Amount"
        ? "Slab"
        : this.valueCtrl.value.name);
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
              // if (splitText.split("  ")[1] == "Any") {
              //   console.log("::any already there");
              //   let conflictingCriteria;
              //   let anyCriteria = this.criteriaText.filter((criteria) => {
              //     return criteria.includes(splitText.split("  ")[0]);
              //   });
              //   conflictingCriteria = anyCriteria.filter(
              //     (crt) => !crt.includes("Any")
              //   );
              //   if (anyCriteria.length <= 1) {
              //     console.log("::any criterias", anyCriteria);
              //     console.log("::any with one condition is added");
              //   } else {
              //     console.log(
              //       "::any with more than one condition is trying to add"
              //     );
              //     this.ngxToaster.warning(
              //       "Please delete existing criteria " +
              //         conflictingCriteria +
              //         ", then add " +
              //         criteria
              //     );
              //     this.validCriteria = false;
              //     return false;
              //   }
              // }
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
          this.checkLcySlabCriteria(criteria);
        }
      }
    } else {
      this.checkLcySlabCriteria(criteria);
    }

    console.log("::criteriaText", this.criteriaText);
  }

  checkLcySlabCriteria(criteria: any) {
    let $lcySlabsObs;
    if (this.isLcySlabsCriteria) {
      $lcySlabsObs = this.bankRoutingService
        .getTransactionCriteriaRange()
        .pipe(
          first((x) => x["txnCriteriaRange"] && x["txnCriteriaRange"].length)
        )
        .subscribe((res) => {
          console.log("::added slab to criteri arr", res);
          this.savedLcySlabs = !!Object.keys(res).length;
          if (this.savedLcySlabs) {
            if (
              !this.criteriaText.filter(
                (criteria) => criteria == "LCY Amount = Slab"
              ).length
            ) {
              this.criteriaText.push(criteria);
              this.removeAddCriteriaListener();
            }
          } else {
            console.log("No savedLcySlabs");
          }
        });
    } else {
      if ($lcySlabsObs) {
        $lcySlabsObs.unsubscribe();
      }
      this.criteriaText.push(criteria);
    }
  }

  onChange(controlId, event) {
    switch (controlId) {
      case "criteria":
        let selectdCorrespondent = this.cmCriteriaDataDetails.filter(
          (x) => event.code == x.fieldName
        );
        let operations;
        if (selectdCorrespondent[0].fieldName == "LCY Amount") {
          operations = ["Slab"];
        } else {
          operations = selectdCorrespondent[0].operations.split(",");
        }
        this.criteriaEqualsDdlOptions = [];
        this.operationCtrl.patchValue("");
        if (operations.length) {
          this.operationCtrl.enable();
          operations.forEach((element) => {
            let criteriaCode =
              element == "Is Equal To" || element == "Slab" ? "=" : "!=";
            this.criteriaEqualsDdlOptions.push({
              name: element,
              code: criteriaCode,
            });
          });
        } else {
          this.operationCtrl.disable();
        }
        let values =
          this.criteriaDataDetailsJson.data[selectdCorrespondent[0].fieldName];
        this.correspondentDdlOptions = [];
        this.valueCtrl.patchValue("");
        if (values && values.length) {
          this.valueCtrl.enable();
          this.hideValuesDropdown = false;
          values.forEach((element) => {
            this.correspondentDdlOptions.push({
              name: element.codeName ? element.codeName : element.countryName,
              code: element.code,
            });
          });
          this.correspondentDdlOptions.push({
            name: "Any",
            code: "Any",
          });
        } else {
          this.valueCtrl.disable();
          this.hideValuesDropdown = true;
        }
        break;

      case "condition":
        if (
          event.name == "Slab" &&
          !this.criteriaText.filter(
            (criteria) => criteria == "LCY Amount = Slab"
          ).length
        ) {
          console.log("::slab selected");
          this.isLcySlabsCriteria = true;
          this.removeAddCriteriaListener = this.renderer.listen(
            this.addCriteriaBtn.nativeElement,
            "click",
            (evt) => {
              this.showTransCriteriaModal();
            }
          );
        } else if (event.name == "Slab") {
          this.isLcySlabsCriteria = true;
        } else {
          if (this.removeAddCriteriaListener) {
            this.removeAddCriteriaListener();
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
      this.bankRoutingService.setTransactionCriteriaRange({});
      if (this.isLcySlabsCriteria) {
        this.removeAddCriteriaListener = this.renderer.listen(
          this.addCriteriaBtn.nativeElement,
          "click",
          (evt) => {
            this.showTransCriteriaModal();
          }
        );
      } else {
        console.log("not LCY criteria current");
      }
    }
    this.criteriaText.splice(i, 1);
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

    Object.keys(this.criteriaDataDetailsJson.data.dependance).forEach(
      (dependantCrt) => {
        if (formattedCriteriaArr.includes(dependantCrt)) {
          console.log("yes it is dependant", dependantCrt);
          if (
            formattedCriteriaArr.includes(
              this.criteriaDataDetailsJson.data.dependance[dependantCrt]
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
          this.lcySlab = slabText;
          postDataCriteria.set("lcySlab", slabText);
        }

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
          if (!res["msg"]) {
            console.log("routeBankCriteriaSearchApi resp", res);
            this.apiResponse = res;
            this.ngxToaster.success(`Criteria Successfully Applied`);
            this.getBanksRoutingData(this.userId);
          } else {
            this.ngxToaster.warning(res["msg"]);
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

    // const payload;

    const formData = new FormData();
    formData.append("userId", this.userId);
    formData.append("criteriaName", this.criteriaName);
    formData.append("criteriaMap", this.criteriaText.join(";"));
    // this.criteriaTemplatesDdlOptions.push(payload); //need  to be remove  after sit working
    this.bankRoutingService
      .currentCriteriaSaveAsTemplate(formData)
      .subscribe((response) => {
        if (
          response.msg == "Duplicate criteria, please modify existing criteria"
        ) {
          this.clickforsave = false;
          this.criteriaName = "";
          this.ngxToaster.warning(response.msg);
        } else {
          this.ngxToaster.success(response.msg);
          this.clickforsave = false;
          this.criteriaName = "";
          this.getAllTemplates();
        }
      });
  }

  getAllTemplates() {
    this.bankRoutingService.getAllCriteriaTemplates().subscribe((response) => {
      if (response.data && response.data.length) {
        this.criteriaTemplatesDdlOptions = response.data;
        this.criteriaTemplatesDdlOptions.forEach((val) => {
          val["name"] = val["criteriaName"];
          val["code"] = val["criteriaName"];
        });
      } else {
        this.ngxToaster.warning(response.msg);
      }
    });
  }

  selectCriteriaTemplate(item) {
    let selectedData = this.criteriaTemplatesDdlOptions.filter(
      (x) => x.criteriaName == item.criteriaName
    )[0];
    this.criteriaText = selectedData.criteriaMap.split(";");
    if (
      !this.criteriaText.filter((criteria) => criteria == "LCY Amount = Slab")
        .length
    ) {
      this.bankRoutingService.setTransactionCriteriaRange({});
    }
  }

  showTransCriteriaModal() {
    this.ref = this.dialogService.open(TransactionCriteriaModal, {
      width: "40%",
      contentStyle: { overflow: "auto" },
      baseZIndex: 10000,
      styleClass: "txn-criteria-modal",
      data: { txnCriteriaRange: this.txnCriteriaRangeFormData },
    });
    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.txnCriteriaRangeFormData = data;
        console.log("::addnewroute", data);
      }
    });
  }

  selectedColumn(column, row) {
    console.log("enterin select ", column, row);
    column == "routeToBankName" && (this.isSelectedRouteToBankName = true);
    if (column == "routeToServiceCategory") {
      if (!this.isSelectedRouteToBankName) {
        this.ngxToaster.warning("Please select the route to bank first");
      } else {
        this.isSelectedRouteToServiceCategory = true;
      }
    }
    if (column == "routeToServiceType") {
      let index = this.bankRoutesData.findIndex((x) => x.id == row.id);
      console.log(
        "this.bankRoutesData[index]",
        this.bankRoutesData[index]["routeToServiceType"]
      );
      // let cell = this.table.findCell(row.id, column)
      if (!this.isSelectedRouteToServiceCategory) {
        this.ngxToaster.warning("Please select the service category first");
      }
    }
  }

  getBanksRoutingData(id: string) {
    this.bankRoutesData = this.apiResponse.data;
    this.bankRoutesData.forEach((element) => {
      this.routeToBankNameOption = element.routeToBankName;
      this.routeToServiceCategoryOption = element.routeToServiceCategory;
      this.routeToServiceTypeOption = element.routeToServiceType;
      element.routeToBankName = "";
      element.routeToServiceType = "";
      element.routeToServiceCategory = "";
    });
    if (this.apiResponse.LCY == "Yes") {
      this.bankRoutesColumns.forEach((x) => {
        (x.field == "lcyAmountFrom" || x.field == "lcyAmountTo") &&
          (x.visible = true);
        x.field == "isCorrespondent" && (x.visible = false);
      });
    }
    // this.bankRoutingService
    //   .getBankRoutingData(id)
    //   .subscribe((result):any=> {
    //     if(result) {
    //       this.bankRoutesData = result["data"];
    //       this.routeToDdlOption = result["routeToBankName"].concat(result["routeBankName"]);
    //       this.serviceCategoryDdlOptions= result["routeServiceCategory"].concat(result["routeToServiceCategory"]);
    //       this.serviceTypeDdlOptions = result["routeServiceType"].concat(result["routeToServiceType"])
    //     }
    //   })
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
        element["routeDesc"] = "new g"; //ask to yogesh
        element["criteriaMap"] = this.criteriaText.join(";");
        element["lcySlab"] = this.lcySlab;
        element["lcyAmountTo"] = element.lcyAmountTo
          ? element.lcyAmountTo
          : null;
        element["lcyAmountFrom"] = element.lcyAmountFrom
          ? element.lcyAmountFrom
          : null;
        payload.push(element);
      }
    });
    console.log("Payload", { data: payload });
    setTimeout(() => {
      if (isRequiredFields) {
        this.ngxToaster.warning("Please Select required fields.");
      } else {
        this.coreService.displayLoadingScreen();
        let service;
        if(this.routeId != "") {
          service = this.bankRoutingService
          .updateRoute(this.routeId, { data: payload })
        } else {
          service = this.bankRoutingService
          .addNewRoute({ data: payload })
        }
          service.subscribe(
            (res) => {
              if (res["msg"]) {
                this.ngxToaster.success(res.msg);
                if (action == "save") {
                  this.router.navigate([`navbar/bank-routing`]);
                } else if (action == "saveAndAddNew") {
                  window.location.reload();
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
    }, 1000);
  }

  reset() {
    window.location.reload();
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }

    this.bankRoutingService.setTransactionCriteriaRange({});
  }
}
