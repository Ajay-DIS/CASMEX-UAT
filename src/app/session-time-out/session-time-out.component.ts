import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CoreService } from "../core.service";

@Component({
  selector: "app-session-time-out",
  templateUrl: "./session-time-out.component.html",
  styleUrls: ["./session-time-out.component.scss"],
})
export class SessionTimeOutComponent implements OnInit {
  constructor(private router: Router, private coreService: CoreService) {}

  ngOnInit(): void {
    this.coreService.removeLoadingScreen();
  }

  onSubmit() {
    this.router.navigate(["login"]);
  }
}
