import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-session-time-out",
  templateUrl: "./session-time-out.component.html",
  styleUrls: ["./session-time-out.component.scss"],
})
export class SessionTimeOutComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  onSubmit() {
    this.router.navigate(["login"]);
  }
}
