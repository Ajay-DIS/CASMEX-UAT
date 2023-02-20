import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  constructor(private http: HttpClient) {}

  saveLoggedUserInfo(data: any) {
    let loggedUser = {
      useRole: data.useRole,
      userGroup: data.userGroup,
      userId: data.userId,
      userName: data.userName,
    };
    let token = data.jwt;
    let menuTree = data.menuItemTree;
    localStorage.setItem("userData", JSON.stringify(loggedUser));
    localStorage.setItem("token", token);
    localStorage.setItem("menuItems", JSON.stringify(menuTree));
  }

  loginUser(data: LoginFormData) {
    return this.http.post(`${environment.baseUrl}/login`, data);
  }
}

export interface LoginFormData {
  application: string;
  password: string;
  username: string;
}
