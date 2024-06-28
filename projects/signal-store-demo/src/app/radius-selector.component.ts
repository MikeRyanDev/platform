import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, Injectable, inject, input, output } from '@angular/core';
import { Circle } from './models';
import { outputToObservable } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class RadiusSelectorService {
  overlay = inject(Overlay);

  open(circle: Circle) {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo({
        x: circle.x,
        y: circle.y,
      })
      .withPositions([
        {
          originX: 'center',
          originY: 'center',
          overlayX: 'center',
          overlayY: 'top',
        },
      ]);

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
    });

    const componentRef = overlayRef.attach(
      new ComponentPortal(RadiusSelectorComponent)
    );

    componentRef.setInput('circle', circle);

    const updateRadius = outputToObservable(componentRef.instance.updateRadius);

    return { updateRadius, overlayRef };
  }
}

@Component({
  selector: 'app-radius-selector',
  standalone: true,
  template: `
    <input
      type="range"
      [value]="circle().radius.toString(10)"
      min="1"
      max="100"
      step="1"
      (input)="onInput(rangeInput)"
      #rangeInput
    />
  `,
  styles: [
    `
      :host {
        display: flex;
        width: 120px;
        height: 64px;
        background-color: white;
        justify-content: center;
        align-items: center;
      }
    `,
  ],
})
export class RadiusSelectorComponent {
  circle = input.required<{ radius: number }>();
  updateRadius = output<number>();

  onInput(rangeInput: HTMLInputElement) {
    this.updateRadius.emit(+rangeInput.value);
  }
}
