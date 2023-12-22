import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-customised-details",
  templateUrl: "./customised-details.component.html",
  styleUrls: ["./customised-details.component.scss"],
})
export class CustomisedDetailsComponent implements OnInit {
  primaryColor = "var(--primary-color)";
  deactivated: boolean = false;
  mode = "add";
  messageCode = "ERR-0001";
  messageType = "";
  messageTypeOptions: any = [];
  messageLanguage = "";
  messageLanguageOptions: any = [];
  messageHeader = "";
  messageDescription = "";

  userData: any = {};

  messageRows: any[] = [];
  dataformsg = {
    data: {
      systemMessageTypes: [
        {
          id: 1,
          code: "ERR",
          codeName: "ERROR",
        },
        {
          id: 2,
          code: "WARG",
          codeName: "WARNING",
        },
        {
          id: 3,
          code: "FAIL",
          codeName: "FAILURE",
        },
        {
          id: 4,
          code: "SUCC",
          codeName: "SUCCESS",
        },
      ],
      systemLanguages: [
        {
          id: 1,
          code: "ab",
          codeName: "Abkhazian",
          status: "A",
        },
        {
          id: 2,
          code: "aa",
          codeName: "Afar",
          status: "A",
        },
        {
          id: 3,
          code: "af",
          codeName: "Afrikaans",
          status: "A",
        },
        {
          id: 4,
          code: "ak",
          codeName: "Akan",
          status: "A",
        },
        {
          id: 5,
          code: "sq",
          codeName: "Albanian",
          status: "A",
        },
        {
          id: 6,
          code: "am",
          codeName: "Amharic",
          status: "A",
        },
        {
          id: 7,
          code: "ar",
          codeName: "Arabic",
          status: "A",
        },
        {
          id: 8,
          code: "an",
          codeName: "Aragonese",
          status: "A",
        },
        {
          id: 9,
          code: "hy",
          codeName: "Armenian",
          status: "A",
        },
        {
          id: 10,
          code: "as",
          codeName: "Assamese",
          status: "A",
        },
      ],
    },
    status: "200",
  };

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const translationKey = "Home.Settings";
    this.coreService
      .translate(translationKey)
      .then((translatedTitle: string) => {
        this.coreService.setPageTitle(translatedTitle);
      });

    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.userData = JSON.parse(localStorage.getItem("userData"));

    this.messageTypeOptions = this.dataformsg.data.systemMessageTypes.map(
      (option) => {
        return { code: option.code, name: option.codeName };
      }
    );
    this.messageLanguageOptions = this.dataformsg.data.systemLanguages.map(
      (option) => {
        return { code: option.code, name: option.codeName };
      }
    );
    console.log("111", this.messageTypeOptions, this.messageLanguageOptions);
  }
  saveAddNewMessage() {}
  reset() {}
  editDisableModel() {}
  addMsg() {
    this.messageRows.push({
      messageLanguage: "",
      messageHeader: "",
      messageDescription: "",
    });
  }
  deleteMsg(index: number) {
    this.messageRows.splice(index, 1);
  }
}
