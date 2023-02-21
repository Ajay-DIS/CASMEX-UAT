import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from "@angular/common/http";
import { FormsModule, NgModel, ReactiveFormsModule } from "@angular/forms";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";

import { SidebarModule } from "primeng/sidebar";
import { ButtonModule } from "primeng/button";
import { TreeModule } from "primeng/tree";
import { ToastrModule } from "ngx-toastr";
import { PanelMenuModule } from "primeng/panelmenu";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { ContextMenuModule } from "primeng/contextmenu";
import { MultiSelectModule } from "primeng/multiselect";
import { CardModule } from "primeng/card";
import { BlockUIModule } from "primeng/blockui";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { PaymentModeComponent } from "./payment-mode-settings/payment-mode/payment-mode.component";
import { ViewPaymentModeComponent } from "./payment-mode-settings/view-payment-mode/view-payment-mode.component";
import { LoginComponent } from "./login/login.component";
import { HttpInterceptorInterceptor } from "./http-interceptor.interceptor";
import { BankRoutingComponent } from "./banks-routing/bank-routing/bank-routing.component";
import { AddnewrouteComponent } from './addnewroute/addnewroute.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    PaymentModeComponent,
    ViewPaymentModeComponent,
    // NewNavComponent,
    LoginComponent,
    BankRoutingComponent,
    AddnewrouteComponent,
    // SidebarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    TableModule,
    DropdownModule,
    FormsModule,
    SidebarModule,
    ButtonModule,
    TreeModule,
    ReactiveFormsModule,
    InputTextModule,
    ContextMenuModule,
    MultiSelectModule,
    CardModule,
    BlockUIModule,
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
  }),
  PanelMenuModule,
  DialogModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
