import { HttpClient } from "@angular/common/http";
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
      new Date(expiry * 1000).getTime()
    );

    // save app & mod in localstorage
    localStorage.setItem(
      "applicationName",
      data.application ? data.application : "CASMEX_CORE"
    );
    localStorage.setItem(
      "moduleName",
      data.module ? data.module : "Remittance"
    );

    let application = {
      code: data?.applicationAccess?.cmApplicationMaster?.code,
      name: data?.applicationAccess?.cmApplicationMaster?.name,
    };
    let module = { code: "Remittance", name: "Remittance" };

    localStorage.setItem("appAccess", JSON.stringify([application]));
    localStorage.setItem(
      "modAccess",
      JSON.stringify(
        data?.applicationAccess?.cmApplicationMaster[
          "cmPrimaryModuleMaster"
        ].map((mod) => {
          return { code: mod.code, name: mod.primaryModuleName };
        })
      )
    );
    let defAppMod = {
      applicationName: application,
      moduleName: module,
    };

    localStorage.setItem("defAppModule", JSON.stringify(defAppMod));

    let token = data.jwt;
    let menuTree = data.menuItemTree;
    console.log("user", loggedUser);
    this.authService.userDataSub.next(loggedUser);
    localStorage.setItem("userData", JSON.stringify(loggedUser));
    localStorage.setItem("token", token);
    localStorage.setItem("menuItems", JSON.stringify(menuTree));

    sessionStorage.setItem("bankRoute", null),
      sessionStorage.setItem("tax", null),
      sessionStorage.setItem("doc", null),
      sessionStorage.setItem("form", null);
  }

  loginUser(data: LoginFormData) {
    return this.http.post(`/login/loginController/login`, data);
  }
}

export interface LoginFormData {
  application: string;
  password: string;
  username: string;
}
