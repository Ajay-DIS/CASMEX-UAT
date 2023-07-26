import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CriteriaDataService {
  constructor() {}

  setDependencyTree(
    criteriaDataDetailsJson: any,
    cmCriteriaDataDetails: any,
    criteriaMasterData: any,
    cmCriteriaMandatory: any,
    cmCriteriaDependency: any,
    cmCriteriaSlabType: any
  ) {
    let criteriaMapDdlOptions = [];
    let independantCriteriaArr = [];

    cmCriteriaDataDetails.forEach((element) => {
      let isMandatory = false;
      let isDependent = false;
      let dependencyList = "";
      let dependenceObj = criteriaDataDetailsJson.data.dependance;

      if (
        cmCriteriaMandatory &&
        cmCriteriaMandatory.indexOf(element.fieldName) >= 0
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
        independantCriteriaArr.push(element.fieldName);
      }

      if (!isDependent) {
        let selectedKeys = [];
        let allChildDependants = [];

        let childDependants = [element.fieldName];

        let obj: any = {};

        while (childDependants.length) {
          selectedKeys = [];
          selectedKeys = [...childDependants];
          childDependants = [];
          selectedKeys.forEach((selcCrit) => {
            let filteredKeys = Object.keys(cmCriteriaDependency).filter(
              (key) => cmCriteriaDependency[key] == selcCrit
            );

            let depValues = [];
            filteredKeys.forEach((filtKey) => {
              depValues.push(filtKey);
              childDependants.push(filtKey);
              obj[cmCriteriaDependency[filtKey]] = depValues;
              allChildDependants.push(selcCrit);
            });
          });
        }
        let crElm = {
          label: element.fieldName,
          data: element.displayName,
          isMandatory: isMandatory,
          isDependent: isDependent,
          dependencyList: dependencyList,
          children: null,
        };
        criteriaMapDdlOptions.push(crElm);

        if (Object.keys(obj).length) {
          for (const [key, value] of Object.entries(obj)) {
            let childArr = [];
            (value as []).forEach((deps) => {
              let isMandatoryC = false;
              let isDependentC = false;
              let dependencyListC = "";
              let dependenceObjC = criteriaDataDetailsJson.data.dependance;

              if (
                cmCriteriaMandatory &&
                cmCriteriaMandatory.indexOf(deps) >= 0
              ) {
                isMandatoryC = true;
              }
              if (
                Object.keys(dependenceObjC).length &&
                dependenceObjC[deps] &&
                dependenceObjC[deps] != "null"
              ) {
                isDependentC = true;
                dependencyListC = dependenceObjC[deps];
              }

              if (
                cmCriteriaDataDetails.filter(
                  (data: { displayName: string; fieldName: string }) => {
                    return data["fieldName"] == deps;
                  }
                ).length
              ) {
                let fieldName = deps;
                let displayName = null;

                //% this needs to be updated when displayName fieldName point arises

                // displayName = cmCriteriaDataDetails.filter(
                //   (data: { displayName: string; fieldName: string }) => {
                //       return data["fieldName"] == deps;
                //   }
                // )[0]["displayName"];

                displayName = Object.keys(criteriaMasterData).filter((data) => {
                  return data == deps;
                })[0];
                if (!displayName) {
                  if (cmCriteriaSlabType.includes(deps)) {
                    displayName = cmCriteriaSlabType[0];
                  }
                }
                //% this needs to be updated when displayName fieldName point arises ENDS

                let crElmChild = {
                  label: fieldName,
                  data: displayName,
                  isMandatory: isMandatoryC,
                  isDependent: isDependentC,
                  dependencyList: dependencyListC,
                  children: null,
                };
                childArr.push(crElmChild);
              }
            });

            if (childArr.length) {
              this.findNestedObj(criteriaMapDdlOptions, "label", key)[
                "children"
              ] = childArr;
            }
          }
        }
      }
    });

    return {
      criteriaMapDdlOptions: criteriaMapDdlOptions,
      independantCriteriaArr: independantCriteriaArr,
    };
  }

  findNestedObj(entireObj, keyToFind, valToFind) {
    let foundObj;
    JSON.stringify(entireObj, (_, nestedValue) => {
      if (nestedValue && nestedValue[keyToFind] === valToFind) {
        foundObj = nestedValue;
      }
      return nestedValue;
    });
    return foundObj;
  }

  getAppliedCriteriaTableColumns(colData: any) {
    let tableCols = [];
    Object.entries(colData).forEach(([key, value], index) => {
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
        inputType = (value as string).split("::")[1] == "input" ? true : false;
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
    return tableCols;
  }

  decodeCriteriaMapIntoTableFields(criteriaData: any) {
    let criteriaMapFirstSplit = null;
    let criteriaMapSecSplit = null;
    let lcySlabArr = [];

    if (criteriaData["criteriaMap"].includes("&&&&")) {
      criteriaMapFirstSplit = criteriaData["criteriaMap"].split("&&&&")[0];
      criteriaMapSecSplit = criteriaData["criteriaMap"].split("&&&&")[1];

      if (criteriaMapSecSplit.includes("from:")) {
        criteriaMapSecSplit.split("#").forEach((rngTxt) => {
          let fromVal = rngTxt.split("::")[0].split(":")[1];
          let toVal = rngTxt.split("::")[1].split(":")[1];
          lcySlabArr.push({
            from: +fromVal,
            to: +toVal,
          });
        });
      } else {
        criteriaMapFirstSplit += `;${criteriaMapSecSplit}`;
      }
    } else {
      criteriaMapFirstSplit = criteriaData["criteriaMap"];
    }

    return {
      critMap: criteriaMapFirstSplit.split(";") as Array<any>,
      lcySlabArr: lcySlabArr,
    };
  }
}
