import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Calendar } from "primeng/calendar";

import _lodashClone from "lodash-es/cloneDeep";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-document-collection",
  templateUrl: "./document-collection.component.html",
  styleUrls: ["./document-collection.component.scss"],
})
export class DocumentCollectionComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input("submitted") customerFormSubmitted: boolean | null = null;

  @Input("documentSettingData") documentSettingData: any = [];

  @Input("customerUploadedDocumentsData") customerUploadedDocumentsData: any =
    null;

  @Input("idIssueCountryList") idIssueCountryList: any = [];

  @Output("errorFromDocumentComponent") errorFromDocumentComponent =
    new EventEmitter<any>();

  constructor(private fb: FormBuilder, private coreService: CoreService) {}

  // uploadedDocsData = [
  //   {
  //     documentName: "Aadhar",
  //     idNumber: "887878787878",
  //     idIssueDate: "01/01/2024",
  //     idExpiryDate: "27/01/2024",
  //     idIssueAuthority: "ABCD",
  //     idIssueCountry: "AL",
  //     uploadFrontSide: null,
  //     uploadFrontSideName: "image_2023_12_27T10_40_33_076Z.png",
  //     uploadBackSide: null,
  //     uploadBackSideName: "image_2023_12_27T10_40_33_076Z.png",
  //     hereByConfirm: false,
  //   },
  //   {
  //     documentName: "PAN",
  //     idNumber: "0909090909",
  //     idIssueDate: "02/01/2024",
  //     idExpiryDate: "",
  //     idIssueAuthority: "EFGR",
  //     idIssueCountry: "AS",
  //     uploadFrontSide: null,
  //     uploadFrontSideName: "image_2023_12_27T10_40_33_076Z.png",
  //     uploadBackSide: null,
  //     uploadBackSideName: null,
  //     hereByConfirm: false,
  //   },
  // ];

  // idIssueCountryList: any[] = [
  //   {
  //     code: "AF",
  //     codeName: "AFGHANISTAN",
  //   },
  //   {
  //     code: "AX",
  //     codeName: "ALAND ISLANDS",
  //   },
  //   {
  //     code: "IR",
  //     codeName: "IRAN, ISLAMIC REPUBLIC OF",
  //   },
  //   {
  //     code: "AL",
  //     codeName: "ALBANIA",
  //   },
  //   {
  //     code: "DZ",
  //     codeName: "ALGERIA",
  //   },
  //   {
  //     code: "AS",
  //     codeName: "AMERICAN SAMOA",
  //   },
  //   {
  //     code: "AD",
  //     codeName: "ANDORRA",
  //   },
  // ];

  docCollectionForm!: FormGroup;

  docTableCols: any[];

  docTableData: any[];

  docSettingDescription = "Document description";

  docFormSubmitted: boolean = false;
  hereByConfirmed: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    console.log("::docChanges", changes);
    if (
      changes.customerUploadedDocumentsData &&
      changes.customerUploadedDocumentsData.currentValue.length > 0
    ) {
      this.customerUploadedDocumentsData =
        changes.customerUploadedDocumentsData.currentValue;
      this.setDocCollectionFormByData(
        changes.customerUploadedDocumentsData.currentValue
      );
    }
  }

  ngOnInit(): void {
    this.docTableCols = [
      {
        field: "documentName",
        header: "",
        minWidth: "130px",
        maxWidth: "150px",
        fieldType: "text",
      },
      {
        field: "idNumber",
        header: "ID Number",
        minWidth: "120px",
        maxWidth: "150px",
        fieldType: "input",
      },
      {
        field: "idIssueDate",
        header: "ID Issue Date",
        minWidth: "120px",
        maxWidth: "150px",
        fieldType: "date",
      },
      {
        field: "idExpiryDate",
        header: "ID Expiry Date",
        minWidth: "120px",
        maxWidth: "150px",
        fieldType: "date",
      },
      {
        field: "idIssueAuthority",
        header: "ID Issue Authority",
        minWidth: "120px",
        maxWidth: "150px",
        fieldType: "input",
      },
      {
        field: "idIssueCountry",
        header: "ID Issue Country",
        minWidth: "175px",
        maxWidth: "175px",
        fieldType: "dropdownSingle",
      },
      {
        field: "uploadFrontSide",
        header: "Upload Front Side",
        minWidth: "120px",
        maxWidth: "150px",
        fieldType: "file",
      },
      {
        field: "uploadBackSide",
        header: "Upload Back Side",
        minWidth: "120px",
        maxWidth: "150px",
        fieldType: "file",
      },
    ];

    this.docCollectionForm = this.fb.group({});
    let allDocData = [];
    if (this.documentSettingData && this.documentSettingData.length) {
      this.docSettingDescription = this.documentSettingData[0]["DocumentDesc"];
    }
    this.documentSettingData.forEach((doc) => {
      let docData = {
        docName: doc.Document,
        isDocMandatory:
          doc.IsMandatory && doc.IsMandatory == "true" ? true : false,
        docFields: this.docTableCols.map((docCol) => {
          let fieldData = {
            fieldName: docCol.field,
            fieldLabel: docCol.header,
            fieldType: docCol.fieldType,
            showField: true,
            requiredField: false,
          };
          if (docCol.field == "documentName") {
            fieldData["defaultValue"] = doc.Document;
          }
          if (doc.IsMandatory && doc.IsMandatory.trim().length) {
            if (docCol.field == "idNumber") {
              fieldData["requiredField"] =
                doc.IsMandatory == "true" ? true : false;
            }
          }
          if (doc.FrontSide && doc.FrontSide.trim().length) {
            if (docCol.field == "uploadFrontSide") {
              fieldData["requiredField"] =
                doc.FrontSide == "true" && doc.IsMandatory == "true"
                  ? true
                  : false;
            }
          }
          if (doc.BackSide && doc.BackSide.trim().length) {
            if (docCol.field == "uploadBackSide") {
              fieldData["requiredField"] =
                doc.BackSide == "true" && doc.IsMandatory == "true"
                  ? true
                  : false;
            }
          }
          if (doc.BypassImage && doc.BypassImage.trim().length) {
            if (
              docCol.field == "uploadFrontSide" ||
              docCol.field == "uploadBackSide"
            ) {
              fieldData["requiredField"] =
                doc.BypassImage == "true" ? false : fieldData["requiredField"];
            }
          }
          if (doc.IssueCountry && doc.IssueCountry.trim().length) {
            if (docCol.field == "idIssueCountry") {
              fieldData["requiredField"] =
                doc.IssueCountry == "true" && doc.IsMandatory == "true"
                  ? true
                  : false;
            }
          }
          if (doc.DocumentNoType && doc.DocumentNoType.trim().length) {
            if (docCol.field == "idNumber") {
              if (doc.DocumentNoType == "AlphaNumeric") {
                fieldData["regex"] = "^[a-z0-9]*$";
                fieldData["regexMessage"] = "Only alphanumeric allowed";
              } else if (doc.DocumentNoType == "Numeric") {
                fieldData["regex"] = "^[0-9]*$";
                fieldData["regexMessage"] = "Only numeric allowed";
              }
            }
          }
          if (doc.LengthMinMax && doc.LengthMinMax.trim().length) {
            if (docCol.field == "idNumber") {
              fieldData["minLength"] = doc.LengthMinMax.split("/")[0];
              fieldData["maxLength"] = doc.LengthMinMax.split("/")[1];
            }
          }
          if (docCol.fieldType == "date") {
            if (docCol.field == "idExpiryDate") {
              fieldData["maxDate"] = new Date("3000/01/01");
              fieldData["minDate"] = this.getNextDays();
            } else if (docCol.field == "idIssueDate") {
              fieldData["maxDate"] = this.getPrevDays();
              fieldData["minDate"] = new Date("1000/01/01");
            }
          }
          return fieldData;
        }),
      };
      allDocData.push(docData);
    });
    this.docTableData = allDocData;
    this.docTableData.forEach((docData) => {
      const docDataGroup = new UntypedFormGroup({});
      docData.docFields.forEach((field) => {
        let validators = [];
        if (field.minLength) {
          validators.push(Validators.minLength(+field.minLength));
        }
        if (field.maxLength) {
          validators.push(Validators.maxLength(+field.maxLength));
        }
        if (field.requiredField) {
          validators.push(Validators.required);
        }
        if (field.regex) {
          validators.push(Validators.pattern(field.regex));
        }
        docDataGroup.addControl(
          field.fieldName,
          this.fb.control(
            field.defaultValue ? field.defaultValue : "",
            validators
          )
        );
      });
      docDataGroup.addControl("uploadFrontSideName", this.fb.control(null));
      docDataGroup.addControl("uploadBackSideName", this.fb.control(null));
      this.docCollectionForm.addControl(docData.docName, docDataGroup);
    });
    // this.docCollectionForm.addControl(
    //   "hereByConfirm",
    //   this.fb.control("", [Validators.required])
    // );

    console.log(":;", this.docTableData);
    console.log(":;", this.docCollectionForm);

    this.docCollectionForm.valueChanges.subscribe((change) => {
      this.hereByConfirmed = false;
      // this.docCollectionForm.get("hereByConfirm").patchValue(false);
      console.log(":::DocFormChanged", change);
      console.log(":::hereByConfirmed", this.hereByConfirmed);
    });
  }

  get docForm() {
    return this.docCollectionForm && this.docCollectionForm.controls;
  }

  downloadDocuments(documentNameList: any) {
    console.log(
      ":;",
      documentNameList.filter((name) => {
        return name && name != "";
      })
    );
  }

  viewDocument(documentName: any) {
    console.log(":;", documentName);
  }

  setDocCollectionFormByData(uploadedDocs: any) {
    if (uploadedDocs && uploadedDocs.length) {
      // let hereByConfirmValue = uploadedDocs[0]["hereByConfirm"];
      let hereByConfirmValue = false;
      this.hereByConfirmed = hereByConfirmValue;
      uploadedDocs.forEach((doc) => {
        let formGroupName = doc["documentName"];
        for (const key of Object.keys(doc)) {
          if (
            this.docForm[formGroupName] &&
            this.docForm[formGroupName]["controls"][key]
          ) {
            if (key == "idIssueCountry" && doc[key] != "") {
              let filteredCountry = this.idIssueCountryList.filter(
                (country) => country.code == doc[key]
              );
              this.docForm[formGroupName]["controls"][key].patchValue(
                filteredCountry.length ? filteredCountry[0] : ""
              );
            } else if (
              key == "uploadFrontSideName" ||
              key == "uploadBackSideName"
            ) {
              if (doc[key] && doc[key] != "") {
                this.docForm[formGroupName]["controls"][
                  key.split("Name")[0]
                ].patchValue(doc[key]);
                this.docForm[formGroupName]["controls"][key].patchValue(
                  doc[key]
                );
              }
            } else {
              this.docForm[formGroupName]["controls"][key].patchValue(doc[key]);
            }
          }
        }
      });
    }
  }

  docFormSubmit(event: any) {
    this.docFormSubmitted = true;

    if (this.docCollectionForm.valid) {
      this.hereByConfirmed = true;
      this.errorFromDocumentComponent.emit(null);
      let formattedFormData = _lodashClone(this.docCollectionForm.value);
      let hereByConfirmValue = formattedFormData["hereByConfirm"];
      delete formattedFormData["hereByConfirm"];
      for (const key of Object.keys(formattedFormData)) {
        for (const key2 of Object.keys(formattedFormData[key])) {
          formattedFormData[key]["hereByConfirm"] = hereByConfirmValue;
          if (key2 == "idExpiryDate" || key2 == "idIssueDate") {
            if (
              formattedFormData[key][key2] &&
              formattedFormData[key][key2] != "" &&
              typeof formattedFormData[key][key2] == "object"
            ) {
              formattedFormData[key][key2] =
                formattedFormData[key][key2].toLocaleDateString("en-GB");
            }
          }
          if (key2 == "idIssueCountry") {
            if (
              formattedFormData[key][key2] &&
              formattedFormData[key][key2].code
            ) {
              formattedFormData[key][key2] = formattedFormData[key][key2].code;
            }
          }
          if (key2 == "uploadFrontSide" || key2 == "uploadBackSide") {
            if (
              formattedFormData[key][key2] &&
              (formattedFormData[key][key2] == "" ||
                !(formattedFormData[key][key2] instanceof File))
            ) {
              formattedFormData[key][key2] = null;
            }
          }
        }
      }
      let formData = new FormData();
      if (Object.values(formattedFormData).length) {
        for (let i = 0; i < Object.values(formattedFormData).length; i++) {
          for (let key in Object.values(formattedFormData)[i] as object) {
            formData.append(
              `uploadDocuments[${i}].${key}`,
              Object.values(formattedFormData)[i][key]
            );
          }
        }
      }
      console.log(
        ":; validDOcForm",
        JSON.stringify(Object.values(formattedFormData), null, 2)
      );
      // Display the key/value pairs
      for (var pair of formData.entries()) {
        console.log(pair[0] + ", " + pair[1]);
      }
    } else {
      event.target.checked = false;
      this.hereByConfirmed = false;
      console.log(":; invalidDOcForm", this.docCollectionForm);
      this.coreService.showWarningToast(
        "Uploaded Documents details are not valid, Please check!"
      );
      this.errorFromDocumentComponent.emit(
        "Uploaded Documents details are not valid, Please check!"
      );
    }
  }

  showTooltip(fieldCtrl: FormControl, docField: any) {
    if (fieldCtrl && fieldCtrl.errors) {
      if (fieldCtrl.dirty) {
        if (fieldCtrl.errors.pattern) {
          return docField.regexMessage
            ? docField.regexMessage
            : `Improper ${docField.fieldLabel} format.`;
        } else if (fieldCtrl.errors.minlength) {
          return `${docField.fieldLabel} must be
          ${docField.minLength} characters long.`;
        } else if (fieldCtrl.errors.maxlength) {
          return `${docField.fieldLabel} must not exceed
          ${docField.maxLength} characters.`;
        }
      } else if (fieldCtrl.errors.required) {
        return `${docField.fieldLabel} is required.`;
      }
    }
  }

  ngAfterViewInit(): void {
    console.log(
      ":;",
      document.querySelectorAll(".doc-collection-form .file-select-name input")
    );
    document
      .querySelectorAll(".doc-collection-form .file-select-name input")
      .forEach((el: HTMLInputElement) => {
        if (el) el.setAttribute("disabled", "true");
      });
  }

  fileUploadChange(e: any, docName: any, fieldName: any) {
    this.docCollectionForm
      ?.get(docName)
      ?.get(fieldName)
      .patchValue(e.target.files[0].name);
  }

  handleDateSelect(calendar: Calendar) {
    setTimeout(() => {
      if (calendar.inputfieldViewChild.nativeElement) {
        calendar.inputfieldViewChild.nativeElement.focus();
      }
    }, 0);
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

  getNextDays(currentDate = new Date(), daysToAdd = 1) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + daysToAdd);
    return nextDate;
  }
  getPrevDays(currentDate = new Date(), daysToMinus = 1) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - daysToMinus);
    return prevDate;
  }
}
