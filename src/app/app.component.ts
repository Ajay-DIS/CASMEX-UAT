import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { CoreService } from "./core.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit, AfterContentChecked {
  constructor(
    private coreService: CoreService,
    private ref: ChangeDetectorRef
  ) {}
  title = "casmex";

  blocked: boolean;

  ngOnInit() {
    this.coreService.$loadingScreen.subscribe((isLoading) => {
      this.blocked = isLoading;
    });
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }
}
