import { Component, NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./auth/auth.guard";
import { LoginComponent } from "./login/login.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { PaymentModeComponent } from "./payment-mode-settings/payment-mode/payment-mode.component";
import { ViewPaymentModeComponent } from "./payment-mode-settings/view-payment-mode/view-payment-mode.component";
import { SessionTimeOutComponent } from "./session-time-out/session-time-out.component";
import { CriteriaListingComponent } from "./criteria-settings/criteria-listing/criteria-listing.component";
import { CriteriaSettingsDetailComponent } from "./criteria-settings/criteria-settings-detail/criteria-settings-detail.component";
import { TaxListingComponent } from "./tax-settings/tax-listing/tax-listing.component";
import { BankRoutingComponent2 } from "./banks-routing-2/bank-routing/bank-routing.component";
import { AddnewrouteComponent2 } from "./banks-routing-2/addnewroute/addnewroute.component";
import { AddNewTaxComponent } from "./tax-settings/add-new-tax/add-new-tax.component";
import { AddNewFormRuleComponent } from "./form-rules/add-new-form-rule/add-new-form-rule.component";
import { FormRuleListingComponent } from "./form-rules/form-rule-listing/form-rule-listing.component";
import { GroupSettingsComponent } from "./group-settings/group-settings.component";
import { CustomerProfileComponent } from "./customer-profile/customer-profile.component";
import { AddCustomerComponent } from "./customer-profile/add-customer/add-customer.component";
import { SearchListingComponent } from "./search-settings/search-listing/search-listing.component";
import { AddNewSearchComponent } from "./search-settings/add-new-search/add-new-search.component";
import { CustomFieldsComponent } from "./custom-fields/custom-fields.component";
import { CustomFormComponent } from "./custom-form/custom-form.component";
import { BeneficiaryProfileComponent } from "./beneficiary-profile/beneficiary-profile.component";
import { AddBeneficiaryComponent } from "./beneficiary-profile/add-beneficiary/add-beneficiary.component";
import { DocumentListingComponent } from "./document-settings/document-listing/document-listing.component";
import { DocumentDetailsComponent } from "./document-settings/document-details/document-details.component";
import { GetDocSettingsComponent } from "./get-doc-settings/get-doc-settings.component";

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "login", component: LoginComponent, canActivate: [AuthGuard] },
  {
    path: "navbar",
    component: NavbarComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "", redirectTo: "bank-routing", pathMatch: "full" },
      { path: "session-time-out", component: SessionTimeOutComponent },
      {
        path: "payment-mode",
        component: PaymentModeComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "view-payment-mode/:id",
        component: ViewPaymentModeComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "criteria-settings",
        component: CriteriaListingComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Application Settings", routerLink: "criteria-settings" },
          { label: "Criteria", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "criteria-settings/add-criteria-settings/add",
        component: CriteriaSettingsDetailComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          {
            label: "Application Settings",
            routerLink: "../navbar/criteria-settings",
          },
          { label: "Criteria", routerLink: "criteria-settings" },
          { label: "Add Criteria settings", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "criteria-settings/add-criteria-settings/:id/clone",
        component: CriteriaSettingsDetailComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          {
            label: "Application Settings",
            routerLink: "../navbar/criteria-settings",
          },
          { label: "Criteria", routerLink: "criteria-settings" },
          { label: "Clone Criteria settings", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "criteria-settings/add-criteria-settings/:id/edit",
        component: CriteriaSettingsDetailComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          {
            label: "Application Settings",
            routerLink: "../navbar/criteria-settings",
          },
          { label: "Criteria", routerLink: "criteria-settings" },
          { label: "Edit Criteria settings", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "authorization-page-setting",
        component: CustomFormComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          {
            label: "Application Settings",
            routerLink: "authorization-page-setting",
          },
          { label: "Get Form Rules", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "custom-fields",
        component: CustomFieldsComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Application Settings", routerLink: "custom-fields" },
          { label: "Tax Setting", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "get-doc-settings",
        component: GetDocSettingsComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Application Settings", routerLink: "get-doc-settings" },
          { label: "Get Doc Settings", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "search-settings",
        component: SearchListingComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Application Settings", routerLink: "search-settings" },
          { label: "Search settings", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "search-settings/add-search-settings/add",
        component: AddNewSearchComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          {
            label: "Application Settings",
            routerLink: "../navbar/search-settings",
          },
          { label: "Search settings", routerLink: "search-settings" },
          { label: "Add Search settings", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "search-settings/add-search-settings/:id/edit",
        component: AddNewSearchComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          {
            label: "Application Settings",
            routerLink: "../navbar/search-settings",
          },
          { label: "Search settings", routerLink: "search-settings" },
          { label: "Edit Search settings", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "bank-routing",
        component: BankRoutingComponent2,
        data: [
          { label: "Home", routerLink: "/navbar/bank-routing" },
          { label: "Settings", routerLink: "/navbar/bank-routing" },
          { label: "Bank Routing", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "bank-routing/addnewroute",
        component: AddnewrouteComponent2,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/bank-routing" },
          { label: "Bank Routing", routerLink: "bank-routing" },
          { label: "Add New Route", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "bank-routing/addnewroute/:id/edit",
        component: AddnewrouteComponent2,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/bank-routing" },
          { label: "Bank Routing", routerLink: "bank-routing" },
          { label: "Edit Route", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "bank-routing/addnewroute/:id/clone",
        component: AddnewrouteComponent2,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/bank-routing" },
          { label: "Bank Routing", routerLink: "bank-routing" },
          { label: "Clone Route", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "tax-settings",
        component: TaxListingComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/tax-settings" },
          { label: "Tax Settings", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "tax-settings/add-tax",
        component: AddNewTaxComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/tax-settings" },
          { label: "Tax Settings", routerLink: "tax-settings" },
          { label: "Add New Tax", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "tax-settings/add-tax/:id/edit",
        component: AddNewTaxComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/tax-settings" },
          { label: "Tax Settings", routerLink: "tax-settings" },
          { label: "Edit Tax", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "tax-settings/add-tax/:id/clone",
        component: AddNewTaxComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/tax-settings" },
          { label: "Tax Settings", routerLink: "tax-settings" },
          { label: "Clone Tax", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "form-rules",
        component: FormRuleListingComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/form-rules" },
          { label: "Form Rules", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "form-rules/addnewformrule",
        component: AddNewFormRuleComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/form-rules" },
          { label: "Form Rules", routerLink: "form-rules" },
          { label: "Add New Form Rule", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "form-rules/addnewformrule/:id/edit",
        component: AddNewFormRuleComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/form-rules" },
          { label: "Form Rules", routerLink: "form-rules" },
          { label: "Edit Form Rule", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "form-rules/addnewformrule/:id/clone",
        component: AddNewFormRuleComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/form-rules" },
          { label: "Form Rules", routerLink: "form-rules" },
          { label: "Clone Form Rule", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "group-settings",
        component: GroupSettingsComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Application Settings", routerLink: "group-settings" },
          { label: "Bank Routing", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "customer-profile",
        component: CustomerProfileComponent,
        data: [
          { label: "Home", routerLink: "../navbar/customer-profile" },
          {
            label: "Customer Profile",
            routerLink: "../navbar/customer-profile",
          },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "customer-profile/addnewcustomer",
        component: AddCustomerComponent,
        data: [
          { label: "Home", routerLink: "../navbar/customer-profile" },
          {
            label: "Customer Profile",
            routerLink: "../navbar/customer-profile",
          },
          { label: "Add Customer", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "customer-profile/addnewcustomer/:type/:id/edit",
        component: AddCustomerComponent,
        data: [
          { label: "Home", routerLink: "../navbar/customer-profile" },
          {
            label: "Customer Profile",
            routerLink: "../navbar/customer-profile",
          },
          { label: "Edit Customer", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "beneficiary-profile",
        component: CustomerProfileComponent,
        data: [
          { label: "Home", routerLink: "../navbar/customer-profile" },
          {
            label: "Beneficiary Profile",
            routerLink: "../navbar/customer-profile",
          },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "beneficiary-profile/addnewbeneficiary/:type/:id/:name/add",
        component: AddBeneficiaryComponent,
        data: [
          { label: "Home", routerLink: "../navbar/customer-profile" },
          {
            label: "Beneficiary Profile",
            routerLink: "../navbar/customer-profile",
          },
          { label: "Add Beneficiary", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "beneficiary-profile/addnewbeneficiary/:type/:id/:name/:benefid/edit",
        component: AddBeneficiaryComponent,
        data: [
          { label: "Home", routerLink: "../navbar/customer-profile" },
          {
            label: "Beneficiary Profile",
            routerLink: "../navbar/customer-profile",
          },
          { label: "Edit Beneficiary", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "document-settings",
        component: DocumentListingComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/document-settings" },
          { label: "Document Settings", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "document-settings/add-document",
        component: DocumentDetailsComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/document-settings" },
          { label: "Document Settings", routerLink: "document-settings" },
          { label: "Add Document Settings", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "document-settings/add-document/:id/edit",
        component: DocumentDetailsComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/document-settings" },
          { label: "Document Settings", routerLink: "document-settings" },
          { label: "Edit Document Settings", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "document-settings/add-document/:id/clone",
        component: DocumentDetailsComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/document-settings" },
          { label: "Document Settings", routerLink: "document-settings" },
          { label: "Clone Document Settings", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
