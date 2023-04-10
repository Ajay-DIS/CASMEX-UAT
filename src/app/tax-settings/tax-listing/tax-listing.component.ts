import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { timeStamp } from "console";
import { ToastrService } from "ngx-toastr";
import { MultiSelect } from "primeng/multiselect";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-tax-listing",
  templateUrl: "./tax-listing.component.html",
  styleUrls: ["./tax-listing.component.css"],
})
export class TaxListingComponent implements OnInit {
  taxListingData: any[];

  objectKeys = Object.keys;

  cols: any[] = [
    { field: "taxCode", header: "Tax Code", width: "15%" },
    { field: "taxType", header: "Tax Type", width: "15%" },
    { field: "taxDescription", header: "Tax Description", width: "30%" },
    { field: "criteria", header: "Criteria", width: "30%" },
    { field: "status", header: "Status", width: "10%" },
  ];

  showtaxCodeOptions: boolean = false;
  showtaxTypeOptions: boolean = false;
  showtaxDescriptionOptions: boolean = false;
  showcriteriaOptions: boolean = false;
  showstatusOptions: boolean = false;

  taxCode = [
    { label: "T0001", value: "T0001" },
    { label: "T0002", value: "T0002" },
    { label: "T0003", value: "T0003" },
    { label: "T0004", value: "T0004" },
    { label: "T0005", value: "T0005" },
    { label: "T0006", value: "T0006" },
    { label: "T0007", value: "T0007" },
    { label: "T0008", value: "T0008" },
    { label: "T0009", value: "T0009" },
    { label: "T0010", value: "T0010" },
    { label: "T0011", value: "T0011" },
    { label: "T0012", value: "T0012" },
  ];
  taxType = [
    { label: "VAT", value: "VAT" },
    { label: "GST", value: "GST" },
  ];
  taxDescription = [
    { label: "Applicable as 5% in UAE", value: "Applicable as 5% in UAE" },
    { label: "Applicable as 7% in Oman", value: "Applicable as 7% in Oman" },
    {
      label: "Applicable as 18% in India",
      value: "Applicable as 18% in India",
    },
  ];
  criteria = [
    {
      label: "Country = UAE Module = Remittance",
      value: "Country = UAE Module = Remittance",
    },
    {
      label: "Country = Oman Moduel = All",
      value: "Country = Oman Moduel = All",
    },
    {
      label: "Country = India Module = Remittance",
      value: "Country = India Module = Remittance",
    },
  ];
  status = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  selectedFiltertaxCode: any[] = [];
  selectedFiltertaxType: any[] = [];
  selectedFiltertaxDescription: any[] = [];
  selectedFiltercriteria: any[] = [];
  selectedFilterstatus: any[] = [];

  loading: boolean = true;

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private ngxToaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
      this.coreService.removeLoadingScreen();
    });

    this.loading = false;
    this.taxListingData = [
      {
        taxCode: "T0001",
        taxType: "VAT",
        taxDescription: "Applicable as 5% in UAE",
        criteria: "Country = UAE Module = Remittance",
        status: "Active",
      },
      {
        taxCode: "T0002",
        taxType: "VAT",
        taxDescription: "Applicable as 7% in Oman",
        criteria: "Country = Oman Moduel = All",
        status: "Active",
      },
      {
        taxCode: "T0003",
        taxType: "GST",
        taxDescription: "Applicable as 18% in India",
        criteria: "Country = India Module = Remittance",
        status: "Inactive",
      },
      {
        taxCode: "T0004",
        taxType: "VAT",
        taxDescription: "Applicable as 5% in UAE",
        criteria: "Country = UAE Module = Remittance",
        status: "Active",
      },
      {
        taxCode: "T0005",
        taxType: "VAT",
        taxDescription: "Applicable as 7% in Oman",
        criteria: "Country = Oman Moduel = All",
        status: "Active",
      },
      {
        taxCode: "T0006",
        taxType: "GST",
        taxDescription: "Applicable as 18% in India",
        criteria: "Country = India Module = Remittance",
        status: "Active",
      },
      {
        taxCode: "T0007",
        taxType: "VAT",
        taxDescription: "Applicable as 5% in UAE",
        criteria: "Country = UAE Module = Remittance",
        status: "Active",
      },
      {
        taxCode: "T0008",
        taxType: "VAT",
        taxDescription: "Applicable as 7% in Oman",
        criteria: "Country = Oman Moduel = All",
        status: "Active",
      },
      {
        taxCode: "T0009",
        taxType: "GST",
        taxDescription: "Applicable as 18% in India",
        criteria: "Country = India Module = Remittance",
        status: "Active",
      },
      {
        taxCode: "T0010",
        taxType: "VAT",
        taxDescription: "Applicable as 5% in UAE",
        criteria: "Country = UAE Module = Remittance",
        status: "Active",
      },
      {
        taxCode: "T0011",
        taxType: "VAT",
        taxDescription: "Applicable as 7% in Oman",
        criteria: "Country = Oman Moduel = All",
        status: "Active",
      },
      {
        taxCode: "T0012",
        taxType: "GST",
        taxDescription: "Applicable as 18% in India",
        criteria: "Country = India Module = Remittance",
        status: "Active",
      },
    ];
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
