import { BrowserModule } from "@angular/platform-browser";
import { DatePipe } from "@angular/common";
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
import { PanelMenuModule } from "primeng/panelmenu";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { ContextMenuModule } from "primeng/contextmenu";
import { MultiSelectModule } from "primeng/multiselect";
import { CardModule } from "primeng/card";
import { BlockUIModule } from "primeng/blockui";
import { BreadcrumbModule } from "primeng/breadcrumb";
import { DynamicDialogModule, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputNumberModule } from "primeng/inputnumber";
import { TooltipModule } from "primeng/tooltip";
import { PickListModule } from "primeng/picklist";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { TreeTableModule } from "primeng/treetable";
import { CheckboxModule } from "primeng/checkbox";
import { TreeSelectModule } from "primeng/treeselect";
import { ToastModule } from "primeng/toast";
import { KeyFilterModule } from "primeng/keyfilter";

import { BnNgIdleService } from "bn-ng-idle";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { PaymentModeComponent } from "./payment-mode-settings/payment-mode/payment-mode.component";
import { ViewPaymentModeComponent } from "./payment-mode-settings/view-payment-mode/view-payment-mode.component";
import { LoginComponent } from "./login/login.component";
import { HttpInterceptorInterceptor } from "./http-interceptor.interceptor";
import { SessionTimeOutComponent } from "./session-time-out/session-time-out.component";
import { CriteriaListingComponent } from "./criteria-settings/criteria-listing/criteria-listing.component";
import { CriteriaSettingsDetailComponent } from "./criteria-settings/criteria-settings-detail/criteria-settings-detail.component";
import { TaxListingComponent } from "./tax-settings/tax-listing/tax-listing.component";
import { BankRoutingComponent2 } from "./banks-routing-2/bank-routing/bank-routing.component";
import { AddnewrouteComponent2 } from "./banks-routing-2/addnewroute/addnewroute.component";
import { SetCriteriaComponent } from "./shared/components/set-criteria/set-criteria.component";
import { TransactionCriteriaModal } from "./shared/modals/transaction-criteria-modal/transaction-criteria-modal";
import { AddNewTaxComponent } from "./tax-settings/add-new-tax/add-new-tax.component";
import { MessageService } from "primeng/api";
import { AddNewFormRuleComponent } from "./form-rules/add-new-form-rule/add-new-form-rule.component";
import { FormRuleListingComponent } from "./form-rules/form-rule-listing/form-rule-listing.component";
import { GroupSettingsComponent } from "./group-settings/group-settings.component";
import { CustomerProfileComponent } from "./customer-profile/customer-profile.component";
import { AddCustomerComponent } from "./customer-profile/add-customer/add-customer.component";
import { PanelModule } from "primeng/panel";
import { TabViewModule } from "primeng/tabview";
import { CalendarModule } from "primeng/calendar";
import {InputMaskModule} from 'primeng/inputmask';
import { FileUploadModule } from "primeng/fileupload";
import { SearchListingComponent } from "./search-settings/search-listing/search-listing.component";
import { AddNewSearchComponent } from "./search-settings/add-new-search/add-new-search.component";
import { CustomFieldsComponent } from "./custom-fields/custom-fields.component";
import { CustomFormComponent } from "./custom-form/custom-form.component";
import { CorporateComponent } from './customer-profile/corporate/corporate.component';
import { UserIdleModule } from "angular-user-idle";

import { SearchListingComponent } from './search-settings/search-listing/search-listing.component';
import { AddNewSearchComponent } from './search-settings/add-new-search/add-new-search.component';
import { CustomFieldsComponent } from './custom-fields/custom-fields.component';
import { CustomFormComponent } from './custom-form/custom-form.component';
import { CorporateComponent } from './customer-profile/corporate/corporate.component';
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
    LoginComponent,
    SessionTimeOutComponent,
    CriteriaListingComponent,
    CriteriaSettingsDetailComponent,
    TaxListingComponent,
    BankRoutingComponent2,
    AddnewrouteComponent2,
    TransactionCriteriaModal,
    SetCriteriaComponent,
    AddNewTaxComponent,
    AddNewFormRuleComponent,
    FormRuleListingComponent,
    GroupSettingsComponent,
    CustomerProfileComponent,
    AddCustomerComponent,
    SearchListingComponent,
    AddNewSearchComponent,
    CustomFieldsComponent,
    CustomFormComponent,
    CorporateComponent,
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
    BreadcrumbModule,
    DynamicDialogModule,
    InputNumberModule,
    TooltipModule,
    PickListModule,
    ConfirmDialogModule,
    TreeTableModule,
    InputMaskModule,
    CheckboxModule,
    TreeSelectModule,
    ToastModule,
    KeyFilterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    PanelMenuModule,
    DialogModule,
    PanelModule,
    TabViewModule,
    CalendarModule,
    FileUploadModule,
    UserIdleModule.forRoot({ idle: 1680, timeout: 120, ping: 1500 }),
  ],
  providers: [
    BnNgIdleService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorInterceptor,
      multi: true,
    },
    DatePipe,
    MessageService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
