import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideFileRouter, routes } from '@analogjs/router';
import { withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideContent,
  withMarkdownRenderer,
  MarkedSetupService,
} from '@analogjs/content';
import { NgRxMarkedSetupService } from './services/markdown.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(withComponentInputBinding()),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideContent(withMarkdownRenderer()),
    {
      provide: MarkedSetupService,
      useClass: NgRxMarkedSetupService,
    },
  ],
};
