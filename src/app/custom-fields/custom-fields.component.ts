import { Component, OnInit } from '@angular/core';
import { CustomfieldServiceService } from './customfield-service.service';
import { ActivatedRoute } from '@angular/router';
import { CoreService } from '../core.service';

@Component({
  selector: 'app-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.scss']
})
export class CustomFieldsComponent implements OnInit {

  products:any=[];
  taxSettingData: any=[];
  userData: any = {};
  responseMessage = "";

  criteriaMapDes = "";

  appName ="Casmex Core";
  moduleName ="Remittance";
  formName = "Tax Settings";

  constructor(private customService: CustomfieldServiceService,private route: ActivatedRoute,private coreService: CoreService,) { }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userData = JSON.parse(localStorage.getItem("userData"));
    // this.getTaxSettingapiData();
    
  }

  Apply(){
console.log("criteriaMapDes",this.criteriaMapDes)
this.customService.getTaxSettingData(this.criteriaMapDes,this.appName, this.moduleName,this.formName).subscribe((res:any)=> {
  console.log("response ", res);
  if(res.TaxSettingData && res.TaxSettingData.length) {
    this.taxSettingData = res.TaxSettingData;
  } else {
    this.responseMessage = res.msg;
  }
})
  }
  getTaxSettingapiData(appValue: any, moduleValue: any){ 
    // let params = "Country = IND;State = KL;City = CHN&&&&from:1::to:10#from:11::to:20";
    let params = [
    "Country = USA",
    "Country = IND&&&&from:1::to:2",
    "Country = IND&&&&from:2::to:3",
    "Country = IND;Amount Type = Equivalent local Amount;Customer Type = COR;State = MP&&&&LCY Amount = 21;LCY Amount > 212"];
  this.customService.getTaxSettingData(params,appValue, moduleValue,this.formName).subscribe((res:any)=> {
    console.log("response ", res);
    if(res.TaxSettingData && res.TaxSettingData.length) {
      this.taxSettingData = res.TaxSettingData;
    } else {
      this.responseMessage = res.msg;
    }
  })
  }
}
