import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  ApiMemberSummary,
  CanonicalReference,
  ParsedCanonicalReference,
} from '@ngrx-io/shared';
import { SymbolHeaderComponent } from './symbol-header.component';
import { SymbolApiComponent } from './symbol-api.component';
import { SymbolSummaryComponent } from './symbol-summary.component';
import { AsyncPipe } from '@angular/common';

export const SYMBOl_POPOVER_CANONICAL_REFERENCE =
  new InjectionToken<CanonicalReference>('SymbolPopoverCanonicalReference');

@Component({
  selector: 'ngrx-symbol-popover',
  standalone: true,
  imports: [
    SymbolHeaderComponent,
    SymbolApiComponent,
    SymbolSummaryComponent,
    AsyncPipe,
  ],
  template: `
    @if (firstSymbol$ | async; as symbol) {
    <div class="popover">
      <ngrx-symbol-header [symbol]="symbol" />
      <ngrx-symbol-summary [symbol]="symbol" />
      <ngrx-symbol-api [symbol]="symbol" />
    </div>
    }
  `,
  styles: [
    `
      .popover {
        display: flex;
        flex-direction: column;
        width: 500px;
        padding: 16px;
        background-color: rgba(16, 8, 20, 0.72);
        border-radius: 4px;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(8px);
        overflow-y: hidden;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SymbolPopoverComponent {
  http = inject(HttpClient);
  canonicalReference = inject(SYMBOl_POPOVER_CANONICAL_REFERENCE);
  parsedRef = new ParsedCanonicalReference(this.canonicalReference);
  firstSymbol$ = this.http
    .get<{ symbol: ApiMemberSummary }>(
      `/api/v1/symbols/${encodeURIComponent(this.parsedRef.package)}/${
        this.parsedRef.name
      }`
    )
    .pipe(
      takeUntilDestroyed(),
      map((response) => response.symbol.members[0])
    );
}
