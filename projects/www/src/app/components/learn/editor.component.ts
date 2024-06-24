import {
  AfterViewInit,
  Component,
  ElementRef,
  PLATFORM_ID,
  inject,
  viewChild,
} from '@angular/core';
import {
  Completion,
  CompletionContext,
  CompletionResult,
  acceptCompletion,
  autocompletion,
  closeBrackets,
  closeCompletion,
  completeFromList,
  insertCompletionText,
} from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import {
  bracketMatching,
  foldGutter,
  indentOnInput,
  indentUnit,
} from '@codemirror/language';
import { searchKeymap } from '@codemirror/search';
import {
  Compartment,
  EditorSelection,
  EditorState,
  TransactionSpec,
  type Extension,
} from '@codemirror/state';
import { linter, Diagnostic } from '@codemirror/lint';
import {
  EditorView,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  scrollPastEnd,
  hoverTooltip,
} from '@codemirror/view';
import { isPlatformServer } from '@angular/common';
import * as ts from 'typescript';
import { withEditorTheme } from './editor/editor-theme';
import { angularComponent } from './editor/angular-component-syntax';
import { ExamplesService } from '@ngrx-io/app/examples/examples.service';
import { editorStore } from './editor/editor.store';

@Component({
  selector: 'ngrx-editor',
  standalone: true,
  imports: [],
  providers: [editorStore],
  template: ` <div #editor></div> `,
  styles: [
    `
      :host {
        --cm-fontFamily: 'Space Mono', monospace;
        --cm-backgroundColor: transparent;
        --cm-textColor: #fff;
        --cm-cursor-width: 2px;
        --cm-cursor-backgroundColor: #fff;
        --cm-selection-backgroundColorFocused: transparent;
        --cm-selection-backgroundOpacityFocused: 0.3;
        --cm-selection-backgroundColorBlured: #fff;
        --cm-selection-backgroundOpacityBlured: 0.3;
        --cm-matching-bracket: #fff;
        --cm-activeLineBackgroundColor: transparent;
        --cm-gutter-backgroundColor: transparent;
        --cm-gutter-textColor: #fff;
        --cm-gutter-activeLineTextColor: #fff;
        --cm-foldGutter-textColor: #fff;
        --cm-foldGutter-textColorHover: #fff;
        --cm-panels-borderColor: #fff;
        --cm-search-textColor: #fff;
        --cm-search-backgroundColor: transparent;
      }
    `,
  ],
})
export class EditorComponent implements AfterViewInit {
  editorRef = viewChild.required<ElementRef<HTMLDivElement>>('editor');
  platformId = inject(PLATFORM_ID);
  examples = inject(ExamplesService);
  store = inject(editorStore);

  async ngAfterViewInit() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const store = this.store;
    const example = await this.examples.getConfig('store');

    console.log(example);

    store.init(example);

    const view = new EditorView({
      parent: this.editorRef().nativeElement,
      dispatchTransactions(transactions) {
        const previousSelection = view.state.selection;

        view.update(transactions);

        const newSelection = view.state.selection;

        const selectionChanged =
          newSelection !== previousSelection &&
          (newSelection === undefined ||
            previousSelection === undefined ||
            !newSelection.eq(previousSelection));

        if (
          transactions.some((transaction) => transaction.docChanged) ||
          selectionChanged
        ) {
          console.log('writing file');
          store.updateOpenFile(view.state.doc.toString());
        }
      },
      state: EditorState.create({
        doc: store.openFileContents(),
        extensions: [
          hoverTooltip(async (view, pos, side) => {
            const def = await store.getQuickInfoForOpenFile(pos);

            if (!def) {
              return null;
            }

            return {
              pos,
              create: () => {
                const dom = document.createElement('div');
                const displayParts = def.displayParts ?? [];

                dom.className = 'tooltip';
                dom.textContent = displayParts
                  .map((part) => part.text)
                  .join('');

                return { dom };
              },
            };
          }),
          EditorView.domEventHandlers({
            // scroll: debounce((_event, view) => {
            //   onScrollRef.current?.({ left: view.scrollDOM.scrollLeft, top: view.scrollDOM.scrollTop });
            // }, debounceScroll),
            keydown: (event) => {
              if (event.code === 'KeyS' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
              }
            },
          }),
          angularComponent(),
          history(),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            { key: 'Tab', run: acceptCompletion },
            // indentKeyBinding,
          ]),
          indentUnit.of('\t'),
          autocompletion({
            closeOnBlur: false,
            override: [
              async (
                context: CompletionContext
              ): Promise<CompletionResult | null> => {
                try {
                  const contextPositions = context.state.wordAt(context.pos);
                  const info = await store.getAutocompleteForOpenFile(
                    context.pos,
                    contextPositions
                  );
                  const completions = info?.entries;

                  if (!completions) {
                    return null;
                  }

                  const completionSource = completeFromList(
                    completions.map((completionItem) => {
                      const suggestions: Completion = {
                        type: completionItem.kind,
                        label: completionItem.name,
                        boost: 1 / Number(completionItem.sortText),
                        detail: completionItem.labelDetails?.detail,
                        apply: (view, completion, from, to) =>
                          applyWithCodeAction(
                            view,
                            { ...completion, ...completionItem },
                            from,
                            to
                          ),
                      };

                      return suggestions;
                    })
                  );

                  return completionSource(context);
                } catch (e) {
                  return null;
                }
              },
            ],
          }),
          closeBrackets(),
          lineNumbers(),
          scrollPastEnd(),
          dropCursor(),
          drawSelection(),
          bracketMatching(),
          EditorState.tabSize.of(2),
          indentOnInput(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          foldGutter({
            markerDOM: (open) => {
              const icon = document.createElement('div');

              icon.className = `fold-icon ${
                open ? 'i-ph-caret-down-bold' : 'i-ph-caret-right-bold'
              }`;

              return icon;
            },
          }),
          withEditorTheme(),
          linter(
            async (view): Promise<Diagnostic[]> => {
              const diagnostics = await store.getDiagnosticsForOpenFile();

              return diagnostics.map((diagnostic): Diagnostic => {
                const { start = 0, length = 0, message } = diagnostic;

                const mapSeverity = (
                  category: ts.DiagnosticCategory
                ): Diagnostic['severity'] => {
                  switch (category) {
                    case ts.DiagnosticCategory.Error:
                      return 'error';
                    case ts.DiagnosticCategory.Warning:
                      return 'warning';
                    case ts.DiagnosticCategory.Suggestion:
                      return 'info';
                    case ts.DiagnosticCategory.Message:
                      return 'info';
                  }
                };

                return {
                  from: start,
                  to: start + length,
                  message,
                  severity: mapSeverity(diagnostic.severity),
                };
              });
            },
            {
              delay: 400,
            }
          ),
        ],
      }),
    });
  }
}

const applyWithCodeAction = (
  view: EditorView,
  completion: Completion,
  from: number,
  to: number
) => {
  const transactionSpecs: TransactionSpec[] = [
    insertCompletionText(view.state, completion.label, from, to),
  ];

  view.dispatch(...transactionSpecs);

  closeCompletion(view);
};
