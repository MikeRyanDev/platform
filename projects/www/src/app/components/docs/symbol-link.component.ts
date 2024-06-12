import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  Component,
  ElementRef,
  Injector,
  Input,
  forwardRef,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CanonicalReference, ParsedCanonicalReference } from '@ngrx-io/shared';
import { EMPTY, Observable, fromEvent, switchMap, takeUntil, tap } from 'rxjs';
import {
  SYMBOl_POPOVER_CANONICAL_REFERENCE,
  SymbolPopoverComponent,
} from './symbol-popover.component';

@Component({
  selector: 'ngrx-symbol-link',
  standalone: true,
  imports: [RouterLink, SymbolPopoverComponent],
  template: `@if (isPrivate) {{{ parsedReference.name }}} @else if
    (shouldUseExternalLink) {<a [href]="url" target="_blank">{{
      parsedReference.name
    }}</a
    >} @else {<a [routerLink]="url" #internalSymbolLink>{{
      parsedReference.name
    }}</a
    >}`,
  styles: [``],
})
export class SymbolLinkComponent {
  injector = inject(Injector);
  overlay = inject(Overlay);
  internalSymbolLink =
    viewChild<ElementRef<HTMLAnchorElement>>('internalSymbolLink');
  url: string = '';
  isPrivate: boolean = true;
  parsedReference: ParsedCanonicalReference = new ParsedCanonicalReference(
    '@ngrx/store!Store:class'
  );
  shouldUseExternalLink: boolean = false;

  /**
   * Signal inputs aren't supported by @angular/elements, so we need
   * to use a traditional input to set the reference.
   */
  @Input({ required: true }) set reference(ref: CanonicalReference) {
    const parsed = new ParsedCanonicalReference(ref);
    this.isPrivate = parsed.isPrivate;
    this.shouldUseExternalLink =
      parsed.package.startsWith('@angular') || parsed.package === 'rxjs';
    this.parsedReference = parsed;

    if (parsed.isPrivate) {
      this.url = '';
    } else if (parsed.package.startsWith('@ngrx')) {
      const [ngrx, ...rest] = parsed.package.split('/');
      this.url = `/api/${rest.join('/')}/${parsed.name}`;
    } else if (parsed.package.startsWith('@angular')) {
      const [, packageName] = parsed.package.split('/');

      this.url = `https://angular.dev/api/${packageName}/${parsed.name}`;
    } else if (parsed.package === 'rxjs') {
      this.url = `https://rxjs.dev/api/index/${parsed.kind}/${parsed.name}`;
    } else {
      throw new Error(`Unknown package: ${parsed.package}`);
    }
  }

  constructor() {
    toObservable(this.internalSymbolLink)
      .pipe(
        switchMap((linkRef) => {
          if (!linkRef) return EMPTY;

          const link = linkRef.nativeElement;

          return fromEvent(link, 'mouseenter').pipe(
            switchMap(() => {
              const overlay = this.overlay.create({
                positionStrategy: this.overlay
                  .position()
                  .flexibleConnectedTo(link)
                  .withPositions([
                    {
                      originX: 'center',
                      originY: 'bottom',
                      overlayX: 'center',
                      overlayY: 'top',
                    },
                  ]),
                hasBackdrop: false,
                scrollStrategy: this.overlay.scrollStrategies.close(),
                panelClass: 'symbol-popover',
              });
              const injector = Injector.create({
                parent: this.injector,
                providers: [
                  {
                    provide: SYMBOl_POPOVER_CANONICAL_REFERENCE,
                    useValue: this.parsedReference.referenceString,
                  },
                ],
              });
              const componentPortal = new ComponentPortal(
                SymbolPopoverComponent,
                null,
                injector
              );

              return new Observable(() => {
                overlay.attach(componentPortal);

                return () => overlay.detach();
              }).pipe(takeUntil(fromEvent(link, 'mouseleave')));
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        error: console.error,
      });
  }
}
