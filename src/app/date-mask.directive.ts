import { AfterViewInit, Directive } from "@angular/core";
import { Calendar } from "primeng/calendar";
import Inputmask from "inputmask";

@Directive({
  selector: "[appDateMask]",
})
export class DateMaskDirective implements AfterViewInit {
  constructor(private primeCalendar: Calendar) {}

  ngAfterViewInit() {
    new Inputmask(this.getDateMask()).mask(this.getHTMLInput());
  }

  getHTMLInput(): HTMLInputElement {
    return this.primeCalendar.el.nativeElement.querySelector("input");
  }

  getDateMask(): string {
    return "99/99/9999";
  }
}
