import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TableModule } from "primeng/table";
import {SidebarModule} from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import {TreeModule} from 'primeng/tree';
import { ToastrModule } from 'ngx-toastr';
import {PanelMenuModule} from 'primeng/panelmenu';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {ContextMenuModule} from 'primeng/contextmenu';
import { DialogModule } from "primeng/dialog";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PaymentModeComponent } from './payment-mode/payment-mode.component';
import { ViewPaymentModeComponent } from './view-payment-mode/view-payment-mode.component';
// import { NewNavComponent } from './new-nav/new-nav.component';
import { LoginComponent } from './login/login.component';
// import { SidebarComponent } from './sidebar/sidebar.component';
import { HttpInterceptorInterceptor } from './http-interceptor.interceptor';
import { BankRoutingComponent } from './bank-routing/bank-routing.component';
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
      provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorInterceptor, multi:true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
