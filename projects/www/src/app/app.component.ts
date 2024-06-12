import { Component, Injector, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { createCustomElement } from '@angular/elements';
import { MenuComponent } from './components/menu.component';
import { SymbolLinkComponent } from './components/docs/symbol-link.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'www-root',
  standalone: true,
  imports: [RouterOutlet, MenuComponent, SymbolLinkComponent],
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
      const symbolLinkElement = createCustomElement(SymbolLinkComponent, {
        injector: this.injector,
      });
      customElements.define('ngrx-docs-symbol-link', symbolLinkElement);
    }
  }
}
