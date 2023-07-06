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

  constructor(private groupService: GroupServiceService,private route: ActivatedRoute,private coreService: CoreService,) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.getRoutingapiData();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
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
