import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "../auth/auth.service";
import { User } from "../auth/user.model";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  constructor(private http: HttpClient, private authService: AuthService) {}

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
    this.authService.autoLogout(
      new Date(expiry * 1000).getTime() - new Date().getTime()
    );
    let token = data.jwt;
    let menuTree = data.menuItemTree;
    console.log("user", loggedUser);
    this.authService.userDataSub.next(loggedUser);
    localStorage.setItem("userData", JSON.stringify(loggedUser));
    localStorage.setItem("token", token);
    localStorage.setItem("menuItems", JSON.stringify(menuTree));
  }

  refreshUserSessionToken(token: any) {
    let expiry = JSON.parse(atob(token.split(".")[1])).exp;
    let user = JSON.parse(localStorage.getItem("userData"));
    console.log(user);
    let loggedUser = new User(
      user["useRole"],
      user["userGroup"],
      user["userId"],
      user["userName"],
      token,
      new Date(expiry * 1000).getTime()
    );
    console.log("updatedUSer", loggedUser);
    console.log(
      "updatedTimer",
      new Date(expiry * 1000).getTime() - new Date().getTime()
    );
    this.authService.autoLogout(
      new Date(expiry * 1000).getTime() - new Date().getTime()
    );
    this.authService.userDataSub.next(loggedUser);
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(loggedUser));
  }

  loginUser(data: LoginFormData) {
    return this.http.post(
      `${environment.baseUrl}/login/loginController/login`,
      data
    );
  }
  refreshAuthToken(data: LoginFormData) {
    return this.http.post(
      `${environment.baseUrl}/login/loginController/refreshToken`,
      data
    );
  }
}

export interface LoginFormData {
  application: string;
  password: string;
  username: string;
}
