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
import { Dropdown } from "primeng/dropdown";

@Component({
  selector: "app-addnewroute",
  templateUrl: "./addnewroute.component.html",
  styleUrls: ["./addnewroute.component.scss"],
  providers: [DialogService, MessageService],
})
export class AddnewrouteComponent2 implements OnInit {
  @ViewChild("table", { static: false }) table!: Table;
  @ViewChild("templatesDropdown") templatesDropdown: Dropdown;

  primaryColor = "var(--primary-color)";

  formName = "Bank Routings";
  applicationName = "Web Application";
  //
  appliedCriteriaData: any = [];
  appliedCriteriaDataOrg: any = [];
  appliedCriteriaCriteriaMap: any = null;
  appliedCriteriaIsDuplicate: any = null;
  appliedCriteriaDataCols: any = [];
  objectKeys = Object.keys;
  isEditMode = false;
  //
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
  isSlabControlSelected = false;
  criteriaText: any[] = [];
  criteriaCodeText: any[] = [];
  finalCriteriaCodeText: any[] = [];
  testData: any[] = [];
  criteriaSetData: any[] = [];
  criteriaOperations: any[] = [];
  saveTemplateDialogOpen = false;
  userId = "";
  criteriaName = "";
  criteriaTemplatesDdlOptions: any = [];
  criteriaMapDdlOptions = [];
  criteriaEqualsDdlOptions = [];
  correspondentDdlOptions = [];
  selectedRowColumn: {
    routeToBankName: boolean;
    routeToServiceCategory: boolean;
    routeToServiceType: boolean;
  }[] = [];

  criteriaDataDetailsJson: any = {};

  cmCriteriaDataDetails: any = [];
  cmCriteriaSlabType: any = [];

  cmCriteriaMandatory = [];

  savedSlabs = false;
  nullRange = true;
  isSlabsCriteria = false;

  ref: DynamicDialogRef;
  txnCriteriaRangeFormData: any;

  selectCriteriaForm: any;
  validCriteria = false;
  validSlabAmount = false;

  removeAddCriteriaListener: any;
  AddCriteriaClickListener: boolean = false;

  routeToBankNameOption = [];
  routeToServiceCategoryOption = [];
  routeToServiceTypeOption = [];
  groupID = "";

  $oninitSlabFormSubscription: any;
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

