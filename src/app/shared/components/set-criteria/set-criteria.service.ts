import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SetCriteriaService {
  constructor() {}

  RangeTypeCriteria: any = { Slab: "LCY Amount", date: "Transaction Date" };

  $TransactionCriteriaRange = new BehaviorSubject<any>({
    txnCriteriaRange: [{ from: null, to: null }],
  });

  setTransactionCriteriaRange(value: any) {
    this.$TransactionCriteriaRange.next(value);
  }
  getTransactionCriteriaRange() {
    return this.$TransactionCriteriaRange;
  }

  $DateRange = new BehaviorSubject<any>({
    dateRange: [{ trnStartDate: null, trnEndDate: null }],
  });

  setDateRange(value: any) {
    this.$DateRange.next(value);
  }
  getDateRange() {
    return this.$DateRange;
  }

  getlcyForm(mapSplit: string) {
    let lcySlabForm = {};
    let lcySlabArr = [];
    mapSplit.split("#").forEach((rngTxt) => {
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
    return lcySlabForm;
  }

  getdateForm(mapSplit: string) {
    let dateForm = {};
    let dateArr = [];
    mapSplit.split("#").forEach((rngTxt) => {
      let fromVal = rngTxt.split("::")[0].split("=")[1];
      let toVal = rngTxt.split("::")[1].split("=")[1];
      dateArr.push({
        trnStartDate: new Date(
          fromVal.replace(
            /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})/,
            "$3-$2-$1T$4"
          )
        ),
        trnEndDate: new Date(
          toVal.replace(
            /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})/,
            "$3-$2-$1T$4"
          )
        ),
      });
    });
    dateForm = {
      dateRange: dateArr,
    };
    return dateForm;
  }

  setCriteriaMap(criteriaData: any) {
    let criteriaMapFirstSplit = null;
    let criteriaMapSecSplit = null;
    let criteriaMapThirdSplit = null;
    let slabTypeName = null;
    let dateTypeName = null;

    if (Object.keys(this.RangeTypeCriteria).length) {
      if ("Slab" in this.RangeTypeCriteria) {
        slabTypeName = this.RangeTypeCriteria["Slab"];
      }
      if ("date" in this.RangeTypeCriteria) {
        dateTypeName = this.RangeTypeCriteria["date"];
      }
    }
    if (criteriaData["criteriaMap"].includes("&&&&")) {
      if (criteriaData["criteriaMap"].split("&&&&").length == 3) {
        criteriaMapFirstSplit = criteriaData["criteriaMap"].split("&&&&")[0];
        criteriaMapSecSplit = criteriaData["criteriaMap"].split("&&&&")[1];
        criteriaMapThirdSplit = criteriaData["criteriaMap"].split("&&&&")[2];

        if (criteriaMapSecSplit.includes("from:")) {
          this.setTransactionCriteriaRange(
            this.getlcyForm(criteriaMapSecSplit)
          );

          criteriaMapFirstSplit = criteriaMapFirstSplit.length
            ? criteriaMapFirstSplit +
              `;${slabTypeName ? slabTypeName : "Amount"} = Slab`
            : `${slabTypeName ? slabTypeName : "Amount"} = Slab`;
        }

        if (criteriaMapThirdSplit.includes("trnStartDate=")) {
          this.setDateRange(this.getdateForm(criteriaMapThirdSplit));

          criteriaMapFirstSplit = criteriaMapFirstSplit.length
            ? criteriaMapFirstSplit +
              `;${dateTypeName ? dateTypeName : "Date"} = Slab`
            : `${dateTypeName ? dateTypeName : "Date"} = Slab`;
        }
      } else if (criteriaData["criteriaMap"].split("&&&&").length == 2) {
        criteriaMapFirstSplit = criteriaData["criteriaMap"].split("&&&&")[0];
        criteriaMapSecSplit = criteriaData["criteriaMap"].split("&&&&")[1];

        if (criteriaMapSecSplit.includes("from:")) {
          this.setTransactionCriteriaRange(
            this.getlcyForm(criteriaMapSecSplit)
          );

          criteriaMapFirstSplit = criteriaMapFirstSplit.length
            ? criteriaMapFirstSplit +
              `;${slabTypeName ? slabTypeName : "Amount"} = Slab`
            : `${slabTypeName ? slabTypeName : "Amount"} = Slab`;
        } else if (criteriaMapSecSplit.includes("trnStartDate=")) {
          this.setDateRange(this.getdateForm(criteriaMapSecSplit));

          criteriaMapFirstSplit = criteriaMapFirstSplit.length
            ? criteriaMapFirstSplit +
              `;${dateTypeName ? dateTypeName : "Date"} = Slab`
            : `${dateTypeName ? dateTypeName : "Date"} = Slab`;
        }
      }
    } else {
      criteriaMapFirstSplit = criteriaData["criteriaMap"];

      this.setTransactionCriteriaRange({
        txnCriteriaRange: [{ from: null, to: null }],
      });
      this.setDateRange({
        dateRange: [{ trnStartDate: null, trnEndDate: null }],
      });
    }

    return criteriaMapFirstSplit.split(";");
  }

  decodeFormattedCriteria(
    criteriaCodeText: any,
    criteriaMasterData: any,
    fieldDisplayData: any
  ) {
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
      console.log(formatCrt);
      let decodeCriteriaText;
      let displayName = null;

      //% this needs to be updated when displayName fieldName point arises

      // displayName = Object.keys(criteriaMasterData).filter((data) => {
      //   return data == formatCrt.split("  ")[0];
      // })[0];
      // if (!displayName) {
      //   let rangeType = Object.keys(this.RangeTypeCriteria).find(
      //     (key) => this.RangeTypeCriteria[key] === formatCrt.split("  ")[0]
      //   );

      //   if (rangeType) {
      //     displayName = formatCrt.split("  ")[0];
      //   }
      // }
      console.log(":::", fieldDisplayData);
      let fieldNameArr = [];
      if (fieldDisplayData && Object.keys(fieldDisplayData).length) {
        fieldNameArr = Object.keys(fieldDisplayData).filter((fieldName) => {
          return formatCrt.split("  ")[0] == fieldName;
        });
      }

      if (fieldNameArr.length) {
        displayName = fieldDisplayData[fieldNameArr[0]];
      } else {
        displayName = formatCrt.split("  ")[0];
      }
      //% this needs to be updated when displayName fieldName point arises ENDS

      if (Object.keys(criteriaMasterData).includes(formatCrt.split("  ")[0])) {
        Object.keys(criteriaMasterData).forEach((field) => {
          if (field == formatCrt.split("  ")[0]) {
            criteriaMasterData[field].forEach((val) => {
              if (formatCrt.split("  ")[1] == "Any") {
                decodeCriteriaText =
                  displayName + " " + opr + " " + formatCrt.split("  ")[1];
              } else if (val["code"] == formatCrt.split("  ")[1]) {
                decodeCriteriaText =
                  displayName + " " + opr + " " + val["codeName"];
              }
            });
          }
        });
      } else {
        decodeCriteriaText =
          displayName + " " + opr + " " + formatCrt.split("  ")[1];
      }
      return decodeCriteriaText;
    });
    return decodedFormattedCriteriaArr;
  }
}
