import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-file-upload",
  templateUrl: "./file-upload.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploadComponent,
      multi: true,
    },
  ],
  styleUrls: ["./file-upload.component.scss"],
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input("uploadedFileName") uploadedFileName: string | null = null;
  @Input("hasError") hasError: boolean | null = null;

  @Output("fileNameToView") fileNameToView: EventEmitter<string> =
    new EventEmitter();

  onChange: Function;
  file: File | null = null;

  @HostListener("change", ["$event.target.files"]) emitFiles(event: FileList) {
    console.log(":;", event);
    if (event.length > 0) {
      const file = event && event.item(0);
      this.onChange(file);
      this.file = file;
    }
  }

  constructor(private host: ElementRef<HTMLInputElement>) {}

  writeValue(value: null) {
    // clear file input
    this.host.nativeElement.value = "";
    this.file = null;
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {}
}