    this.$oninitSlabFormSubscription = this.bankRoutingService
      .getTransactionCriteriaRange()
      .subscribe((res) => {
        this.txnCriteriaRangeFormData = res;
        if (!!Object.keys(this.txnCriteriaRangeFormData).length) {
          this.txnCriteriaRangeFormData["txnCriteriaRange"].forEach((range) => {
            if (Object.values(range).filter((rng) => rng == null).length == 0) {
              this.savedSlabs = true;
            } else {
              this.savedSlabs = false;
            }
          });
        } else {
          this.savedSlabs = false;
        }
      });
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];
    this.getAllTemplates();

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

  getBanksRoutingForEditApi(groupID: any) {
    // this.criteriaCtrl.disable();
    this.isEditMode = true;
    this.appliedCriteriaData = [];
    this.appliedCriteriaDataCols = [];
    this.bankRoutingService
      .getBanksRoutingForEdit(groupID)
      .subscribe(
        (res) => {
          if (!res["msg"]) {
            this.editBankRouteApiData = res;
            console.log("edit data", res);

            this.criteriaCodeText = this.setCriteriaMap(
              this.editBankRouteApiData
            );

            this.criteriaText = this.decodeFormattedCriteria(
              this.criteriaCodeText
            );

            this.appliedCriteriaDataOrg = [...res["data"]];
            this.appliedCriteriaData = [...res["data"]];
            this.appliedCriteriaCriteriaMap = res["criteriaMap"];
            this.appliedCriteriaDataCols = [...this.getColumns(res["column"])];
          } else {
            this.ngxToaster.warning(res["msg"]);
            this.appliedCriteriaData = [];
            this.appliedCriteriaDataCols = [];
          }

          // Ajay code
          // if ((res as any).data[0]["criteriaMap"]) {
          //   this.criteriaText = (res as any).data[0]["criteriaMap"].split(";");
          // }
          // let lcySlabForm = {};
          // let lcySlabArr = [];
          // if (res["LCY"] == "Yes") {
          //   (res as any).data[0]["lcySlab"].split("#").forEach((rngTxt) => {
          //     let fromVal = rngTxt.split("::")[0].split(":")[1];
          //     let toVal = rngTxt.split("::")[1].split(":")[1];
          //     lcySlabArr.push({
          //       from: +fromVal,
          //       to: +toVal,
          //     });
          //   });
          //   lcySlabForm = {
          //     txnCriteriaRange: lcySlabArr,
          //   };

          //   this.bankRoutingService.setTransactionCriteriaRange(lcySlabForm);
          // }
          // // Ajay code end

          // // suresh code
          // this.bankRoutesData = res["data"];
          // if (this.editBankRouteApiData.LCY == "Yes") {
          //   this.bankRoutesColumns.forEach((x) => {
          //     (x.field == "lcyAmountFrom" || x.field == "lcyAmountTo") &&
          //       (x.visible = true);
          //   });
          // } else {
          //   this.bankRoutesColumns.forEach((x) => {
          //     (x.field == "lcyAmountFrom" || x.field == "lcyAmountTo") &&
          //       (x.visible = false);
          //   });
          // }

          // suresh code end
        },
        (err) => {
          console.log("Error in getBanksRoutingForEditApi", err);
        }
      )
      .add(() => {
        this.coreService.removeLoadingScreen();
      });
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
          this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails.forEach(
            (data) => {
              if (data["criteriaType"] == "Slab") {
                this.cmCriteriaSlabType.push(data["displayName"]);
              }
            }
          );
          this.cmCriteriaDataDetails =
            this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails;

          let crArr = [];
          this.criteriaMapDdlOptions = crArr;
          console.log(this.criteriaDataDetailsJson.data);
          this.cmCriteriaMandatory = this.criteriaDataDetailsJson.data.mandatory
            .replace(/["|\[|\]]/g, "")
            .split(", ");
          console.log(" this.cmCriteriaMandatory", this.cmCriteriaMandatory);

          console.log(" Slabs fields", this.cmCriteriaSlabType);
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
          const params = this.activatedRoute.snapshot.params;
          if (params && params.id) {
            this.mode = "edit";
            this.getBanksRoutingForEditApi(params.id);
            this.groupID = params.id;
          } else {
            this.coreService.removeLoadingScreen();
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log("Error in Initiating dropdown values", err);
        }
      );
  }

  // getAddBankRouteCriteriaData() {
  //   this.coreService.displayLoadingScreen();
  //   this.bankRoutingService
  //     .getAddBankRouteCriteriaData()
  //     .subscribe(
  //       (res) => {
  //         this.criteriaDataDetailsJson = res;
  //         this.cmCriteriaDataDetails =
  //           this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails;

  //         let crArr = [];
  //         this.criteriaMapDdlOptions = crArr;
  //         console.log(this.criteriaDataDetailsJson.data);
  //         this.cmCriteriaMandatory = this.criteriaDataDetailsJson.data.mandatory
  //           .replace(/["|\[|\]]/g, "")
  //           .split(", ");
  //         console.log(" this.cmCriteriaMandatory", this.cmCriteriaMandatory);
  //         console.log(
  //           " Dependance",
  //           this.criteriaDataDetailsJson.data.dependance
  //         );
  //         this.cmCriteriaDataDetails.forEach((element) => {
  //           let isMandatory = false;
  //           let isDependent = false;
  //           let dependencyList = "";
  //           let dependenceObj = this.criteriaDataDetailsJson.data.dependance;
  //           if (
  //             this.cmCriteriaMandatory &&
  //             this.cmCriteriaMandatory.indexOf(element.fieldName) >= 0
  //           ) {
  //             isMandatory = true;
  //           }
  //           console.log("dependenceObj", dependenceObj[element.fieldName]);
  //           if (
  //             Object.keys(dependenceObj).length &&
  //             dependenceObj[element.fieldName] &&
  //             dependenceObj[element.fieldName] != "null"
  //           ) {
  //             isDependent = true;
  //             dependencyList = dependenceObj[element.fieldName];
  //           } else {
  //             this.independantCriteriaArr.push(element.displayName);
  //           }

  //           crArr.push({
  //             name: element.displayName,
  //             code: element.fieldName,
  //             isMandatory: isMandatory,
  //             isDependent: isDependent,
  //             dependencyList: dependencyList,
  //           });
  //         });
  //       },
  //       (err) => {
  //         console.log("::error loading AddBankRouteCriteriaData", err);
  //       }
  //     )
  //     .add(() => {
  //       this.coreService.removeLoadingScreen();
  //     });
  // }

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
    if (this.cmCriteriaSlabType.includes(this.criteriaCtrl.value.name)) {
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
      this.validCriteria = true;
      this.validSlabAmount = true;
      let splitdata;
      if (criteria.includes("!=")) {
        splitdata = criteria.replace(/[!=]/g, "");
      } else if (criteria.includes("<=")) {
        splitdata = criteria.replace(/[<=]/g, "");
      } else if (criteria.includes(">=")) {
        splitdata = criteria.replace(/[>=]/g, "");
      } else if (criteria.includes("<")) {
        splitdata = criteria.replace(/[<]/g, "");
      } else if (criteria.includes(">")) {
        splitdata = criteria.replace(/[>]/g, "");
      } else {
        splitdata = criteria.replace(/[=]/g, "");
      }

      if (
        criteria.includes("<=") ||
        criteria.includes(">=") ||
        criteria.includes("<") ||
        criteria.includes(">")
      ) {
        this.validCriteria = true;
        this.validSlabAmount = true;
        this.criteriaText.every((element) => {
          let splitText;
          if (criteria.includes("!=")) {
            splitText = element.replace(/[!=]/g, "");
          } else if (element.includes("<=")) {
            splitText = element.replace(/[<=]/g, "");
          } else if (element.includes(">=")) {
            splitText = element.replace(/[>=]/g, "");
          } else if (element.includes("<")) {
            splitText = element.replace(/[<]/g, "");
          } else if (element.includes(">")) {
            splitText = element.replace(/[>]/g, "");
          } else {
            splitText = element.replace(/[=]/g, "");
          }

          console.log("greater less condition", splitText);
          if (
            splitText.split("  ")[0] == splitdata.split("  ")[0] &&
            splitdata.split("  ")[1] == "Slab"
          ) {
            console.log("greater less condition slab");
            this.ngxToaster.warning(
              "Please delete existing criteria " +
                element +
                ", then add " +
                criteria
            );
            this.validCriteria = false;
            this.validSlabAmount = false;

            return false;
          } else if (
            splitText.split("  ")[0] == splitdata.split("  ")[0] &&
            splitText.split("  ")[1] == "Slab"
          ) {
            console.log("greater less condition not slab but slab present");
            this.ngxToaster.warning(
              "Please delete existing criteria " +
                element +
                ", then add " +
                criteria
            );
            this.validCriteria = false;
            this.validSlabAmount = false;
            return false;
          } else if (
            splitText.split("  ")[0] == splitdata.split("  ")[0] &&
            this.cmCriteriaSlabType.includes(splitdata.split("  ")[0])
          ) {
            console.log(
              "greater less condition not slab but slab not present",
              element
            );
            this.validCriteria = true;
            return true;
          }
        });
      } else {
        let isCurrentCriteriaNotEqualCondition = false;
        let isCurrentCriteriaEqualCondition = false;

        if (criteria.includes("!=")) {
          isCurrentCriteriaNotEqualCondition = true;
        } else {
          isCurrentCriteriaEqualCondition = true;
        }

        this.criteriaText.every((element) => {
          let splitText;
          if (element.includes("!=")) {
            splitText = element.replace(/[!=]/g, "");
          } else if (element.includes("<=")) {
            splitText = element.replace(/[<=]/g, "");
          } else if (element.includes(">=")) {
            splitText = element.replace(/[>=]/g, "");
          } else if (element.includes("<")) {
            splitText = element.replace(/[<]/g, "");
          } else if (element.includes(">")) {
            splitText = element.replace(/[>]/g, "");
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
              if (
                splitdata.split("  ")[1] == "Slab" &&
                this.cmCriteriaSlabType.includes(splitdata.split("  ")[0])
              ) {
                console.log("adding one slab but lcy other than slab present ");
                this.ngxToaster.warning(
                  "Please delete existing criteria " +
                    element +
                    ", then add " +
                    criteria
                );
                this.validCriteria = false;
                return false;
              }

              let isAlreadyCriteriaNotEqualCondition = false;
              let isAlreadyCriteriaEqualCondition = false;

              if (element.includes("!=")) {
                isAlreadyCriteriaNotEqualCondition = true;
              } else if (element.includes(" = ")) {
                isAlreadyCriteriaEqualCondition = true;
              }

              if (
                isCurrentCriteriaEqualCondition &&
                isAlreadyCriteriaEqualCondition
              ) {
                console.log("adding one more equal crit ");
                this.ngxToaster.warning(
                  "Please delete existing criteria " +
                    element +
                    ", then add " +
                    criteria
                );
                this.validCriteria = false;
                return false;
              } else if (
                isAlreadyCriteriaEqualCondition ==
                  !isCurrentCriteriaEqualCondition &&
                isAlreadyCriteriaNotEqualCondition ==
                  !isCurrentCriteriaNotEqualCondition
              ) {
                if (
                  this.cmCriteriaSlabType.includes(splitdata.split("  ")[0])
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
                  console.log("::new validation passed");
                }
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
      }
      if (this.validCriteria) {
        this.checkSlabCriteria(criteria, criteriaCode);
      }
    } else {
      this.checkSlabCriteria(criteria, criteriaCode);
    }
  }

  checkSlabCriteria(criteria: any, criteriaCode: any) {
    if (this.isSlabsCriteria) {
      if (this.$oninitSlabFormSubscription) {
        this.$oninitSlabFormSubscription.unsubscribe();
      }

      this.bankRoutingService.getTransactionCriteriaRange().subscribe((res) => {
        console.log("::::getTransactionRange called in checking", res);
        this.txnCriteriaRangeFormData = res;

        if (!!Object.keys(res).length) {
          console.log("rng data present");
          res["txnCriteriaRange"].forEach((range) => {
            if (Object.values(range).filter((rng) => rng == null).length == 0) {
              console.log("rng data present not null");
              this.savedSlabs = true;
            } else {
              console.log("rng data present null");
              this.savedSlabs = false;
            }
          });
        } else {
          console.log("rng data absent");
          this.savedSlabs = false;
        }

        if (this.savedSlabs) {
          console.log("lcy present");
          if (
            !this.criteriaText.filter(
              (criteria) => criteria == `${this.cmCriteriaSlabType[0]} = Slab`
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
          // this.ngxToaster.warning(
          //   `${event["name"]} is already added. Select any other Criteria.`
          // );
          // return false;
          console.log("Dependant, same criteria present");
          return true;
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
        // this.ngxToaster.warning(
        //   `${event["name"]} is already added. Select any other Criteria.`
        // );
        // return false;
        console.log("Indepandant, same criteria present");
        return true;
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
    if (this.AddCriteriaClickListener) {
      this.removeAddCriteriaListener();
      this.AddCriteriaClickListener = false;
    }
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
        if (
          this.cmCriteriaSlabType.includes(selectedCorrespondent[0].fieldName)
        ) {
          this.isSlabControlSelected = true;
          console.log("LCY control selected", this.isSlabControlSelected);
          operations = selectedCorrespondent[0].operations.split(",");
          this.valueCtrl.reset();
          this.valueCtrl.disable();
          this.correspondentDdlOptions = [];
        } else {
          console.log(
            "other control selected, is LCY",
            this.isSlabControlSelected
          );
          this.isSlabControlSelected = false;
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
        break;

      case "condition":
        this.hideValuesDropdown = false;
        this.showValueInput = false;
        if (
          event.name == "Slab" &&
          !this.criteriaText.filter(
            (criteria) => criteria == `${this.cmCriteriaSlabType[0]} = Slab`
          ).length
        ) {
          if (
            event.name == "Slab" &&
            this.criteriaText.filter((criteria) => {
              let splitText;
              if (criteria.includes("!=")) {
                splitText = criteria.replace(/[!=]/g, "");
              } else if (criteria.includes("<=")) {
                splitText = criteria.replace(/[<=]/g, "");
              } else if (criteria.includes(">=")) {
                splitText = criteria.replace(/[>=]/g, "");
              } else if (criteria.includes("<")) {
                splitText = criteria.replace(/[<]/g, "");
              } else if (criteria.includes(">")) {
                splitText = criteria.replace(/[>]/g, "");
              } else {
                splitText = criteria.replace(/[=]/g, "");
              }
              return this.cmCriteriaSlabType.includes(splitText.split("  ")[0]);
            }).length
          ) {
            console.log("selected slab but already LCY that is not slab");
            this.hideValuesDropdown = true;
            if (this.AddCriteriaClickListener) {
              this.removeAddCriteriaListener();
              this.AddCriteriaClickListener = false;
            }
            this.isSlabsCriteria = true;
          } else {
            this.isSlabsCriteria = true;
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
          }
        } else if (event.name == "Slab") {
          console.log("slab but already LCY");
          console.log("listner", this.AddCriteriaClickListener);
          if (this.AddCriteriaClickListener) {
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          }
          this.isSlabsCriteria = true;
          this.valueCtrl.disable();
          this.hideValuesDropdown = true;
          this.showValueInput = false;
        } else if (this.isSlabControlSelected) {
          console.log("Insert Input Text for Value");
          this.valueCtrl.enable();
          this.hideValuesDropdown = true;
          this.showValueInput = true;
          if (this.AddCriteriaClickListener) {
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          }
          this.isSlabsCriteria = false;
        } else {
          this.hideValuesDropdown = false;
          if (this.AddCriteriaClickListener) {
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          }
          this.isSlabsCriteria = false;
        }
        break;
      default:
        break;
    }
  }

  ondeletecriteria(i: any, criteria: any) {
    if (this.AddCriteriaClickListener) {
      this.removeAddCriteriaListener();
      this.AddCriteriaClickListener = false;
    }
    if (criteria == `${this.cmCriteriaSlabType[0]} = Slab`) {
      this.savedSlabs = false;

      this.bankRoutingService.setTransactionCriteriaRange({
        txnCriteriaRange: [{ from: null, to: null }],
      });
    }

    let arr2 = [...this.criteriaText];
    let arr1 = [...this.independantCriteriaArr];
    let independantIndexes = [];

    arr2.forEach((arr2Item, i) => {
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

  saveCriteriaTemplateLink() {
    if (this.criteriaText.length) {
      this.saveTemplateDialogOpen = true;
    } else {
      this.ngxToaster.warning("Please add criteria.");
    }
  }

  checkMandatoryCondition(formattedCriteriaArr: any) {
    console.log(formattedCriteriaArr);
    if (
      this.cmCriteriaMandatory.every((r) => formattedCriteriaArr.includes(r))
    ) {
      let finalFormattedCriteriaObj = this.createFormattedCriteriaMap();
      return finalFormattedCriteriaObj;
    } else {
      this.ngxToaster.warning(
        `Please add all mandatory criteria for applying the criteria. Mandatory criteria are ${this.cmCriteriaMandatory.join(
          ", "
        )}`
      );
      return false;
    }
  }

  createFormattedCriteriaMap() {
    console.log(this.finalCriteriaCodeText);
    let criteriaObj = {};
    criteriaObj["slabs"] = null;
    criteriaObj["lcyOpr"] = null;
    if (
      this.finalCriteriaCodeText.filter(
        (criteria) => criteria == `${this.cmCriteriaSlabType[0]} = Slab`
      ).length
    ) {
      criteriaObj["slabs"] = this.txnCriteriaRangeFormData["txnCriteriaRange"];
    } else if (
      this.finalCriteriaCodeText.filter((criteria) => {
        return (
          criteria.includes(this.cmCriteriaSlabType[0]) &&
          !(criteria == `${this.cmCriteriaSlabType[0]} = Slab`)
        );
      }).length
    ) {
      let lcyOprArr = [];
      this.finalCriteriaCodeText.forEach((criteria) => {
        if (
          criteria.includes(this.cmCriteriaSlabType[0]) &&
          !(criteria == `${this.cmCriteriaSlabType[0]} = Slab`)
        ) {
          lcyOprArr.push(criteria);
        }
      });
      if (lcyOprArr.length) {
        criteriaObj["lcyOpr"] = lcyOprArr.join(";");
      }
    }

    criteriaObj["criteriaMap"] = this.finalCriteriaCodeText
      .filter((criteria) => {
        return !criteria.includes(this.cmCriteriaSlabType[0]);
      })
      .join(";");

    return criteriaObj;
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

  createFormattedCriteria() {
    this.finalCriteriaCodeText = [];
    let formattedCriteriaArr = this.criteriaText.map((crt) => {
      let formatCrt;
      let opr;
      if (crt.includes("!=")) {
        formatCrt = crt.replace(/[!=]/g, "");
        opr = "!=";
      } else if (crt.includes(">=")) {
        formatCrt = crt.replace(/[>=]/g, "");
        opr = ">=";
      } else if (crt.includes("<=")) {
        formatCrt = crt.replace(/[<=]/g, "");
        opr = "<=";
      } else if (crt.includes("<")) {
        formatCrt = crt.replace(/[<]/g, "");
        opr = "<";
      } else if (crt.includes(">")) {
        formatCrt = crt.replace(/[>]/g, "");
        opr = ">";
      } else {
        formatCrt = crt.replace(/[=]/g, "");
        opr = "=";
      }

      let formatCodeText;
      if (
        Object.keys(this.criteriaMasterData).includes(formatCrt.split("  ")[0])
      ) {
        Object.keys(this.criteriaMasterData).forEach((field) => {
          if (field == formatCrt.split("  ")[0]) {
            this.criteriaMasterData[field].forEach((val) => {
              if (formatCrt.split("  ")[1] == "Any") {
                formatCodeText =
                  formatCrt.split("  ")[0] +
                  " " +
                  opr +
                  " " +
                  formatCrt.split("  ")[1];
              } else if (val["codeName"] == formatCrt.split("  ")[1]) {
                formatCodeText =
                  formatCrt.split("  ")[0] + " " + opr + " " + val["code"];
              }
            });
          }
        });
      } else {
        formatCodeText =
          formatCrt.split("  ")[0] + " " + opr + " " + formatCrt.split("  ")[1];
      }
      if (formatCodeText) {
        this.finalCriteriaCodeText.push(formatCodeText);
      }
      return formatCrt.split("  ")[0];
    });

    return formattedCriteriaArr;
  }

  decodeFormattedCriteria(criteriaCodeText: any) {
    let decodedFormattedCriteriaArr = criteriaCodeText.map((crt) => {
      let formatCrt;
      let opr;
      if (crt.includes("!=")) {
        formatCrt = crt.replace(/[!=]/g, "");
        opr = "!=";
      } else if (crt.includes(">=")) {
        formatCrt = crt.replace(/[>=]/g, "");
        opr = ">=";
      } else if (crt.includes("<=")) {
        formatCrt = crt.replace(/[<=]/g, "");
        opr = "<=";
      } else if (crt.includes("<")) {
        formatCrt = crt.replace(/[<]/g, "");
        opr = "<";
      } else if (crt.includes(">")) {
        formatCrt = crt.replace(/[>]/g, "");
        opr = ">";
      } else {
        formatCrt = crt.replace(/[=]/g, "");
        opr = "=";
      }

      let decodeCriteriaText;
      if (
        Object.keys(this.criteriaMasterData).includes(formatCrt.split("  ")[0])
      ) {
        Object.keys(this.criteriaMasterData).forEach((field) => {
          if (field == formatCrt.split("  ")[0]) {
            this.criteriaMasterData[field].forEach((val) => {
              if (formatCrt.split("  ")[1] == "Any") {
                decodeCriteriaText =
                  formatCrt.split("  ")[0] +
                  " " +
                  opr +
                  " " +
                  formatCrt.split("  ")[1];
              } else if (val["code"] == formatCrt.split("  ")[1]) {
                decodeCriteriaText =
                  formatCrt.split("  ")[0] + " " + opr + " " + val["codeName"];
              }
            });
          }
        });
      } else {
        decodeCriteriaText =
          formatCrt.split("  ")[0] + " " + opr + " " + formatCrt.split("  ")[1];
      }
      // if (decodeCriteriaText) {
      //   this.finalCriteriaCodeText.push(decodeCriteriaText);
      // }
      return decodeCriteriaText;
    });
    return decodedFormattedCriteriaArr;
  }

  applyCriteria() {
    this.resetCriteriaDropdowns();

    // this.finalCriteriaCodeText = [];
    // let formattedCriteriaArr = this.criteriaText.map((crt) => {
    //   let formatCrt;
    //   let opr;
    //   if (crt.includes("!=")) {
    //     formatCrt = crt.replace(/[!=]/g, "");
    //     opr = "!=";
    //   } else if (crt.includes(">=")) {
    //     formatCrt = crt.replace(/[>=]/g, "");
    //     opr = ">=";
    //   } else if (crt.includes("<=")) {
    //     formatCrt = crt.replace(/[<=]/g, "");
    //     opr = "<=";
    //   } else if (crt.includes("<")) {
    //     formatCrt = crt.replace(/[<]/g, "");
    //     opr = "<";
    //   } else if (crt.includes(">")) {
    //     formatCrt = crt.replace(/[>]/g, "");
    //     opr = ">";
    //   } else {
    //     formatCrt = crt.replace(/[=]/g, "");
    //     opr = "=";
    //   }

    //   let formatCodeText;
    //   if (
    //     Object.keys(this.criteriaMasterData).includes(formatCrt.split("  ")[0])
    //   ) {
    //     Object.keys(this.criteriaMasterData).forEach((field) => {
    //       if (field == formatCrt.split("  ")[0]) {
    //         this.criteriaMasterData[field].forEach((val) => {
    //           if (val["codeName"] == formatCrt.split("  ")[1]) {
    //             formatCodeText =
    //               formatCrt.split("  ")[0] + " " + opr + " " + val["code"];
    //           }
    //         });
    //       }
    //     });
    //   } else {
    //     formatCodeText =
    //       formatCrt.split("  ")[0] + " " + opr + " " + formatCrt.split("  ")[1];
    //   }
    //   if (formatCodeText) {
    //     this.finalCriteriaCodeText.push(formatCodeText);
    //   }
    //   return formatCrt.split("  ")[0];
    // });

    let formattedCriteriaArr = this.createFormattedCriteria();

    console.log("::: criteriaMasterData", this.criteriaMasterData);
    console.log("::: formattedCriteriaArr", formattedCriteriaArr);
    console.log("::: criteriaText", this.criteriaText);
    console.log("::: finalCriteriaCodeText", this.finalCriteriaCodeText);

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
        let lcyOpr = null;
        let NEWcriteriaMap = null;

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
          NEWcriteriaMap = criteriaMap + "&&&&" + slabText;
        } else if (finalCriteriaObj.lcyOpr) {
          lcyOpr = finalCriteriaObj.lcyOpr;
          NEWcriteriaMap = criteriaMap + "&&&&" + lcyOpr;
        } else {
          NEWcriteriaMap = criteriaMap;
        }

        // postDataCriteria.append(
        //   "criteriaMap",
        //   "Country = IND;Organization = SBI;Currency = Rupee;Service Category = Bank;Service Type = NEFT;State = MH;City = MUM;Branch = B1&&&&LCY Amount = 20;LCY Amount != 200"
        // );
        // postDataCriteria.append(
        //   "criteriaMap",
        //   "Country = IND;Organization = SBI;Currency = Rupee;Service Category = Bank;Service Type = NEFT;State = MH;City = MUM;Branch = B1&&&&from:1::to:5#from:6::to:8#from:9::to:10"
        // );
        postDataCriteria.append("criteriaMap", NEWcriteriaMap);
        postDataCriteria.append("userId", this.userId);

        // console.log("::: criteriaMap", criteriaMap);
        // console.log("::: lcySlab", slabText);
        // console.log("::: lcy operations", lcyOpr);
        // console.log("::: NEWcriteriaMap", NEWcriteriaMap);

        // this.lcySlab = slabText;
        //    // postDataCriteria.set("lcySlab", slabText);
        this.routeBankCriteriaSearchApi(postDataCriteria);
      } else {
        this.appliedCriteriaData = [];
      }
    }
  }

  routeBankCriteriaSearchApi(formData: any) {
    this.appliedCriteriaData = [];
    this.appliedCriteriaDataCols = [];
    this.coreService.displayLoadingScreen();
    this.bankRoutingService
      .postRouteBankCriteriaSearch(formData)
      .subscribe(
        (res) => {
          console.log("criteriasearch DATA", res);
          if (!res["msg"]) {
            if (!res["duplicate"]) {
              this.appliedCriteriaDataOrg = [...res["data"]];
              this.appliedCriteriaData = [...res["data"]];
              this.appliedCriteriaCriteriaMap = res["criteriaMap"];
              this.appliedCriteriaIsDuplicate = res["duplicate"];
              this.appliedCriteriaDataCols = [
                ...this.getColumns(res["column"]),
              ];
              console.log(":::cols", this.appliedCriteriaDataCols);
              this.ngxToaster.success(`Criteria Applied Successfully`);
              // this.apiResponse = res;
              // this.getBanksRoutingData(this.userId);
            } else {
              this.appliedCriteriaData = [];
              this.appliedCriteriaCriteriaMap = null;
              this.appliedCriteriaIsDuplicate = null;
              this.appliedCriteriaDataCols = [];
              this.ngxToaster.warning("Applied criteria already exists.");
            }
          } else {
            this.ngxToaster.warning(res["msg"]);
            this.appliedCriteriaData = [];
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

  getColumns(colData: any) {
    let tableCols = [];
    for (const [key, value] of Object.entries(colData)) {
      let stringType = false;
      let selectType = false;
      let formatVal = "";
      if ((value as string).includes("::")) {
        formatVal = (value as string).split("::")[0];
        stringType = false;
        selectType =
          (value as string).split("::")[1] == "select" ? true : false;
      } else {
        formatVal = value as string;
        stringType = true;
        selectType = false;
      }
      let tableCol = {
        field: formatVal,
        header: key,
        isString: stringType,
        isSelect: selectType,
        maxWidth: "15%",
      };
      tableCols.push(tableCol);
    }
    return tableCols;
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
            // val["lcySlab"] = val["lcySlab"];
          });
        } else {
          // this.ngxToaster.warning(response.msg);
          console.log(response.msg);
        }
      });
  }

  saveCriteriaAsTemplate() {
    if (this.criteriaName == "") {
      this.ngxToaster.warning("Name of Criteria Template cannot be Empty");
      return;
    }

    let formattedCriteriaArr = this.createFormattedCriteria();
    console.log("::: finalCriteriaCodeText", this.finalCriteriaCodeText);
    let finalCriteriaMapObj: any = this.createFormattedCriteriaMap();

    console.log(finalCriteriaMapObj);

    let criteriaMap = finalCriteriaMapObj.criteriaMap;
    let slabText = null;
    let lcyOpr = null;
    let NEWcriteriaMap = null;
    this.lcySlab = null;

    if (finalCriteriaMapObj.slabs) {
      let slabs = finalCriteriaMapObj.slabs;
      let slabArr = [];
      slabs.forEach((slab) => {
        let rngArr = [];
        Object.entries(slab).forEach((rng) => {
          rngArr.push(rng.join(":"));
        });
        slabArr.push(rngArr.join("::"));
      });
      slabText = slabArr.join("#");
      NEWcriteriaMap = criteriaMap + "&&&&" + slabText;
      this.lcySlab = this.cmCriteriaSlabType[0];
    } else if (finalCriteriaMapObj.lcyOpr) {
      lcyOpr = finalCriteriaMapObj.lcyOpr;
      NEWcriteriaMap = criteriaMap + "&&&&" + lcyOpr;
    } else {
      NEWcriteriaMap = criteriaMap;
    }

    const formData = new FormData();
    formData.append("userId", this.userId);
    formData.append("criteriaName", this.criteriaName);
    formData.append("criteriaMap", NEWcriteriaMap);

    console.log("userId", this.userId);
    console.log("criteriaName", this.criteriaName);
    console.log("criteriaMap", NEWcriteriaMap);

    formData.append("lcySlab", this.lcySlab);

    this.coreService.displayLoadingScreen();
    this.bankRoutingService.currentCriteriaSaveAsTemplate(formData).subscribe(
      (response) => {
        this.coreService.removeLoadingScreen();
        if (response.msg == "Criteria Template already exists.") {
          this.saveTemplateDialogOpen = false;
          this.criteriaName = "";
          this.ngxToaster.warning(response.msg);
        } else {
          this.selectedTemplate = this.criteriaName;
          this.ngxToaster.success(response.msg);
          this.saveTemplateDialogOpen = false;
          this.criteriaName = "";
          this.getAllTemplates();
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        console.log(":: Error in saving criteria template", err);
      }
    );
  }

  selectCriteriaTemplate(item: any) {
    this.resetCriteriaDropdowns();
    console.log("::selectedItem", item);
    let selectedData: CriteriaTemplateData =
      this.criteriaTemplatesDdlOptions.filter((x: { criteriaName: any }) => {
        return x.criteriaName == item.criteriaName;
      })[0];

    this.criteriaCodeText = this.setCriteriaMap(selectedData);

    this.criteriaText = this.decodeFormattedCriteria(this.criteriaCodeText);
  }

  setCriteriaMap(criteriaData: any) {
    let criteriaMapFirstSplit = null;
    let criteriaMapSecSplit = null;

    if (criteriaData["criteriaMap"].includes("&&&&")) {
      criteriaMapFirstSplit = criteriaData["criteriaMap"].split("&&&&")[0];
      criteriaMapSecSplit = criteriaData["criteriaMap"].split("&&&&")[1];

      if (criteriaMapSecSplit.includes("from:")) {
        let lcySlabForm = {};
        let lcySlabArr = [];
        criteriaMapSecSplit.split("#").forEach((rngTxt) => {
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

        criteriaMapFirstSplit += `;${criteriaData["lcySlab"]} = Slab`;
      } else {
        criteriaMapFirstSplit += `;${criteriaMapSecSplit}`;
      }
    } else {
      criteriaMapFirstSplit = criteriaData["criteriaMap"];

      this.bankRoutingService.setTransactionCriteriaRange({
        txnCriteriaRange: [{ from: null, to: null }],
      });
    }

    return criteriaMapFirstSplit.split(";");
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

  selectedColumn(column, value, index) {
    console.log(column, value, index);
    let selectedColField = column + "Option";
    this.appliedCriteriaData[index][selectedColField] = value["codeName"];

    // if (!this.selectedRowColumn[index]) {
    //   let item = {
    //     routeToBankName: false,
    //     routeToServiceCategory: false,
    //     routeToServiceType: false,
    //   };
    //   this.selectedRowColumn.splice(index, 0, item);
    // }
    // switch (column) {
    //   case "routeToBankName":
    //     this.mode == "add" &&
    //       (this.selectedRowColumn[index].routeToBankName = true);
    //     // this.appliedCriteriaData[index]["routeToServiceCategory"] = "";
    //     break;
    //   case "routeToServiceCategory":
    //     if (this.mode == "add") {
    //       // this.appliedCriteriaData[index]["routeToServiceType"] = "";
    //       if (!this.selectedRowColumn[index].routeToBankName) {
    //         this.ngxToaster.warning("Please select the route to bank first");
    //         this.selectedRowColumn[index].routeToServiceCategory = false;
    //       } else {
    //         this.selectedRowColumn[index].routeToServiceCategory = true;
    //       }
    //     }
    //     break;
    //   case "routeToServiceType":
    //     if (this.mode == "add") {
    //       if (!this.selectedRowColumn[index].routeToServiceCategory) {
    //         this.ngxToaster.warning("Please select the service category first");
    //         this.selectedRowColumn[index].routeToServiceType = false;
    //       } else {
    //         this.selectedRowColumn[index].routeToServiceType = true;
    //       }
    //     }

    //     break;
    //   default:
    //     break;
    // }
  }

  // getBanksRoutingData(id: string) {
  //   this.bankRoutesData = this.apiResponse.data;
  //   this.bankRoutesData.forEach((element) => {
  //     element.routeToBankNameOption = element.routeToBankName;
  //     element.routeToServiceCategoryOption = element.routeToServiceCategory;
  //     element.routeToServiceTypeOption = element.routeToServiceType;
  //     element.routeToBankName = "";
  //     element.routeToServiceType = "";
  //     element.routeToServiceCategory = "";
  //     this.selectedRowColumn.push({
  //       routeToBank: false,
  //       routeToServiceCategory: false,
  //       routeToServiceType: false,
  //     });
  //   });
  //   if (this.apiResponse.LCY == "Yes") {
  //     this.bankRoutesColumns.forEach((x) => {
  //       (x.field == "lcyAmountFrom" || x.field == "lcyAmountTo") &&
  //         (x.visible = true);
  //     });
  //   } else {
  //     this.bankRoutesColumns.forEach((x) => {
  //       (x.field == "lcyAmountFrom" || x.field == "lcyAmountTo") &&
  //         (x.visible = false);
  //     });
  //   }
  // }

  saveAddNewRoute(action) {
    this.coreService.displayLoadingScreen();
    let isRequiredFields = false;
    this.appliedCriteriaData.forEach((element) => {
      // if (
      //   element.routeToBankName == "" ||
      //   element.routeToServiceCategory == "" ||
      //   element.routeToServiceType == ""
      // ) {
      //   isRequiredFields = true;
      // } else {
      //   element["userId"] = this.userId;
      //   element["routeDesc"] =
      //     "Based on the critetria selected banks will be routed to preferred routing bank";
      //   element["lcyAmountTo"] = element.lcyAmountTo
      //     ? element.lcyAmountTo
      //     : null;
      //   element["lcyAmountFrom"] = element.lcyAmountFrom
      //     ? element.lcyAmountFrom
      //     : null;
      //   payload.push(element);
      // }
      function isNullValue(arr) {
        return arr.some((el) => el == null);
      }
      console.log("::::", element);
      if (isNullValue(Object.values(element))) {
        isRequiredFields = true;
      }
    });

    if (isRequiredFields) {
      this.coreService.removeLoadingScreen();
      this.ngxToaster.warning("Please Select required fields.");
    } else {
      let service;
      if (this.groupID != "") {
        let data = {
          data: this.appliedCriteriaData,
          duplicate: this.appliedCriteriaIsDuplicate,
          criteriaMap: this.appliedCriteriaCriteriaMap,
          groupID: this.groupID,
        };
        service = this.bankRoutingService.updateRoute(this.userId, data);
        console.log("EDIT MODE - UPDATE CRITERIA SERVICE");
      } else {
        let data = {
          data: this.appliedCriteriaData,
          duplicate: this.appliedCriteriaIsDuplicate,
          criteriaMap: this.appliedCriteriaCriteriaMap,
        };
        service = this.bankRoutingService.addNewRoute(data);
      }

      if (service) {
        service.subscribe(
          (res) => {
            if (res["msg"]) {
              this.ngxToaster.success(res.msg);
              if (action == "save") {
                this.router.navigate([`navbar/bank-routing`]);
              } else if (action == "saveAndAddNew") {
                this.router.navigate([`navbar/bank-routing/addnewroute`]);
                this.reset();
                this.coreService.removeLoadingScreen();
              }
            }
          },
          (err) => {
            this.coreService.removeLoadingScreen();
            console.log("error in saveAddNewRoute", err);
          }
        );
      }
    }

    // if (
    //   this.bankRoutesData[0]["criteriaMap"] &&
    //   this.checkArrSimilarity(
    //     this.criteriaText,
    //     this.bankRoutesData[0]["criteriaMap"].split(";")
    //   )
    // ) {
    //   if (
    //     !this.bankRoutesData[0]["lcySlab"] ||
    //     this.bankRoutesData[0]["lcySlab"] == "null" ||
    //     this.getSlabCriteriaText(
    //       this.txnCriteriaRangeFormData["txnCriteriaRange"]
    //     ) == this.bankRoutesData[0]["lcySlab"]
    //   ) {
    //     console.log("Payload", { data: payload });
    //     if (isRequiredFields) {
    //       this.ngxToaster.warning("Please Select required fields.");
    //     } else {
    //       this.coreService.displayLoadingScreen();
    //       let service;
    //       if (this.routeId != "") {
    //         service = this.bankRoutingService.updateRoute(
    //           this.routeId,
    //           this.userId,
    //           {
    //             data: payload,
    //           }
    //         );
    //       } else {
    //         service = this.bankRoutingService.addNewRoute({ data: payload });
    //       }
    //       service
    //         .subscribe(
    //           (res) => {
    //             if (res["msg"]) {
    //               this.ngxToaster.success(res.msg);
    //               if (action == "save") {
    //                 this.router.navigate([`navbar/bank-routing`]);
    //               } else if (action == "saveAndAddNew") {
    //                 this.router.navigate([`navbar/bank-routing/addnewroute`]);
    //               }
    //             }
    //           },
    //           (err) => {
    //             console.log("error in saveAddNewRoute", err);
    //           }
    //         )
    //         .add(() => {
    //           this.coreService.removeLoadingScreen();
    //         });
    //     }
    //   } else {
    //     this.ngxToaster.warning(
    //       "LCY Criteria has been modified, Please apply it first"
    //     );
    //   }
    // } else {
    //   this.ngxToaster.warning(
    //     "Criterias has been modified, Please apply them first"
    //   );
    // }
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

  getSelectedOption() {
    return [];
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

  closeDialog() {
    this.criteriaName = "";
  }

  reset() {
    this.appliedCriteriaData = [];
    this.setSelectAppForm1();
    this.resetCriteriaDropdowns();
    this.criteriaText = [];
    this.criteriaCodeText = [];
    this.appliedCriteriaCriteriaMap = null;
    this.appliedCriteriaIsDuplicate = null;
    this.selectedTemplate = "";
    // this.bankRoutesData[0]["criteriaMap"] = [];
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
