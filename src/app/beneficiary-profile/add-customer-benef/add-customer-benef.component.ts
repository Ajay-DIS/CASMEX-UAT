import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { Calendar } from "primeng/calendar";
import { Observable, Subscription } from "rxjs";
import { CoreService } from "src/app/core.service";
import { CustomerProfileService } from "src/app/customer-profile/customer-profile.service";
import _lodashClone from "lodash-es/cloneDeep";
import _lodashIsEqual from "lodash-es/isequal";

@Component({
  selector: "app-add-customer-benef",
  templateUrl: "./add-customer-benef.component.html",
  styleUrls: ["./add-customer-benef.component.scss"],
})
export class AddCustomerBenefComponent implements OnInit, OnDestroy {
  @ViewChild("calendar") calendar: Calendar;
  @Input("formData") formData: any;
  @Input("beneData") beneData: any;
  @Input("masterData") masterData: any;
  @Input("docFormSections") docFormSections: any;
  @Input("duplicateCheckFields") duplicateCheckFields: any;
  @Input("causingCriteriaFieldsArr") causingCriteriaFieldsArr: any;
  @Input("causingCriteriaMapObj") causingCriteriaMapObj: any;
  @Input("mode") mode: any;
  @Input("showForm") showForm: boolean = false;

  @Output() postData = new EventEmitter<any>();
  @Output() sendCausingCriteriaMapObj = new EventEmitter<any>();

  // masterData : any =[];

  deactivated: boolean = false;
  disabledFields: any = {};

  custId = null;
  userId = null;
  submitted = false;
  today = new Date();
  pastYear = new Date("01/01/1950");
  futureYear = new Date("01/01/2050");
  dobMaxDate = new Date(this.today.setFullYear(this.today.getFullYear() - 18));

  individualForm: FormGroup;
  formSections: any[] = [];

  objectKeys = Object.keys;

  formDataOrg = null;
  beneDataOrg = {};
  masterDataOrg = null;
  modeVal = "add";

  countryDialCode: any = "+91";

  countryChange$: Subscription = null;

  initFormRuleDataJson = [];
  initFormRuleFieldsNames = [];

