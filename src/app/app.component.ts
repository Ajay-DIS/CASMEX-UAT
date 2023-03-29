import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { AuthService } from "./auth/auth.service";
import { CoreService } from "./core.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit, AfterContentChecked {
  constructor(
    private coreService: CoreService,
    private ref: ChangeDetectorRef,
    private authService: AuthService
  ) {}
  title = "casmex";

  blocked: boolean;

  ngOnInit() {
    this.authService.autoLogin();
    this.coreService.$loadingScreen.subscribe((isLoading) => {
      this.blocked = isLoading;
    });
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }
}
