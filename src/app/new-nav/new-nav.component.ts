import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {SelectItem} from 'primeng/api';
interface City {
  name: string;
  code: string;
}
@Component({
  selector: 'app-new-nav',
  templateUrl: './new-nav.component.html',
  styleUrls: ['./new-nav.component.css']
})
export class NewNavComponent implements OnInit {
  getdata: any;
  response: any;
  ispaymentMode: boolean=true;
  isviewPaymentMode: boolean=false;
  cities1: any[];
  value1: string ='en';
  constructor(public translate: TranslateService) {
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
  }
  viewPayment(){
    this.ispaymentMode=false;
    this.isviewPaymentMode=true;
  }
  onChange(item:any){
    this.translate.use(item.value)
  }
}
