import { Observable } from 'rxjs';

export function animate(renderFn: () => void): Observable<number> {
  return new Observable<number>((subscriber) => {
    let animationFrameId = requestAnimationFrame(function render(now) {
      subscriber.next(now);
      renderFn();
      animationFrameId = requestAnimationFrame(render);
    });

    return () => cancelAnimationFrame(animationFrameId);
  });
}
