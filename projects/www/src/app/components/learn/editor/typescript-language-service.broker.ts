import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import type { Messages, Responses } from './typescript-language-service.worker';
import { Observable, Subject, filter, first, firstValueFrom } from 'rxjs';
import { isPlatformServer } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TypeScriptLanguageServiceBroker {
  private worker?: Worker;
  private messagesSubject$?: Subject<Responses>;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    if (isPlatformServer(platformId)) {
      return;
    }

    this.worker = new Worker(
      new URL('./typescript-language-service.worker.ts', import.meta.url),
      { type: 'module' }
    );
    this.messagesSubject$ = new Subject<Responses>();

    this.worker.onmessage = (event) => {
      if (!this.messagesSubject$) return;

      this.messagesSubject$.next(JSON.parse(event.data));
    };
  }

  sendMessage(message: Messages) {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    this.worker.postMessage(JSON.stringify(message));
  }

  getResponse<
    Type extends Responses['type'],
    Response extends Extract<Responses, { type: Type }>
  >(type: Type, filterFn: (res: Response) => boolean): Promise<Response> {
    if (!this.messagesSubject$) {
      throw new Error('Worker not initialized');
    }

    return firstValueFrom(
      this.messagesSubject$.asObservable().pipe(
        filter(
          (message): message is Response =>
            message.type === type && filterFn(message as Response)
        ),
        first()
      )
    );
  }
}
