import { Component, OnInit } from '@angular/core';
import { GroupServiceService } from './group-service.service';
import { ActivatedRoute } from '@angular/router';
import { CoreService } from '../core.service';

@Component({
  selector: 'app-group-settings',
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.scss']
})
export class GroupSettingsComponent implements OnInit {
  products:any=[];
  routingData: any=[];
  userData: any = {};
  responseMessage = "";

  criteriaMapDes = "";

  appName ="Casmex Core";
  moduleName ="Remittance";
  formName = "Bank Routings";

  constructor(private groupService: GroupServiceService,private route: ActivatedRoute,private coreService: CoreService,) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem("userData"));
    // this.getRoutingapiData();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
  }

  Apply(){
    
this.groupService.getRoutingData(this.criteriaMapDes,this.appName, this.moduleName,this.formName).subscribe((res:any)=> {
  if(res.RouteData && res.RouteData.length) {
    this.routingData = res.RouteData;
  } else {
    this.responseMessage = res.msg;
  }
})
  }

  getRoutingapiData(appValue: any, moduleValue: any){ 
    let params =
    ["Country = IND;Organization = ICICI&&&&from:1::to:2",
    "Country = IND;Organization = ICICI&&&&LCY Amount = 3000"];
  this.groupService.getRoutingData(params,appValue, moduleValue,this.formName).subscribe((res:any)=> {
    console.log("response ", res);
    if(res.RouteData && res.RouteData.length) {
      this.routingData = res.RouteData;
    } else {
      this.responseMessage = res.msg;
    }
  })
  }
}
