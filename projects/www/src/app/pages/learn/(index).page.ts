import { Component } from '@angular/core';
import { EditorComponent } from '@ngrx-io/app/components/learn/editor.component';

@Component({
  selector: 'ngrx-learn-index-page',
  standalone: true,
  imports: [EditorComponent],
  template: ` <ngrx-editor></ngrx-editor> `,
  styles: [
    `
      :host {
        display: grid;
        width: 100%;
        height: 100vh;
        grid-template-areas:
          'editor preview inspector'
          'editor terminal inspector';
        grid-template-columns: 1fr 1fr 220px;
        grid-template-rows: 1fr 300px;
      }

      ngrx-editor {
        grid-area: editor;
      }
    `,
  ],
})
export default class LearnIndexPage {}
