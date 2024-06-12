import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

type Link = { kind: 'link'; url: string; text: string };
type Section = { kind: 'section'; title: string; children: (Link | Section)[] };
const link = (text: string, url: string): Link => ({ kind: 'link', url, text });
const section = (title: string, children: (Link | Section)[]): Section => ({
  kind: 'section',
  title,
  children,
});

@Component({
  selector: 'ngrx-guide-menu-link',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <a
      [routerLink]="url()"
      routerLinkActive="active"
      [routerLinkActiveOptions]="{ exact: true }"
    >
      <ng-content></ng-content>
    </a>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      a {
        display: block;
        color: rgba(255, 255, 255, 0.56);
        transition: color 0.2s;
      }

      a.active,
      a:hover {
        color: #fface6;
      }
    `,
  ],
})
export class GuideMenuLinkComponent {
  url = input.required<string>();
}

@Component({
  selector: 'ngrx-guide-section',
  standalone: true,
  imports: [GuideMenuLinkComponent],
  template: `
    <section>
      <header>{{ section().title }}</header>
      <div class="section-content">
        @for(child of section().children; track $index) { @if(child.kind ===
        'link') {
        <ngrx-guide-menu-link [url]="child.url">{{
          child.text
        }}</ngrx-guide-menu-link>
        } @else {
        <ngrx-guide-section [section]="child"></ngrx-guide-section>
        } }
      </div>
    </section>
  `,
  styles: [
    `
      .section-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 3px;
        border-left: 1px solid rgba(255, 255, 255, 0.12);
        padding-left: 12px;
      }

      section header {
        font-family: 'Oxanium', sans-serif;
        font-weight: 500;
        margin: 6px 0 3px;
        font-size: 16px;
      }

      section :host {
        display: flex;
        flex-direction: column;
        padding-left: 4px;
        margin-left: 4px;
      }

      section :host header {
        font-size: 14px;
      }
    `,
  ],
})
export class GuideSectionComponent {
  section = input.required<Section>();
}

@Component({
  selector: 'ngrx-guide-page',
  standalone: true,
  imports: [RouterOutlet, GuideMenuLinkComponent, GuideSectionComponent],
  template: `
    <menu>
      @for (section of menu; track $index) {
      <ngrx-guide-section [section]="section"></ngrx-guide-section>
      }
    </menu>
    <article>
      <router-outlet></router-outlet>
    </article>
  `,
  styles: [
    `
      :host {
        display: grid;
        grid-template-columns: 320px 1fr;
        font-size: 14px;
        position: relative;
      }

      article {
        max-width: 920px;
        margin: 0 auto;
        padding: 24px;
      }

      article ::ng-deep h1 {
        font-size: 32px;
      }

      article ::ng-deep p:not(ngrx-alert p),
      article ::ng-deep li {
        opacity: 0.8;
      }

      article ::ng-deep code:not(pre code) {
        font-weight: 600;
      }

      menu {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
        border-right: 1px solid rgba(255, 255, 255, 0.12);
        padding: 24px;
        margin: 0;
        height: 100vh;
        overflow-y: scroll;
        position: sticky;
        top: 0;
        left: 0;
      }
    `,
  ],
})
export default class GuidePageComponent {
  menu = [
    section('Store', [
      link('Why use Store?', '/guide/store/why'),
      link('Getting Started', '/guide/store'),
      link('Walkthrough', '/guide/store/walkthrough'),
      link('Installation', '/guide/store/install'),
      section('Architecture', [
        link('Actions', '/guide/store/actions'),
        link('Reducers', '/guide/store/reducers'),
        link('Selectors', '/guide/store/selectors'),
      ]),
      section('Advanced', [
        link('Meta-Reducers', '/guide/store/metareducers'),
        link('Feature Creators', '/guide/store/feature-creators'),
        link('Action Groups', '/guide/store/action-groups'),
      ]),
      section('Recipes', [
        link('Injecting Reducers', '/guide/store/recipes/injecting'),
        link('Downgrade for AngularJS', '/guide/store/recipes/downgrade'),
      ]),
      link('Runtime Checks', '/guide/store/configuration/runtime-checks'),
      link('Testing', '/guide/store/testing'),
    ]),
    section('Effects', [
      link('Overview', '/guide/effects'),
      link('Installation', '/guide/effects/install'),
      link('Testing', '/guide/effects/testing'),
      link('Lifecycle', '/guide/effects/lifecycle'),
      link('Operators', '/guide/effects/operators'),
    ]),
    section('Signals', [
      link('Overview', '/guide/signals'),
      link('Installation', '/guide/signals/install'),
      section('SignalStore', [
        link('Core Concepts', '/guide/signals/signal-store'),
        link('Lifecycle Hooks', '/guide/signals/signal-store/lifecycle-hooks'),
        link(
          'Custom Store Features',
          '/guide/signals/signal-store/custom-store-features'
        ),
        link(
          'Entity Management',
          '/guide/signals/signal-store/entity-management'
        ),
      ]),
      link('SignalState', '/guide/signals/signal-state'),
      link('RxJS Integration', '/guide/signals/rxjs-integration'),
      link('FAQ', '/guide/signals/faq'),
    ]),
  ];
}
