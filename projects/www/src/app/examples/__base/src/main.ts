import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { App } from './app.component';

bootstrapApplication(App, {
  providers: [provideExperimentalZonelessChangeDetection()],
});
