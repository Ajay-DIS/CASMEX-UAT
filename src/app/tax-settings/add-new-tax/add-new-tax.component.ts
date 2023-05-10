import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from 'src/app/core.service';

@Component({
  selector: 'app-add-new-tax',
  templateUrl: './add-new-tax.component.html',
  styleUrls: ['./add-new-tax.component.scss']
})
export class AddNewTaxComponent implements OnInit, AfterViewInit {

  // suresh Work start -->
  appliedTaxCriteriaDataCols = [

    // { field: "country", header: "Country" },
    // { field: "state", header: "State" },
    // { field: "form", header: "Form" }, 
    // { field: "to", header: "To" }, 
    // { field: "taxType", header: "Tax Type" },
    // { field: "setAs", header: "Set As" },
    // { field: "tax", header: "Tax"},
    // { field: "action", header: "Action"},
  ];
  appliedTaxCriteriaData=[];
  
  appliedTaxCriteriaDatajson =
    {
      "data": [
        {
          "country": "India",
          "routeCode": "R0009",
          "groupID": "G0004",
          "state": "Andhra",
          "to": "100",
          "from": "1",
          "Tax": "25%",
          "lcyAmountFrom": "1",
          "lcyAmountTo": "3",
          "taxType": [
            {
              "id": 1,
              "code": "GST",
              "routeFrom": 1,
              "codeName": "GST",
              "status": "A"
            },
            {
              "id": 2,
              "code": "VAT",
              "routeFrom": 1,
              "codeName": "VAT",
              "status": "A"
            },
            {
              "id": 3,
              "code": "SGST",
              "routeFrom": 1,
              "codeName": "SGST",
              "status": "A"
            }
          ],
          "setAs": [
            {
              "id": 1,
              "code": "Percentage",
              "codeName": "Percentage",
              "status": "A"
            },
            {
              "id": 2,
              "code": "Amount",
              "codeName": "Amount",
              "status": "A"
            }
          ],
          "taxTypeOption": "VAT",
          "setAsOption": "Amount",
          "userId": "yogeshm"
        },
        {
          "country": "India",
          "routeCode": "R0009",
          "groupID": "G0004",
          "state": "Andhra",
          "to": "100",
          "from": "1",
          "Tax": "15%",
          "lcyAmountFrom": "4",
          "lcyAmountTo": "6",
          "taxType": [
            {
              "id": 1,
              "code": "GST",
              "routeFrom": 1,
              "codeName": "GST",
              "status": "A"
            },
            {
              "id": 2,
              "code": "VAT",
              "routeFrom": 1,
              "codeName": "VAT",
              "status": "A"
            },
            {
              "id": 3,
              "code": "SGST",
              "routeFrom": 1,
              "codeName": "SGST",
              "status": "A"
            }
          ],
          "setAs": [
            {
              "id": 1,
              "code": "Percentage",
              "codeName": "Percentage",
              "status": "A"
            },
            {
              "id": 2,
              "code": "Amount",
              "codeName": "Amount",
              "status": "A"
            }
          ],
          "taxTypeOption": "GST",
          "setAsOption": "Percentage",
          "userId": "yogeshm"
        }
      ],
      "column": {
        "Country": "country",
        "State": "state",
        "From": "from",
        "To": "to",
        "Tax Type": "taxType::select",
        "Set As": "setAs::select",
        "Tax": "tax::input",
        "Action": "action::button"
      },
      "lcySlab": "LCY Amount",
      "criteriaMap": "Country = IND;Organization = SBI;Service Category = Bank;Service Type = Any&&&&from:1::to:3#from:4::to:6"
    };
  // suresh Work end -->

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService
  ) { }



  ngOnInit(): void {

    // suresh Work start -->
    this.appliedTaxCriteriaData= this.appliedTaxCriteriaDatajson.data;
    this.appliedTaxCriteriaDataCols = [...this.getColumns(this.appliedTaxCriteriaDatajson.column)];
    
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    // suresh Work end -->
  }

  // suresh Work start -->

  ngAfterViewInit(): void {
    // this.appliedTaxCriteriaDataCols = [...this.getColumns(this.appliedTaxCriteriaData.column)];
  }
  isMandatoryCol(heading: any) {
    return heading.includes("*") ? true : false;
  }

  getColumns(colData: any) {
    let tableCols = [];
    console.log(colData);


    Object.entries(colData).forEach(([key, value], index) => {
      console.log(colData);
      let tableCol = {};
      let stringType = false;
      let selectType = false;
      let formatVal = "";
      let maxWidth = null;
      let minWidth = null;
      let buttonType = false;
      let inputType = false;
      if ((value as string).includes("::")) {
        formatVal = (value as string).split("::")[0];
        stringType = false;
        selectType =
          (value as string).split("::")[1] == "select" ? true : false;
        inputType =
          (value as string).split("::")[1] == "input" ? true : false;
        buttonType =
          (value as string).split("::")[1] == "button" ? true : false;
        maxWidth = "145px";
        minWidth = "145px";
      } else {
        formatVal = value as string;
        stringType = true;
        selectType = false;
        inputType = false;
        buttonType = false;
      }
      tableCol = {
        field: formatVal,
        header: key,
        isString: stringType,
        isSelect: selectType,
        isInput: inputType,
        isButton: buttonType,
        minWidth: minWidth ? minWidth : "125px",
      };
      if (maxWidth) {
        tableCol["maxWidth"] = maxWidth;
      }
      tableCols.push(tableCol);
    });
    console.log(tableCols)
    return tableCols;
  }
  // suresh Work end -->
}
