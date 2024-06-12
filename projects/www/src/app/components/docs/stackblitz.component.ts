import { isPlatformServer } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewEncapsulation,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { ExamplesService } from '@ngrx-io/app/examples/examples.service';

@Component({
  selector: 'ngrx-stackblitz',
  standalone: true,
  template: ` <div #example></div> `,
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      ngrx-example iframe {
        display: block;
        width: 100%;
        height: 800px;
        border: none;
      }
    `,
  ],
})
export class StackblitzComponent implements AfterViewInit {
  examplesService = inject(ExamplesService);
  platformId = inject(PLATFORM_ID);
  name = input.required<string>();
  exampleRef = viewChild.required<ElementRef<HTMLDivElement>>('example');

  ngAfterViewInit(): void {
    if (isPlatformServer(this.platformId)) return;

    this.examplesService.load(this.exampleRef().nativeElement, this.name());
  }
}
