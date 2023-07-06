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

  constructor(private customService: CustomfieldServiceService,private route: ActivatedRoute,private coreService: CoreService,) { }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.getTaxSettingapiData();
    
  }

  Apply(){
console.log("criteriaMapDes",this.criteriaMapDes)
this.customService.getTaxSettingData(this.criteriaMapDes).subscribe((res:any)=> {
  console.log("response ", res);
  if(res.TaxSettingData && res.TaxSettingData.length) {
    this.taxSettingData = res.TaxSettingData;
  } else {
    this.responseMessage = res.msg;
  }
})
  }
  getTaxSettingapiData(){ 
    // let params = "Country = IND;State = KL;City = CHN&&&&from:1::to:10#from:11::to:20";
    let params = "Country = IND ";
  this.customService.getTaxSettingData(params).subscribe((res:any)=> {
    console.log("response ", res);
    if(res.TaxSettingData && res.TaxSettingData.length) {
      this.taxSettingData = res.TaxSettingData;
    } else {
      this.responseMessage = res.msg;
    }
  })
  }
}
