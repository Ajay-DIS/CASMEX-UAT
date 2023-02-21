import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddnewrouteComponent } from './addnewroute/addnewroute.component';
import { AuthGuard } from './auth/auth.guard';
import { BankRoutingComponent } from './banks-routing/bank-routing/bank-routing.component';
import { LoginComponent } from './login/login.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PaymentModeComponent } from './payment-mode-settings/payment-mode/payment-mode.component';
// import { SidebarComponent } from './sidebar/sidebar.component';
import { ViewPaymentModeComponent } from './payment-mode-settings/view-payment-mode/view-payment-mode.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // { path: 'sidebar', component: SidebarComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  {
    path: 'navbar', component: NavbarComponent, canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'bank-routing', pathMatch: 'full' },
      { path: 'payment-mode', component: PaymentModeComponent, canActivate: [AuthGuard] },
      { path: 'view-payment-mode/:id', component: ViewPaymentModeComponent, canActivate: [AuthGuard] },
      { path: 'bank-routing', component: BankRoutingComponent, canActivate: [AuthGuard] },
      { path: 'addnewroute', component: AddnewrouteComponent, canActivate:[AuthGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
