import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { MultiSelect } from "primeng/multiselect";
import { CoreService } from "src/app/core.service";
import { TaxSettingsService } from "../tax-settings.service";

@Component({
  selector: "app-tax-listing",
  templateUrl: "./tax-listing.component.html",
  styleUrls: ["./tax-listing.component.scss"],
})
export class TaxListingComponent implements OnInit {
  taxListingData: any[];

  objectKeys = Object.keys;

  cols: any[] = [
    { field: "taxCode", header: "Tax Code", width: "15%" },
    { field: "taxCodeDesc", header: "Tax Description", width: "35%" },
    { field: "criteriaMap", header: "Criteria", width: "40%" },
    { field: "status", header: "Status", width: "10%" },
  ];

  showtaxCodeOptions: boolean = false;
  showtaxCodeDescOptions: boolean = false;
  showcriteriaMapOptions: boolean = false;
  showstatusOptions: boolean = false;

  taxCode = [];
  taxCodeDesc = [];
  criteriaMap = [];
  status = [];

  userData: any={};
  selectedFiltertaxCode: any[] = [];
  selectedFiltertaxCodeDesc: any[] = [];
  selectedFiltercriteriaMap: any[] = [];
  selectedFilterstatus: any[] = [];
  taxListingApiData: any={};
  loading: boolean = true;


  noDataMsg: string = "Tax Setting Data Not Available";

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private ngxToaster: ToastrService,
    private taxSettingsService: TaxSettingsService,
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userData = JSON.parse(localStorage.getItem("userData"));
    console.log("userData", localStorage.getItem("userData"));
    this.getTaxCodeListData(this.userData.userId);
    this.loading = false;
  }

  getTaxCodeListData(id: string) {
    this.taxSettingsService.getTaxCodeData(id).subscribe(
      (res) => {
        console.log("::taxListingDataApi", res);
        if (res["data"]) {
          this.coreService.removeLoadingScreen();
          this.loading = false;
          this.taxListingApiData = res;
          this.taxListingApiData.data.forEach((tax) => {
            tax.createdDate = new Date(tax.createdDate);
          });
          this.taxListingData = [...this.taxListingApiData.data];
          this.taxCode = this.taxListingApiData.taxCode.map((code) => {
            return { label: code, value: code };
          });
          this.taxCodeDesc = this.taxListingApiData.taxCodeDesc.map((code) => {
            return { label: code, value: code };
          });
          this.criteriaMap = this.taxListingApiData.criteriaMap.map(
            (code) => {
              return { label: code, value: code };
            }
          );
          this.status = this.taxListingApiData.status.map((code) => {
            return { label: code, value: code };
          });
        } else {
          this.noDataMsg = res["msg"];
          this.loading = false;
          this.coreService.removeLoadingScreen();
        }
      },
      (err) => {
        console.log(err);
        this.loading = false;
        this.coreService.removeLoadingScreen();
      }
    );
  }

  updateStatus(e: any, tax: string) {
    this.coreService.displayLoadingScreen();
    e.preventDefault();

    let reqStatus = "";
    if (e.target.checked) {
      reqStatus = "Active";
    } else {
      reqStatus = "Inactive";
    }

    const formData = new FormData();
    formData.append("userId", this.userData.userId);
    formData.append("taxCode", tax);
    formData.append("status", reqStatus);
    this.updateTaxCodeStatus(formData, e.target);
  }

  updateTaxCodeStatus(data: any, sliderElm: any) {
    this.taxSettingsService.updateTaxSettingsStatus(data).subscribe((res) => {
      if (res["msg"]) {
        sliderElm.checked = sliderElm!.checked;
        this.ngxToaster.success(res["msg"]);
        this.getTaxCodeListData(this.userData.userId);
      }
    });
  }

  addNewTaxPage() {
    this.router.navigate(["navbar", "tax-settings", "add-new-tax"]);
  }

  toggleFilterVisibility(field) {
    this[`show${field}Options`] = !this[`show${field}Options`];
  }

  hideFilterVisibility(field) {
    this[`show${field}Options`] = false;
  }

  getSelectedFilterArr(field: any) {
    return this[`selectedFilter${field}`];
  }

  setSelectedFilter(ms: MultiSelect, field: any) {
    this[`selectedFilter${field}`] = ms.value;
    console.log(ms.value, this[`selectedFilter${field}`]);
  }

  fieldFilterVisible(field: any) {
    return this[`show${field}Options`];
  }

  fieldFilterOptions(field: any): [] {
    return this[field];
  }
}
