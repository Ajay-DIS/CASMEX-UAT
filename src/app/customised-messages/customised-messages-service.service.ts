import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CustomisedMessagesServiceService {
  constructor(private http: HttpClient) {}
  getCustomisedListData() {
    return this.http.get(`/appControl/customMessageController/getMessagesList`);
  }
  getCustomisedDetailsData() {
    return this.http.get(
      `/appControl/customMessageController/getSystemMessageDetails`
    );
  }
  getCustomisedCodeData(messageType: any) {
    return this.http.get(`/appControl/customMessageController/getMessageCode`, {
      headers: new HttpHeaders().set("messageType", messageType),
    });
  }
  getMessageDataForEdit(messageCode: any) {
    return this.http.get(
      `/appControl/customMessageController/getCustomMessagesDetails`,
      {
        headers: new HttpHeaders().set("messageCode", messageCode),
      }
    );
  }
  updateCustomisedListStatus(data: any) {
    return this.http.post(
      `/appControl/customMessageController/updateStatus`,
      data
    );
  }

  addNewMessage(data, userId: any): Observable<any> {
    return this.http.post(
      `/appControl/customMessageController/saveCustomMessages`,
      data,
      {
        headers: new HttpHeaders().set("userId", userId),
      }
    );
  }
  updateMessage(data, userId: any): Observable<any> {
    return this.http.put(
      `/appControl/customMessageController/updateCustomMessages`,
      data,
      {
        headers: new HttpHeaders().set("userId", userId),
      }
    );
  }
}
