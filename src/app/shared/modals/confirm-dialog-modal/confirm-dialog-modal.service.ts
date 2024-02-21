import { EventEmitter, Injectable } from "@angular/core";
import { ConfirmationService } from "primeng/api";

@Injectable({
  providedIn: "root",
})
export class ConfirmDialogModalService {
  confirmEvent: EventEmitter<void> = new EventEmitter();

  constructor(private confirmationService: ConfirmationService) {}

  confirm(
    message: string,
    options: {
      header?: string;
      acceptLabel?: string;
      rejectLabel?: string;
      acceptIcon?: string;
      rejectIcon?: string;
    } = {}
  ) {
    const { header, acceptLabel, rejectLabel, acceptIcon, rejectIcon } =
      options;

    this.confirmationService.confirm({
      message: message,
      header: header || "Confirmation",
      acceptLabel: acceptLabel || "Yes",
      rejectLabel: rejectLabel || "No",
      acceptIcon: acceptIcon || "pi pi-check",
      rejectIcon: rejectIcon || "pi pi-times",
      accept: () => {
        this.confirmEvent.emit();
      },
    });
  }
}
