import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor() { }

  $loadingScreen = new BehaviorSubject<boolean>(false);

  displayLoadingScreen(){
    this.$loadingScreen.next(true)
  }
  removeLoadingScreen(){
    this.$loadingScreen.next(false)
  }
}
