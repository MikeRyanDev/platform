import { Component, Injector, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { createCustomElement } from '@angular/elements';
import { isPlatformBrowser } from '@angular/common';
import { MenuComponent } from './components/menu.component';
import { MarkdownSymbolLinkComponent } from './components/docs/markdown-symbol-link.component';
import { AlertComponent } from './components/docs/alert.component';
import { CodeExampleComponent } from './components/docs/code-example.component';

@Component({
  selector: 'www-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MenuComponent,
    MarkdownSymbolLinkComponent,
    AlertComponent,
    CodeExampleComponent,
  ],
  template: `
    <ngrx-menu></ngrx-menu>
    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        width: calc(100lvw - 124px);
        left: 124px;
      }

      ngrx-menu {
        position: fixed;
        top: 0;
        left: 0;
      }
    `,
  ],
})
export class AppComponent {
  injector = inject(Injector);
  platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const symbolLinkElement = createCustomElement(
        MarkdownSymbolLinkComponent,
        {
          injector: this.injector,
        }
      );
      customElements.define('ngrx-docs-symbol-link', symbolLinkElement);

      const alertElement = createCustomElement(AlertComponent, {
        injector: this.injector,
      });
      customElements.define('ngrx-alert', alertElement);

      const codeExampleElement = createCustomElement(CodeExampleComponent, {
        injector: this.injector,
      });
      customElements.define('ngrx-code-example', codeExampleElement);
    }
  }
}
