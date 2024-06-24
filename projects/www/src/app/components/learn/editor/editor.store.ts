import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { TypeScriptLanguageServiceBroker } from './typescript-language-service.broker';
import type { StackblitzConfig } from '@ngrx-io/tools/vite-ngrx-stackblits.plugin';
import * as ts from 'typescript';

export interface EditorState {
  openFilePath: string;
  files: {
    [filePath: string]: string;
  };
}

const initialState: EditorState = {
  openFilePath: 'src/main.ts',
  files: {
    'src/main.ts': '// empty file',
  } as Record<string, string>,
};

export const editorStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    openFileContents: computed(() => store.files()[store.openFilePath()]),
  })),
  withMethods((store, tslBroker = inject(TypeScriptLanguageServiceBroker)) => ({
    init(config: StackblitzConfig) {
      const tsConfigFileContents = config.files['tsconfig.json'];
      const { config: tsConfig } = tsConfigFileContents
        ? ts.parseConfigFileTextToJson('tsconfig.json', tsConfigFileContents)
        : { config: { compilerOptions: { target: ts.ScriptTarget.ES2022 } } };

      const { options: compilerOptions } = ts.convertCompilerOptionsFromJson(
        tsConfig.compilerOptions,
        '.'
      );

      patchState(store, {
        openFilePath: config.open,
        files: config.files,
      });

      tslBroker.sendMessage({
        type: 'init',
        target: compilerOptions.target || ts.ScriptTarget.ES2022,
        compilerOptions: compilerOptions,
        files: Object.entries(config.files).map(([path, contents]) => ({
          path,
          contents,
        })),
      });
    },
    updateOpenFile(contents: string) {
      tslBroker.sendMessage({
        type: 'writeFile',
        file: store.openFilePath(),
        contents,
      });
    },
    async getQuickInfoForOpenFile(pos: number) {
      tslBroker.sendMessage({
        type: 'getQuickInfoAtPos',
        pos,
        file: store.openFilePath(),
      });

      const response = await tslBroker.getResponse(
        'getQuickInfoAtPos',
        (res) => res.pos === pos
      );

      return response.info;
    },
    async getAutocompleteForOpenFile(
      pos: number,
      context?: { from?: number; to?: number } | null
    ) {
      tslBroker.sendMessage({
        type: 'autocomplete',
        file: store.openFilePath(),
        pos,
        from: context?.from,
        to: context?.to,
      });

      const response = await tslBroker.getResponse(
        'autocomplete',
        (res) => res.pos === pos
      );

      return response.info;
    },
    async getDiagnosticsForOpenFile() {
      tslBroker.sendMessage({
        type: 'diagnostic',
        file: store.openFilePath(),
      });

      const response = await tslBroker.getResponse(
        'diagnostic',
        (res) => res.file === store.openFilePath()
      );

      return response.diagnostics;
    },
  }))
);
