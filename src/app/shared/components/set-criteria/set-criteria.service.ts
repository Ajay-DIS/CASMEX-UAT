import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SetCriteriaService {
  constructor() {}

  $TransactionCriteriaRange = new BehaviorSubject<any>({
    txnCriteriaRange: [{ from: null, to: null }],
  });

  setTransactionCriteriaRange(value: any) {
    this.$TransactionCriteriaRange.next(value);
  }
  getTransactionCriteriaRange() {
    return this.$TransactionCriteriaRange;
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
        this.setTransactionCriteriaRange(lcySlabForm);

        criteriaMapFirstSplit += `;${criteriaData["lcySlab"]} = Slab`;
      } else {
        criteriaMapFirstSplit += `;${criteriaMapSecSplit}`;
      }
    } else {
      criteriaMapFirstSplit = criteriaData["criteriaMap"];

      this.setTransactionCriteriaRange({
        txnCriteriaRange: [{ from: null, to: null }],
      });
    }

    return criteriaMapFirstSplit.split(";");
  }

  decodeFormattedCriteria(
    criteriaCodeText: any,
    criteriaMasterData: any,
    cmCriteriaSlabType: any
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

      let decodeCriteriaText;
      let displayName = null;

      //% this needs to be updated when displayName fieldName point arises

      displayName = Object.keys(criteriaMasterData).filter((data) => {
        return data == formatCrt.split("  ")[0];
      })[0];
      if (!displayName) {
        if (cmCriteriaSlabType.includes(formatCrt.split("  ")[0])) {
          displayName = cmCriteriaSlabType[0];
        }
      }

      // let fieldNames = cmCriteriaDataDetails.map((critData) => {
      //   return critData["fieldName"];
      // });

      // if (fieldNames.includes(formatCrt.split("  ")[0])) {
      //   displayName = cmCriteriaDataDetails.filter(
      //     (data: { displayName: string; fieldName: string }) => {
      //       return data["fieldName"] == formatCrt.split("  ")[0];
      //     }
      //   )[0]["displayName"];
      // } else {
      //   displayName = formatCrt.split("  ")[0];
      // }
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
