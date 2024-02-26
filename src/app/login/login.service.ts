import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "../auth/auth.service";
import { User } from "../auth/user.model";
import { BnNgIdleService } from "bn-ng-idle";
import { take } from "rxjs/operators";
import { CoreService } from "../core.service";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private coreService: CoreService
  ) {}

  saveLoggedUserInfo(data: any) {
    let expiry = JSON.parse(atob(data.jwt.split(".")[1])).exp;
    let loggedUser = new User(
      data.useRole,
      data.userGroup,
      data.userId,
      data.userName,
      data.jwt,
      new Date(expiry * 1000).getTime(),
      data.userCode
    );

    console.log("user", loggedUser);
    this.authService.userDataSub.next(loggedUser);

    let token = data.jwt;
    localStorage.setItem("userData", JSON.stringify(loggedUser));
    localStorage.setItem("token", token);

    // % formatting & setting allApplications - eligibleApp in local storage
    let allApplicationsForUser = [];
    let eligibleApplicationsForUser = [{ code: "def", codeName: "def" }];
    if (data.allApplications) {
      data.allApplications.forEach((app) => {
        let applicationData = {
          code: app.code,
          codeName: app.codeName,
          eligibleApp: false,
        };
        if (
          data.eligibleApp &&
          data.eligibleApp.find((elApp) => elApp.code == app.code)
        ) {
          applicationData["eligibleApp"] = true;
          eligibleApplicationsForUser.push(applicationData);
        }
        allApplicationsForUser.push(applicationData);
      });
    }
    localStorage.setItem(
      "allApplicationsForUser",
      JSON.stringify(allApplicationsForUser)
    );
    localStorage.setItem(
      "eligibleApplicationsForUser",
      JSON.stringify(eligibleApplicationsForUser)
    );

    //% setting licenseCountry in localstorage
    localStorage.setItem("licenseCountry", "CO");

    // // save app & mod in localstorage
    // let appsAvailable = [];
    // let modsAvailable = [];
    // if (data.application) {
    //   appsAvailable = data.application.map((apps) => {
    //     return { code: apps.code, name: apps.description };
    //   });
    // }
    // if (data.module) {
    //   modsAvailable = data.module.map((mods) => {
    //     return { code: mods.code, name: mods.description };
    //   });
    // }

    // localStorage.setItem("appAccess", JSON.stringify(appsAvailable));
    // localStorage.setItem("modAccess", JSON.stringify(modsAvailable));
    // let defAppMod = {
    //   applicationName: appsAvailable[0],
    //   moduleName: modsAvailable[0],
    // };

    // localStorage.setItem("applicationName", JSON.stringify(appsAvailable[0]));
    // localStorage.setItem("moduleName", JSON.stringify(modsAvailable[0]));

    // localStorage.setItem("defAppModule", JSON.stringify(defAppMod));

    // let menuTree = data.menuItemTree;
    // localStorage.setItem("menuItems", JSON.stringify(menuTree));

    // sessionStorage.setItem("bankRoute", null),
    //   sessionStorage.setItem("tax", null),
    //   sessionStorage.setItem("doc", null),
    //   sessionStorage.setItem("form", null);
  }

  saveUserSelectedApplicationData(data: any) {
    // save app & mod in localstorage
    let appsAvailable = [];
    let modsAvailable = [];
    if (data.application) {
      appsAvailable = data.application.map((apps) => {
        return { code: apps.code, name: apps.description };
      });
    }
    if (data.module) {
      modsAvailable = data.module.map((mods) => {
        return { code: mods.code, name: mods.description };
      });
    }

    localStorage.setItem("appAccess", JSON.stringify(appsAvailable));
    localStorage.setItem("modAccess", JSON.stringify(modsAvailable));
    let defAppMod = {
      applicationName: appsAvailable[0],
      moduleName: modsAvailable[0],
    };

    localStorage.setItem("applicationName", JSON.stringify(appsAvailable[0]));
    localStorage.setItem("moduleName", JSON.stringify(modsAvailable[0]));

    localStorage.setItem("defAppModule", JSON.stringify(defAppMod));

    let menuTree = data.menuItemTree;
    if (menuTree) {
      localStorage.setItem("menuItems", JSON.stringify(menuTree));
      this.coreService.setsidebarMenu(menuTree);
    }
  }

  loginUser(data: LoginFormData) {
    return this.http.post(`/login/loginController/login`, data);
  }

  getAppModuleData(userCode: any, appCode: any) {
    return this.http.get(`/login/loginController/getAppModule`, {
      headers: new HttpHeaders()
        .set("userCode", String(userCode))
        .set("appCode", String(appCode)),
    });
  }
}

export interface LoginFormData {
  application: string;
  password: string;
  username: string;
}
