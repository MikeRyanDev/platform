import { Component } from '@angular/core';
import { StackblitzComponent } from '@ngrx-io/app/components/docs/stackblitz.component';

@Component({
  selector: 'ngrx-learn-index-page',
  standalone: true,
  imports: [StackblitzComponent],
  template: ` <ngrx-stackblitz name="signals-01"></ngrx-stackblitz> `,
})
export default class LearnIndexPage {}
