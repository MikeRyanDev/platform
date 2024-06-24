import {
  VirtualTypeScriptEnvironment,
  createDefaultMapFromCDN,
  createSystem,
  createVirtualTypeScriptEnvironment,
} from '@typescript/vfs';
import * as ts from 'typescript';

export interface File {
  path: string;
  contents: string;
}

export type Messages =
  | InitMessage
  | GetQuickInfoAtPosMessage
  | WriteFileMessage
  | AutompleteMessage
  | DiagnosticMessage;
export type Responses =
  | GetQuickInfoAtPosResponse
  | AutompleteResponse
  | DiagnosticResponse;

export interface InitMessage {
  type: 'init';
  target: ts.ScriptTarget;
  compilerOptions: ts.CompilerOptions;
  files: File[];
}

export interface WriteFileMessage {
  type: 'writeFile';
  file: string;
  contents: string;
}

export interface GetQuickInfoAtPosMessage {
  type: 'getQuickInfoAtPos';
  pos: number;
  file: string;
}

export interface GetQuickInfoAtPosResponse {
  type: 'getQuickInfoAtPos';
  pos: number;
  file: string;
  info: ts.QuickInfo | undefined;
}

export interface AutompleteMessage {
  type: 'autocomplete';
  pos: number;
  file: string;
  from?: number;
  to?: number;
}

export interface AutompleteResponse {
  type: 'autocomplete';
  pos: number;
  file: string;
  info: ts.CompletionInfo | undefined;
}

export interface DiagnosticMessage {
  type: 'diagnostic';
  file: string;
}

export interface Diagnostic {
  start?: number;
  length?: number;
  message: string;
  severity: ts.DiagnosticCategory;
}

export interface DiagnosticResponse {
  type: 'diagnostic';
  file: string;
  diagnostics: Diagnostic[];
}

let filesystemMap: Map<string, string>;
let system: ts.System;
let env: VirtualTypeScriptEnvironment;

function getVirtualEnv(): VirtualTypeScriptEnvironment {
  if (!env) {
    throw new Error('Environment not initialized');
  }

  return env;
}

export async function init(message: InitMessage) {
  filesystemMap = await createDefaultMapFromCDN(
    message.compilerOptions,
    ts.version,
    false,
    ts
  );

  const entryFiles: string[] = [];
  for (const file of message.files) {
    if (!file.path.endsWith('.ts')) continue;

    const path = normalizePath(file.path);

    filesystemMap.set(path, file.contents);
    entryFiles.push(path);
  }

  system = createSystem(filesystemMap);
  env = createVirtualTypeScriptEnvironment(
    system,
    entryFiles,
    ts,
    message.compilerOptions
  );
}

export function writeFile(message: WriteFileMessage) {
  env.updateFile(normalizePath(message.file), message.contents);
}

export function getQuickInfoAtPos(
  message: GetQuickInfoAtPosMessage
): GetQuickInfoAtPosResponse {
  const env = getVirtualEnv();
  const info = env.languageService.getQuickInfoAtPosition(
    normalizePath(message.file),
    message.pos
  );

  return {
    type: 'getQuickInfoAtPos',
    pos: message.pos,
    file: message.file,
    info,
  };
}

export function autocomplete(message: AutompleteMessage): Responses {
  const env = getVirtualEnv();
  const info = env.languageService.getCompletionsAtPosition(
    normalizePath(message.file),
    message.pos,
    {}
  );

  return {
    type: 'autocomplete',
    pos: message.pos,
    file: message.file,
    info,
  };
}

export function getDiagnostic(message: DiagnosticMessage): Responses | null {
  if (!env) return null;

  const tsDiagnostics = [
    ...env.languageService.getSyntacticDiagnostics(message.file),
    ...env.languageService.getSemanticDiagnostics(message.file),
  ];

  return {
    type: 'diagnostic',
    file: normalizePath(message.file),
    diagnostics: tsDiagnostics.map((diagnostic) => ({
      start: diagnostic.start,
      length: diagnostic.length,
      severity: diagnostic.category,
      message:
        typeof diagnostic.messageText === 'string'
          ? diagnostic.messageText
          : diagnostic.messageText.messageText,
    })),
  };
}

onmessage = async (event: MessageEvent) => {
  const data: Messages = JSON.parse(event.data);

  switch (data.type) {
    case 'init': {
      await init(data);
      break;
    }
    case 'getQuickInfoAtPos': {
      const info = getQuickInfoAtPos(data);
      postMessage(JSON.stringify(info));
      break;
    }
    case 'writeFile': {
      writeFile(data);
      break;
    }
    case 'autocomplete': {
      const info = autocomplete(data);
      postMessage(JSON.stringify(info));
      break;
    }
    case 'diagnostic': {
      const info = getDiagnostic(data);
      if (info) postMessage(JSON.stringify(info));
      break;
    }
  }
};

function normalizePath(filePath: string) {
  if (filePath.startsWith('/')) {
    return filePath;
  }

  return `/${filePath}`;
}