  constructor(
    private coreService: CoreService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
    private customerService: CustomerProfileService
  ) {}

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];
  }

  ngOnChanges(e: any) {
    console.log("ngonchanges", e);

    if (e.formData && e.formData.currentValue) {
      this.formDataOrg = JSON.parse(JSON.stringify(e.formData.currentValue));
      if (this.masterDataOrg) {
        this.individualForm = this.formBuilder.group({});
        this.setFormByData(this.formDataOrg);
      }
    }
    if (e.masterData && e.masterData.currentValue) {
      this.masterDataOrg = e.masterData.currentValue;
      if (this.formDataOrg) {
        this.individualForm = this.formBuilder.group({});
        this.setFormByData(this.formDataOrg);
      }
    }
    if (e.mode && e.mode.currentValue) {
      this.modeVal = e.mode.currentValue;
    }

    if (e.beneData && e.beneData.currentValue) {
      this.beneDataOrg = JSON.parse(JSON.stringify(e.beneData.currentValue));
      if (Object.keys(this.formDataOrg).length) {
        this.setBenefEditFormData(e.beneData.currentValue);
        this.onInactiveStatus();
      }
    }
  }

  handleDateSelect(calendar: Calendar) {
    setTimeout(() => {
      if (calendar.inputfieldViewChild.nativeElement) {
        calendar.inputfieldViewChild.nativeElement.focus();
      }
    }, 0);
  }

  checkValidValuesText(e: any, fieldData: any) {
    if (fieldData.validValues && fieldData.validValues.length) {
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
        let currCtrl = this.individualForm
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
        let currCtrl = this.individualForm
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

  setFormByData(data: any) {
    this.initFormRuleDataJson = _lodashClone(data.Rules);
    // NEW JSON START
    let groupedData = data.Rules.reduce((acc, field) => {
      const fieldSectionName = field.displaySection;
      (acc[fieldSectionName] = acc[fieldSectionName] || []).push(field);
      return acc;
    }, {});
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
              docFieldMandate: this.docFormSections.includes(
                secData["displaySection"]
              )
                ? secData["isMandatory"] == "True"
                  ? true
                  : false
                : false,
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
    // NEW JSON END

    this.formSections = allFSec.sort((a, b) => a.seqOrder - b.seqOrder);
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
      this.individualForm.addControl(section.formName, sectionGroup);
    });

    this.coreService.removeLoadingScreen();
    if (this.individualForm.get("Contact Details")?.get("contactCountry")) {
      this.countryChange$ = this.individualForm
        .get("Contact Details")
        ?.get("contactCountry")
        .valueChanges.subscribe((value) => {
          if (value && value.code) {
            if ("countryDialCode" in this.masterData) {
              let filterCode = this.masterData["countryDialCode"].filter(
                (dialCode: any) => dialCode.code == value.code
              );
              if (filterCode && filterCode.length) {
                this.countryDialCode = filterCode[0]?.countryDialCode?.length
                  ? filterCode[0].countryDialCode
                  : "+91";
              } else {
                this.countryDialCode = "+91";
              }
            }
          }
        });
    }

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
            this.individualForm
              .get(fieldSecName)
              ?.get(crtField)
              .valueChanges.subscribe((value) => {
                this.formatCausingCriteriaMap(crtField, value, fieldType);
              });
          }
        }
      });
    }

    this.showForm = true;
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
      this.causingCriteriaMapObj[crtField] = codeValue;
      // this.getformRuleData(this.causingCriteriaMapObj);
      this.sendCausingCriteriaMapObj.next(this.causingCriteriaMapObj);
    }
  }

  modifyFormFieldsRules(formRulesData: any) {
    formRulesData.Rules.forEach((fieldRule) => {
      if (fieldRule["checkDuplicate"] == "Yes") {
        this.duplicateCheckFields.push(fieldRule["fieldId"]);
      }
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
        required: this.docFormSections.includes(fieldRule["displaySection"])
          ? false
          : fieldRule["isMandatory"] == "True"
          ? true
          : false,
        docFieldMandate: this.docFormSections.includes(
          fieldRule["displaySection"]
        )
          ? fieldRule["isMandatory"] == "True"
            ? true
            : false
          : false,
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
          }
          if (fData.visible) {
            this.formSections[sectionIndexPosition]["isVisible"] = true;
          }
          (
            this.individualForm.get(fieldRule["displaySection"]) as FormGroup
          ).removeControl(fieldRule["fieldId"]);
          (
            this.individualForm.get(fieldRule["displaySection"]) as FormGroup
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

          if (fData.visible) {
            this.formSections[sectionIndexPosition]["isVisible"] = true;
          }

          (
            this.individualForm.get(fieldRule["displaySection"]) as FormGroup
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

          const newSectionGroup = new UntypedFormGroup({});
          newSectionGroup.addControl(fieldRule["fieldId"], fieldControl);
          this.individualForm.addControl(
            fieldRule["displaySection"],
            newSectionGroup
          );
        }
      }
    });

    console.log(":::", this.initFormRuleFieldsNames);
    console.log(":::", this.formSections);
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

  validMinDate(fieldName: string) {
    return this.pastYear;
  }
  validMaxDate(fieldName: string) {
    if (fieldName == "dateOfEstablishment") {
      return new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    } else if (fieldName == "dateOfBirth") {
      return this.dobMaxDate;
    } else {
      return this.futureYear;
    }
  }
  validDefDate(fieldName: string) {
    if (fieldName == "dateOfBirth") {
      return this.dobMaxDate;
    } else {
      return new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    }
  }

  sameAddress(event: any, fieldName: any) {
    if (fieldName == "permanentAddressSameAsAbove") {
      let address;
      if (event.checked) {
        address = {
          permanentCountry: this.individualForm
            .get("Contact Details")
            ?.get("contactCountry")?.value,
          permanentHouseBuildingNumber: this.individualForm
            .get("Contact Details")
            ?.get("contactHouseBuildingNumber")?.value,
          permanentBlockNumber: this.individualForm
            .get("Contact Details")
            ?.get("contactBlockNumber")?.value,
          permanentStreetName: this.individualForm
            .get("Contact Details")
            ?.get("contactStreetName")?.value,
          permanentCity: this.individualForm
            .get("Contact Details")
            ?.get("contactCity")?.value,
          permanentPinZipCode: this.individualForm
            .get("Contact Details")
            ?.get("contactPinZipCode")?.value,
        };
      } else {
        address = {
          permanentCountry: "",
          permanentHouseBuildingNumber: "",
          permanentBlockNumber: "",
          permanentStreetName: "",
          permanentCity: "",
          permanentPinZipCode: "",
        };
      }

      this.individualForm.get("Contact Details").patchValue(address);
    }
  }

  setBenefEditFormData(data: any) {
    this.formSections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field["fieldName"] in data) {
          if (
            field.fieldType == "dropdownSingle" ||
            field.fieldType == "dropdownMulti"
          ) {
            let filterData = this.masterDataOrg[field["fieldName"]]?.filter(
              (msField) => {
                return msField.codeName == data[field["fieldName"]];
              }
            );
            let value = filterData?.length
              ? {
                  code: filterData[0].code,
                  codeName: filterData[0].codeName,
                }
              : "";
            this.individualForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(value);
          } else if (field.fieldType == "checkbox") {
            let value = data[field["fieldName"]] == true ? true : false;
            this.individualForm
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

            this.individualForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(dateFormatted);
          } else {
            this.individualForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(data[field["fieldName"]]);
          }
        }
      });
    });

    this.showForm = true;
  }
  onInactiveStatus() {
    if (this.beneDataOrg["status"] == "Inactive") {
      this.disableFormControls();
      this.deactivated = true;
    }
  }
  disableFormControls() {
    Object.keys(this.individualForm.controls).forEach((controlName) => {
      this.individualForm.get(controlName).disable();
    });
  }
  enableFormControls() {
    Object.keys(this.individualForm.controls).forEach((controlName) => {
      this.individualForm.get(controlName).enable();
    });
    if (Object.keys(this.disabledFields).length) {
      Object.keys(this.disabledFields).forEach((section) => {
        this.individualForm
          .get(section)
          .get(this.disabledFields[section])
          .disable();
      });
    }
  }

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
      ` the Beneficiary Record: ${this.beneDataOrg["id"]}?`;

    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatusBenef",
      accept: () => {
        this.updateStatus(
          reqStatus,
          this.beneDataOrg,
          this.beneDataOrg["customerType"]
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
    service = this.customerService.updateBeneficiaryStatusApi(
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

  onSubmit(): void {
    this.submitted = true;

    if (this.individualForm.invalid) {
      this.coreService.showWarningToast("Please fill the Mandatory fields");
      return;
    }

    this.coreService.displayLoadingScreen();

    let data = this.individualForm.getRawValue();

    let payloadData = Object.assign({}, ...Object.values(data));

    this.formSections.forEach((section) => {
      section.fields.forEach((field) => {
        if (
          field.fieldType == "dropdownSingle" ||
          field.fieldType == "dropdownMulti"
        ) {
          let value = payloadData[field["fieldName"]]
            ? payloadData[field["fieldName"]]["codeName"]
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
                  payloadData[field["fieldName"]].split("/").reverse().join("-")
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
    });
    console.log("payloadData", payloadData);
    this.postData.emit(payloadData);
  }

  onReset(): void {
    this.coreService.setHeaderStickyStyle(false);
    this.coreService.setSidebarBtnFixedStyle(false);
    this.confirmationService.confirm({
      message:
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        "Resetting will result in the removal of all data. Are you sure you want to proceed ?",
      key: "resetBenfWarning",
      accept: () => {
        this.submitted = false;
        if (this.individualForm) {
          this.individualForm.reset();
        }
        this.setHeaderSidebarBtn();
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
      },
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
  ngOnDestroy(): void {
    if (this.countryChange$) {
      this.countryChange$.unsubscribe();
    }
  }
}
