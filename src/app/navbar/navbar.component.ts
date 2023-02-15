import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { PaymentModeServiceService } from '../payment-mode-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit {
  @ViewChild('toggleSidebar') toggleSidebarBtn: ElementRef;
  @ViewChild('sidebarDiv') sidebarDiv: ElementRef;

  
  getdata: any;
  cities1: any[];
  response: any;
  ispaymentMode: boolean = true;
  isviewPaymentMode: boolean = false;
  menuItems: MenuItem[] = [];
  menuItemTree = {
    // "Dashboard": [],
    // "Customer Profile": [],
    // "Rate Setup": [
    //   "Rate & Margin Setup",
    //   "Rate & Margin Settings",
    //   "Rate Heirarchy Settings"
    // ],
    // "Forex": [],
    // "Beneficiary Profile": [],
    // "Remmitance": [
    //   "Transaction ",
    //   "Payment For Customer",
    //   "Amendment",
    //   "Cancellation",
    //   "Payment to Customer"
    // ],
    // "Customer Service": [
    //   "Transaction Enquiry ( Receipt Reprint)",
    //   "Complaints",
    //   "Rate View"
    // ],
    // "Approval & Authorization": [],
    // "Settings": [
    //   "Tax",
    //   "Charge",
    //   "Payment Mode",
    //   "Discount",
    //   "Block Transaction",
    //   "Purpose",
    //   "Document",
    //   "Source",
    //   "Form Rules"
    // ],
    // "Application Settings": [
    //   "Custom Fields",
    //   "Group Settings",
    //   "Search Settings",
    //   "Authorization Page Setting"
    // ],
    // "User Roles Management": [
    //   "User Roles & Permissions"
    // ],
    // "Reports": [],
    // "Accounts": [],
    // "Incoming": [],
    // "Alerts & Notification": []
  }
  profileOptions:any = [
    {name: "Profile"}, {name: "Logout"}
  ]
  
  constructor(
    private payment: PaymentModeServiceService,
    public translate: TranslateService,
    private httpClient: HttpClient,
    private el: ElementRef,
    private router: Router,private ngxToaster: ToastrService
    ) {
      this.cities1 = [
        {label:'English', value:'en'},
        {label:'Arabic', value:'ar'},
        {label:'Germany ', value:'de'},
        
    ];
    translate.addLangs(['en', 'ar','de']);
      translate.setDefaultLang('en');
  
      const browserLang = translate.getBrowserLang();
      translate.use(browserLang.match(/en|ar|de/) ? browserLang : 'en');
     }

  ngOnInit(): void {
    let token = localStorage.getItem('token');
    let isTokenExpired = this.isTokenExpired(token);
    console.log("isTokenExpired", isTokenExpired)
    if(isTokenExpired) {
      localStorage.removeItem('token');
      this.ngxToaster.error("Your Session has been Expired, Please login again")
      this.router.navigate(['login']);
      
    }
    if(!!localStorage.getItem('menuItems')){
      const menuItems = localStorage.getItem('menuItems')
      this.menuItemTree = JSON.parse(menuItems)
    }
    Object.keys(this.menuItemTree).map(menu => {
      if(this.menuItemTree[menu].length > 0){
        const submenus = []
        this.menuItemTree[menu].map(sub=> {
          submenus.push({label: sub});
        })
        this.menuItems.push({label: menu,icon: this.getIcons(menu).icon, items: submenus})
      } else {
        this.menuItems.push({label: menu, icon: this.getIcons(menu).icon, routerLink: this.getIcons(menu).routerLink})
      }
    });
    console.log(this.menuItems)
  }

  isTokenExpired(token: string) {
    //console.log("token in navbar", token);
    let expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    if (new Date(expiry * 1000).getTime() < Date.now()) {
      return true;
    } else {return false}
  }

  ngAfterViewInit() {
    const sidebar = this.sidebarDiv.nativeElement;
    const bodyTag = this.el.nativeElement.closest('body')
    this.toggleSidebarBtn.nativeElement.addEventListener('click', ()=>{
      if(bodyTag.classList.contains('minified-sidebar')){
        bodyTag.classList.remove('minified-sidebar')
      }else{
        bodyTag.classList.add('minified-sidebar')
      }
    })
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const sidebar = this.sidebarDiv.nativeElement;
    const bodyTag = this.el.nativeElement.closest('body')
    let widerThan1200 = window.matchMedia("(min-width: 1200px)")
    let thinThan1200 = window.matchMedia("(max-width: 1199px)")
    if(widerThan1200.matches && bodyTag.classList.contains('minified-sidebar')){
      bodyTag.classList.remove('minified-sidebar')
    }else if(thinThan1200.matches && !bodyTag.classList.contains('minified-sidebar')){
      bodyTag.classList.add('minified-sidebar')
    }
  }


  getIcons(menuName){
    let iconName;
    let routeName;
    switch (menuName) {
      case 'Dashboard':
        iconName = 'dashboard-icon';
        routeName = '../login';
        break;
        case 'Customer Profile':
          iconName = 'customerDetails-icon';
          break;
        case 'Rate Setup':
          iconName = 'rateSetup-icon';
         break;
        case 'Forex':
          iconName = 'forex-icon';
         break;
        case 'Beneficiary Profile':
          iconName = 'beneficiary-icon';
         break;
        case 'Remmitance':
          iconName = 'remmitance-icon';
         break;
        case 'Customer Service':
          iconName = 'customerDetails-icon';
         break;
        case 'Settings':
          iconName = 'settings-icon';
         break;
        case 'Application Settings':
          iconName = 'applicationsettings-icon';
         break;
        case 'User Roles Management':
          iconName = 'rateSetup-icon';
         break;
        case 'Reports':
          iconName = 'reports-icon';
         break;
        case 'Accounts':
          iconName = 'Accounts-icon';
         break;
        case 'Incoming':
          iconName = 'Incoming-icon';
         break;
        
        
    }
    return {icon:iconName, routerLink: routeName}
  }
  viewPayment() {
    this.ispaymentMode = false;
    this.isviewPaymentMode = true;
  }
  onChange(item:any){
    this.translate.use(item.value)
  }

  selectProfileOption(data) {
    console.log("event",data );
    if(data && data.name == "Logout") {
      localStorage.removeItem('token');
      this.ngxToaster.error("Logged Out Successfully.")
      this.router.navigate(['login']);
    }
  }
}
