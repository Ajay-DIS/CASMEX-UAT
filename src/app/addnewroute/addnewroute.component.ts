import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PaymentModeServiceService } from '../payment-mode-service.service';


@Component({
  selector: 'app-addnewroute',
  templateUrl: './addnewroute.component.html',
  styleUrls: ['./addnewroute.component.css']
})
export class AddnewrouteComponent implements OnInit {
  criteriaText: any[] = [];
  testData: any[] = [];
  criteriaSetData: any[] = [];
  criteriaOperations: any[] = [];
  clickforsave = false;
  userId = "";
  criteriaName = "";
  criteriaDdlOptions:any = [];
  
  constructor(
    private paymentModeService: PaymentModeServiceService,
    private activatedRoute: ActivatedRoute,private ngxToaster: ToastrService,
  ) { }

  ngOnInit(): void {
    const params = this.activatedRoute.snapshot.params;
    this.userId = localStorage.getItem("loggedInUserId");
    this.getAllTemplates();
    if (params && params.id) {
      this.paymentModeService.getPaymentModeByCriteriaId(params.id).subscribe((response: any) => {
        console.log(response);
        const co = response.cmCriteriaData.cmCriteriaDataDetails[0].operations.split(',')
        this.criteriaOperations = co;
        response.cmCriteriaData.cmCriteriaDataDetails.map((item: any) => {
          this.testData.push(item);
        });
      });
    }

  }
  changeCriteriaFields(criteriaName: any){
    const criteria = this.testData.find(item => item.displayName ===criteriaName)
    this.criteriaOperations = criteria.operations.split(',');
  }
  ondeletecriteria(i){
    this.criteriaText.splice(i,1);
    
  }

  openClickForSave() {
    this.clickforsave = true;
  }

  saveCriteriaAsTemplate(){
    if (this.criteriaName == "") {
      this.ngxToaster.warning("Please select the critera as per your requirement");
      return
    }
    
    const formData = new FormData();
    formData.append("userId", this.userId);
    formData.append("criteriaName", this.criteriaName);
    formData.append("criteriaMap", "Correspodent=sbi;Country=Any;Currency=INR");
    this.paymentModeService.currentCriteriaSaveAsTemplate(formData).subscribe(response=> {
      console.log("respomse", response)
      //this.criteriaDdlOptions.push(payload);//need  to be remove  after sit working
      if(response.msg == "Duplicate criteria, please modify existing criteria") {
        this.ngxToaster.warning(response.msg)
        
      } else {
        this.ngxToaster.success(response.msg)
        this.getAllTemplates();
      }
    })
  }

  getAllTemplates() {
    this.paymentModeService.getAllCriteriaTemplates().subscribe(response=> {
      console.log("response", response)
      if(response.data && response.data.length) {
        this.criteriaDdlOptions = response.data;
      } else {
        this.ngxToaster.warning(response.msg)
      }
      
    })
  }

  selectCriteriaTemplate(item) {
    console.log("event", item)
    let selectedData = this.criteriaDdlOptions.filter(x=> x.criteriaName == item)[0]
    this.criteriaText = selectedData.criteriaMap.split(';')
    console.log("test", this.criteriaText)
  }
}
