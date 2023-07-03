import { Component, OnInit } from '@angular/core';
import { GroupServiceService } from './group-service.service';

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

  constructor(private groupService: GroupServiceService,) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.getRoutingapiData();
  }

  Apply(){
console.log("criteriaMapDes",this.criteriaMapDes)
this.groupService.getRoutingData(this.criteriaMapDes).subscribe((res:any)=> {
  console.log("response ", res);
  if(res.RouteData && res.RouteData.length) {
    this.routingData = res.RouteData;
  } else {
    this.responseMessage = res.msg;
  }
})
  }

  getRoutingapiData(){ 
    // let params = "'Coundstry'='IND'";
    let params = "Coundtry = IND";
  this.groupService.getRoutingData(params).subscribe((res:any)=> {
    console.log("response ", res);
    if(res.RouteData && res.RouteData.length) {
      this.routingData = res.RouteData;
    } else {
      this.responseMessage = res.msg;
    }
  })
  }
}
