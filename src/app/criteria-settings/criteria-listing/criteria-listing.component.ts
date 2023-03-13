import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-criteria-listing",
  templateUrl: "./criteria-listing.component.html",
  styleUrls: ["./criteria-listing.component.css"],
})
export class CriteriaListingComponent implements OnInit {
  noDataMsg: string = "Criteria Setting Data Not Available";

  dummyCriteriaSettingsData = {
    application: [
      "Casmex Core",
      "Casmex Core",
      "Casmex Core",
      "Casmex Core",
      "Casmex Core",
      "Casmex Core",
      "Casmex Core",
    ],
    form: ["India234", "India2", "India23", "India2344", "India"],
    operations: ["SBI12344", "SBI1", "SBI", "SBI12", "SBI1234", "SBI123"],
    data: [
      {
        id: 7,
        userID: "yogeshm",
        application: "Casmex Core",
        form: "Payment Mode Settings",
        totalCriteriaFields: "6",
        totalListFields: "8",
        createdBy: "Pallavi Loha",
        operations: "SBI",
        createdDate: "2023-02-15T08:44:15.987+00:00",
        status: "Active",
        updatedBy: "Ajay",
        updatedDate: "2023-02-15T12:28:48.559+00:00",
      },
      {
        id: 8,
        userID: "yogeshm",
        application: "Mobile Application",
        form: "Tax Settings",
        totalCriteriaFields: "3",
        totalListFields: "8",
        createdBy: "Pallavi Loha",
        operations: "SBI",
        createdDate: "2023-02-15T08:44:18.596+00:00",
        status: "Inactive",
        updatedBy: "Ajay",
        updatedDate: "2023-02-15T12:28:48.568+00:00",
      },
      {
        id: 11,
        userID: "yogeshm",
        application: "Web Application",
        form: "Payment Mode Settings",
        totalCriteriaFields: "4",
        totalListFields: "8",
        createdBy: "Pallavi Loha",
        operations: "SBI123",
        createdDate: "2023-02-16T06:31:23.054+00:00",
        status: "Active",
        updatedBy: null,
        updatedDate: null,
      },
      {
        id: 12,
        userID: "yogeshm",
        application: "Mobile Application",
        form: "Module Settings",
        totalCriteriaFields: "3",
        totalListFields: "8",
        createdBy: "Pallavi Loha",
        operations: "SBI1234",
        createdDate: "2023-02-16T06:31:36.623+00:00",
        status: "Inactive",
        updatedBy: null,
        updatedDate: null,
      },
      {
        id: 13,
        userID: "yogeshm",
        application: "Casmex Core",
        form: "Payment Mode Settings",
        totalCriteriaFields: "5",
        totalListFields: "8",
        createdBy: "Pallavi Loha",
        operations: "SBI12344",
        createdDate: "2023-02-16T06:31:49.309+00:00",
        status: "Inactive",
        updatedBy: null,
        updatedDate: null,
      },
      {
        id: 9,
        userID: "yogeshm",
        application: "Casmex Core",
        form: "Module Settings",
        totalCriteriaFields: "3",
        totalListFields: "8",
        createdBy: "Pallavi Loha",
        operations: "SBI1",
        createdDate: "2023-02-16T06:30:55.006+00:00",
        status: "Active",
        updatedBy: null,
        updatedDate: null,
      },
      {
        id: 10,
        userID: "yogeshm",
        application: "Web Application",
        form: "Payment Mode Settings",
        totalCriteriaFields: "3",
        totalListFields: "8",
        createdBy: "Pallavi Loha",
        operations: "SBI12",
        createdDate: "2023-02-16T06:31:08.691+00:00",
        status: "Active",
        updatedBy: null,
        updatedDate: null,
      },
    ],
    totalCriteriaFields: [
      "ICICI",
      "ICICI10234",
      "ICICI102",
      "ICICI102344",
      "ICICI10",
      "ICICI1023",
    ],
    createdDate: [
      "Cash1",
      "Cash21",
      "Cash21344",
      "Cash2134",
      "Cash",
      "Cash213",
    ],
    totalListFields: ["DF11234", "DF112344", "DF1123", "DF11", "DF1", "DF112"],
    routeToServiceType: [
      "NFT1",
      "NFT213",
      "NFT21344",
      "NFT21",
      "NFT2134",
      "NFT",
    ],
    routeToServiceCategory: [
      "NFT1",
      "NFT12",
      "NFT12344",
      "NFT",
      "NFT123",
      "NFT1234",
    ],
    createdBy: ["Yes1", "Yes21", "Yes", "Yes2134", "Yes213", "Yes21344"],
    status: ["Active", "Inactive"],
  };

  criteriaSettingData = this.dummyCriteriaSettingsData.data;

  showApplicationOptions: boolean = false;
  showFormOptions: boolean = false;
  showCriteriaFieldsOptions: boolean = false;
  showListFieldsOptions: boolean = false;
  showCreatedDateOptions: boolean = false;
  showCreatedByOptions: boolean = false;
  showStatusesOptions: boolean = false;

  applications: any[] = [
    { label: "code1", value: "code1" },
    { label: "code2", value: "code2" },
    { label: "code3", value: "code3" },
    { label: "code4", value: "code4" },
  ];
  forms: any[] = [
    { label: "code1", value: "code1" },
    { label: "code2", value: "code2" },
    { label: "code3", value: "code3" },
    { label: "code4", value: "code4" },
  ];
  totalCriteriaFields: any[] = [
    { label: "code1", value: "code1" },
    { label: "code2", value: "code2" },
    { label: "code3", value: "code3" },
    { label: "code4", value: "code4" },
  ];
  totalListFields: any[] = [
    { label: "code1", value: "code1" },
    { label: "code2", value: "code2" },
    { label: "code3", value: "code3" },
    { label: "code4", value: "code4" },
  ];
  createdDates: any[] = [
    { label: "code1", value: "code1" },
    { label: "code2", value: "code2" },
    { label: "code3", value: "code3" },
    { label: "code4", value: "code4" },
  ];
  createdBy: any[] = [
    { label: "code1", value: "code1" },
    { label: "code2", value: "code2" },
    { label: "code3", value: "code3" },
    { label: "code4", value: "code4" },
  ];
  statuses: any[] = [
    { label: "code1", value: "code1" },
    { label: "code2", value: "code2" },
    { label: "code3", value: "code3" },
    { label: "code4", value: "code4" },
  ];

  constructor(
    private coreService: CoreService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.coreService.removeLoadingScreen();
  }
}
