import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CustomisedMessagesServiceService {
  constructor(private http: HttpClient) {}
  getCustomisedListData() {
    return this.http.get(`/remittance/customMessageController/getMessagesList`);
  }
  getCustomisedDetailsData() {
    return this.http.get(
      `/remittance/customMessageController/getSystemMessageDetails`
    );
  }
  getCustomisedCodeData(messageType: any) {
    return this.http.get(`/remittance/customMessageController/getMessageCode`, {
      headers: new HttpHeaders().set("messageType", messageType),
    });
  }
  getMessageDataForEdit(messageCode: any) {
    return this.http.get(
      `/remittance/customMessageController/getCustomMessagesDetails`,
      {
        headers: new HttpHeaders().set("messageCode", messageCode),
      }
    );
  }
  updateCustomisedListStatus(data: any) {
    return this.http.post(
      `/remittance/customMessageController/updateStatus`,
      data
    );
  }

  addNewMessage(data, userId: any): Observable<any> {
    return this.http.post(
      `/remittance/customMessageController/saveCustomMessages`,
      data,
      {
        headers: new HttpHeaders().set("userId", userId),
      }
    );
  }
  updateMessage(data, userId: any): Observable<any> {
    return this.http.put(
      `/remittance/customMessageController/updateCustomMessages`,
      data,
      {
        headers: new HttpHeaders().set("userId", userId),
      }
    );
  }
}
