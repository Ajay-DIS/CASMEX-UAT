import { Component, NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AddnewrouteComponent } from "./banks-routing/addnewroute/addnewroute.component";
import { AuthGuard } from "./auth/auth.guard";
import { BankRoutingComponent } from "./banks-routing/bank-routing/bank-routing.component";
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

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "login", component: LoginComponent, canActivate: [AuthGuard] },
  {
    path: "navbar",
    component: NavbarComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "", redirectTo: "bank-routing-2", pathMatch: "full" },
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
        path: "bank-routing",
        component: BankRoutingComponent,
        data: [
          { label: "Home", routerLink: "/navbar/bank-routing" },
          { label: "Settings", routerLink: "/navbar/bank-routing" },
          { label: "Bank Routing", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "bank-routing/addnewroute",
        component: AddnewrouteComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/bank-routing" },
          { label: "Bank Routing", routerLink: "bank-routing" },
          { label: "Add New Route", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "bank-routing/addnewroute/:id",
        component: AddnewrouteComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/bank-routing" },
          { label: "Bank Routing", routerLink: "bank-routing" },
          { label: "Edit Route", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "bank-routing-2",
        component: BankRoutingComponent2,
        data: [
          { label: "Home", routerLink: "/navbar/bank-routing-2" },
          { label: "Settings", routerLink: "/navbar/bank-routing-2" },
          { label: "Bank Routing", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "bank-routing-2/addnewroute",
        component: AddnewrouteComponent2,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/bank-routing" },
          { label: "Bank Routing-2", routerLink: "bank-routing" },
          { label: "Add New Route-2", routerLink: "" },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: "bank-routing-2/addnewroute/:id",
        component: AddnewrouteComponent2,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "../navbar/bank-routing" },
          { label: "Bank Routing-2", routerLink: "bank-routing" },
          { label: "Edit Route-2", routerLink: "" },
        ],
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
        path: "tax-settings",
        component: TaxListingComponent,
        data: [
          { label: "Home", routerLink: "../navbar/bank-routing" },
          { label: "Settings", routerLink: "tax-settings" },
          { label: "Tax Settings", routerLink: "" },
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
