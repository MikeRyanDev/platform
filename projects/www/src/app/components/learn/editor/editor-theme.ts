import {
  HighlightStyle,
  defaultHighlightStyle,
  syntaxHighlighting,
} from '@codemirror/language';
import { Compartment, Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';

export const themeSelection = new Compartment();
export const vscodeDarkTheme = HighlightStyle.define([
  {
    tag: [
      tags.keyword,
      tags.operatorKeyword,
      tags.modifier,
      tags.color,
      tags.constant(tags.name),
      tags.standard(tags.name),
      tags.standard(tags.tagName),
      tags.special(tags.brace),
      tags.atom,
      tags.bool,
      tags.special(tags.variableName),
    ],
    color: '#569cd6',
  },
  {
    tag: [tags.controlKeyword, tags.moduleKeyword],
    color: '#c586c0',
  },
  {
    tag: [
      tags.name,
      tags.deleted,
      tags.character,
      tags.macroName,
      tags.propertyName,
      tags.variableName,
      tags.labelName,
      tags.definition(tags.name),
    ],
    color: '#9cdcfe',
  },
  { tag: tags.heading, fontWeight: 'bold', color: '#9cdcfe' },
  {
    tag: [
      tags.typeName,
      tags.className,
      tags.tagName,
      tags.number,
      tags.changed,
      tags.annotation,
      tags.self,
      tags.namespace,
    ],
    color: '#4ec9b0',
  },
  {
    tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
    color: '#dcdcaa',
  },
  { tag: [tags.number], color: '#b5cea8' },
  {
    tag: [
      tags.operator,
      tags.punctuation,
      tags.separator,
      tags.url,
      tags.escape,
      tags.regexp,
    ],
    color: '#d4d4d4',
  },
  {
    tag: [tags.regexp],
    color: '#d16969',
  },
  {
    tag: [
      tags.special(tags.string),
      tags.processingInstruction,
      tags.string,
      tags.inserted,
    ],
    color: '#ce9178',
  },
  { tag: [tags.angleBracket], color: '#808080' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: [tags.meta, tags.comment], color: '#6a9955' },
  { tag: tags.link, color: '#6a9955', textDecoration: 'underline' },
  { tag: tags.invalid, color: '#ff0000' },
]);

export const editorTheme = EditorView.theme({
  '&.cm-editor': {
    height: '100%',
    background: 'var(--cm-backgroundColor)',
    color: 'var(--cm-textColor)',
    fontFamily: 'var(--cm-fontFamily)',
  },
  '.cm-cursor': {
    borderLeft: 'var(--cm-cursor-width) solid var(--cm-cursor-backgroundColor)',
  },
  '.cm-scroller': {
    lineHeight: '1.5',
  },
  '.cm-line': {
    padding: '0 0 0 4px',
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'var(--cm-selection-backgroundColorFocused)',
    opacity: 'var(--cm-selection-backgroundOpacityFocused, 0.3)',
  },
  '&:not(.cm-focused) > .cm-scroller > .cm-selectionLayer .cm-selectionBackground':
    {
      backgroundColor: 'var(--cm-selection-backgroundColorBlured)',
      opacity: 'var(--cm-selection-backgroundOpacityBlured, 0.3)',
    },
  '&.cm-focused > .cm-scroller .cm-matchingBracket': {
    backgroundColor: 'var(--cm-matching-bracket)',
  },
  '.cm-activeLine': {
    background: 'var(--cm-activeLineBackgroundColor)',
  },
  '.cm-gutters': {
    background: 'var(--cm-gutter-backgroundColor)',
    borderRight: 0,
    color: 'var(--cm-gutter-textColor)',
  },
  '.cm-gutter': {
    '&.cm-lineNumbers': {
      fontFamily: 'Spane Mono, monospace',
      fontSize: '13px',
      minWidth: '28px',
    },
    '& .cm-activeLineGutter': {
      background: 'transparent',
      color: 'var(--cm-gutter-activeLineTextColor)',
    },
    '&.cm-foldGutter .cm-gutterElement > .fold-icon': {
      cursor: 'pointer',
      color: 'var(--cm-foldGutter-textColor)',
      transform: 'translateY(2px)',
      '&:hover': {
        color: 'var(--cm-foldGutter-textColorHover)',
      },
    },
  },
  '.cm-foldGutter .cm-gutterElement': {
    padding: '0 4px',
  },
  '.cm-tooltip-autocomplete > ul > li': {
    minHeight: '18px',
  },
  '.cm-panel.cm-search label': {
    marginLeft: '2px',
  },
  '.cm-panel.cm-search input[type=checkbox]': {
    position: 'relative',
    transform: 'translateY(2px)',
    marginRight: '4px',
  },
  '.cm-panels': {
    borderColor: 'var(--cm-panels-borderColor)',
  },
  '.cm-panel.cm-search': {
    background: 'var(--cm-search-backgroundColor)',
    color: 'var(--cm-search-textColor)',
    padding: '6px 8px',
  },
  '.cm-search .cm-button': {
    background: 'var(--cm-search-button-backgroundColor)',
    borderColor: 'var(--cm-search-button-borderColor)',
    color: 'var(--cm-search-button-textColor)',
    borderRadius: '4px',
    '&:hover': {
      color: 'var(--cm-search-button-textColorHover)',
    },
    '&:focus-visible': {
      outline: 'none',
      borderColor: 'var(--cm-search-button-borderColorFocused)',
    },
    '&:hover:not(:focus-visible)': {
      background: 'var(--cm-search-button-backgroundColorHover)',
      borderColor: 'var(--cm-search-button-borderColorHover)',
    },
    '&:hover:focus-visible': {
      background: 'var(--cm-search-button-backgroundColorHover)',
      borderColor: 'var(--cm-search-button-borderColorFocused)',
    },
  },
  '.cm-panel.cm-search [name=close]': {
    top: '6px',
    right: '6px',
    padding: '0 6px',
    backgroundColor: 'var(--cm-search-closeButton-backgroundColor)',
    color: 'var(--cm-search-closeButton-textColor)',
    '&:hover': {
      'border-radius': '6px',
      color: 'var(--cm-search-closeButton-textColorHover)',
      backgroundColor: 'var(--cm-search-closeButton-backgroundColorHover)',
    },
  },
  '.cm-search input': {
    background: 'var(--cm-search-input-backgroundColor)',
    borderColor: 'var(--cm-search-input-borderColor)',
    outline: 'none',
    borderRadius: '4px',
    '&:focus-visible': {
      borderColor: 'var(--cm-search-input-borderColorFocused)',
    },
  },
  '.cm-tooltip': {
    background: 'var(--cm-tooltip-backgroundColor)',
    borderColor: 'var(--cm-tooltip-borderColor)',
  },
  '.cm-tooltip.cm-tooltip-autocomplete ul li[aria-selected]': {
    background: 'var(--cm-tooltip-backgroundColorSelected)',
  },
});

export function withEditorTheme(): Extension {
  return [editorTheme, themeSelection.of(syntaxHighlighting(vscodeDarkTheme))];
}
