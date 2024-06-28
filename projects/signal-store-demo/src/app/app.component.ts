import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import {
  signalStore,
  withEffects,
  withEvents,
  withMethods,
  withReducer,
  withState,
} from '@ngrx/signals';
import {
  Observable,
  fromEvent,
  switchMap,
  tap,
  filter,
  map,
  merge,
} from 'rxjs';
import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import {
  RadiusSelectorComponent,
  RadiusSelectorService,
} from './radius-selector.component';
import { Point, Circle } from './models';
import { withHistory } from './with-history';
import { animate } from './utils';

interface State {
  circles: Circle[];
  activePoint: Point | null;
}

const initialState: State = {
  circles: [],
  activePoint: null,
};

const Store = signalStore(
  withEvents({
    canvasReady: (canvas: HTMLCanvasElement) => canvas,
    canvasLeftClick: (point: Point) => point,
    canvasRightClick: (circle: Circle | null) => circle,
    updateRadius: (circle: Circle, radius: number) => ({ circle, radius }),
    closeRadiusOverlay: () => ({}),
  }),
  withState(initialState),
  withReducer((state, event) => {
    switch (event.type) {
      case 'canvasLeftClick': {
        const someCircleExists = state.circles.some(
          (circle) =>
            circle.x === event.payload.x && circle.y === event.payload.y
        );

        if (someCircleExists) {
          return state;
        }

        return {
          ...state,
          circles: [
            ...state.circles,
            { x: event.payload.x, y: event.payload.y, radius: 10 },
          ],
        };
      }

      case 'canvasRightClick': {
        return {
          ...state,
          activePoint: event.payload,
        };
      }

      case 'closeRadiusOverlay': {
        return {
          ...state,
          activePoint: null,
        };
      }

      case 'updateRadius': {
        const { circle, radius } = event.payload;

        return {
          ...state,
          circles: state.circles.map((c) =>
            c.x === circle.x && c.y === circle.y ? { ...c, radius } : c
          ),
        };
      }

      default: {
        return state;
      }
    }
  }),
  withHistory('circles'),
  withMethods((store) => ({
    init(canvas: HTMLCanvasElement) {
      store.emit('canvasReady', canvas);
    },
    render(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const circles = store.circles();
      const activePoint = store.activePoint();

      for (const circle of circles) {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);

        if (circle.x === activePoint?.x && circle.y === activePoint?.y) {
          ctx.fillStyle = 'blue';
          ctx.fill();
        }

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'blue';
        ctx.stroke();
        ctx.closePath();
      }
    },
    findNearestCircle(point: Point): Circle | null {
      const circles = store.circles();

      const result = circles.reduce((result, circle) => {
        const dx = circle.x - point.x;
        const dy = circle.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > circle.radius) {
          return result;
        } else if (result && distance < result.distance) {
          return { circle, distance };
        } else if (!result) {
          return { circle, distance };
        }

        return result;
      }, null as { circle: Circle; distance: number } | null);

      return result?.circle ?? null;
    },
    redo() {
      store.emit('redo');
    },
    undo() {
      store.emit('undo');
    },
  })),
  withEffects((store, radiusSelector = inject(RadiusSelectorService)) => ({
    resizeCanvas$: store.on('canvasReady').pipe(
      switchMap((event) => {
        const resize = () => {
          const canvas = event.payload;
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        };

        resize();

        return fromEvent(window, 'resize').pipe(tap(resize));
      })
    ),
    render$: store.on('canvasReady').pipe(
      switchMap((event) => {
        const ctx = event.payload.getContext('2d');

        if (!ctx) {
          throw new Error('Could not get 2d context');
        }

        return animate(() => {
          store.render(ctx);
        });
      })
    ),
    handleLeftClick$: store.on('canvasReady').pipe(
      switchMap((event) => {
        return fromEvent<MouseEvent>(event.payload, 'click');
      }),
      tap((event) => {
        store.emit('canvasLeftClick', { x: event.clientX, y: event.clientY });
      })
    ),
    handleRightClick$: store.on('canvasReady').pipe(
      switchMap((event) => {
        return fromEvent<MouseEvent>(event.payload, 'contextmenu');
      }),
      tap((event) => {
        const x = event.clientX;
        const y = event.clientY;
        const circle = store.findNearestCircle({ x, y });

        if (circle) {
          event.preventDefault();
        }

        store.emit('canvasRightClick', circle);
      })
    ),
    openRadiusOverlay$: store.on('canvasRightClick').pipe(
      map((event) => event.payload),
      filter((circle): circle is Circle => circle !== null),
      switchMap((circle) => {
        const { updateRadius, overlayRef } = radiusSelector.open(circle);

        return merge(
          updateRadius.pipe(
            tap((radius) => {
              store.emit('updateRadius', circle, radius);
            })
          ),
          overlayRef.backdropClick().pipe(
            tap(() => {
              overlayRef.dispose();
              store.emit('closeRadiusOverlay');
            })
          )
        );
      })
    ),
  }))
);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OverlayModule, RadiusSelectorComponent],
  providers: [Store],
  template: `
    <div class="controls">
      <button (click)="store.undo()">Undo</button>
      <button (click)="store.redo()">Redo</button>
    </div>
    <canvas #canvas></canvas>
  `,
  styles: `
    .controls {
      position: fixed;
      bottom: 0;
      left: 0;
    }
  `,
})
export class AppComponent implements AfterViewInit {
  store = inject(Store);
  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  ngAfterViewInit(): void {
    const canvas = this.canvasRef().nativeElement;

    this.store.init(canvas);
  }
}
