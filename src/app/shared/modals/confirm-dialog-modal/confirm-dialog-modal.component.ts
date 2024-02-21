import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-confirm-dialog-modal",
  templateUrl: "./confirm-dialog-modal.component.html",
  styleUrls: ["./confirm-dialog-modal.component.scss"],
})
export class ConfirmDialogModalComponent {
  @Input() key: string = "confirmDialog";
  @Input() header: string = "Confirmation";
  @Input() dialogWidth: string = "300px";
  @Input() acceptLabel: string = "Yes";
  @Input() rejectLabel: string = "No";
  @Input() acceptIcon: string = "pi pi-check";
  @Input() rejectIcon: string = "pi pi-times";
  @Output() confirm = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();

  isVisible: boolean = false;

  constructor(private coreService: CoreService) {}

  show() {
    console.log(":::visible", this.isVisible);
    this.isVisible = true;
    this.coreService.setHeaderStickyStyle(false);
    this.coreService.setSidebarBtnFixedStyle(false);
  }

  hide() {
    this.isVisible = false;
    this.setHeaderSidebarBtn();
  }

  onConfirm() {
    this.confirm.emit();
    this.hide();
  }

  onReject() {
    this.reject.emit();
    this.hide();
  }

  onHide() {
    this.hide();
  }

  setHeaderSidebarBtn() {
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    setTimeout(() => {
      this.coreService.removeLoadingScreen();
    }, 1000);
  }
}
