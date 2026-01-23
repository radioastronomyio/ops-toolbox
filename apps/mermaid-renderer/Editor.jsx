/**
 * @file Editor.jsx
 * @description CodeMirror 6 editor component with error line highlighting
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { Compartment, EditorState, StateEffect, StateField } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { Decoration, EditorView, highlightActiveLine, keymap, lineNumbers } from '@codemirror/view';
import { useEffect, useRef } from 'react';

// Effects for dynamic updates
const errorLineEffect = StateEffect.define();

const errorLineDecoration = Decoration.line({
  attributes: { class: 'cm-error-line' }
});

const errorLineField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(errorLineEffect)) {
        if (e.value === null) {
          decorations = Decoration.none;
        } else {
          try {
            const line = tr.state.doc.line(e.value);
            decorations = Decoration.set([errorLineDecoration.range(line.from)]);
          } catch (err) {
            decorations = Decoration.none;
          }
        }
      }
    }
    return decorations;
  },
  provide: f => EditorView.decorations.from(f)
});

const Editor = ({ value, onChange, theme = 'dark', errorLine = null }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const themeCompartment = useRef(new Compartment());

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        indentOnInput(),
        markdown(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        errorLineField,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        themeCompartment.current.of(theme === 'dark' ? oneDark : []),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px"
          },
          ".cm-scroller": {
            fontFamily: "var(--font-mono, monospace)",
            lineHeight: "1.6"
          },
          ".cm-gutters": {
            backgroundColor: "transparent",
            borderRight: "1px solid var(--border-color)",
            color: "var(--text-secondary)",
            minWidth: "40px"
          }
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: value }
      });
    }
  }, [value]);

  // Sync theme changes
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: themeCompartment.current.reconfigure(theme === 'dark' ? oneDark : [])
      });
    }
  }, [theme]);

  // Sync error line highlighting
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: errorLineEffect.of(errorLine)
      });
      
      if (errorLine !== null) {
        try {
          const line = viewRef.current.state.doc.line(errorLine);
          viewRef.current.dispatch({
            effects: EditorView.scrollIntoView(line.from, { y: 'center' })
          });
        } catch (err) {
          // Ignore invalid line numbers
        }
      }
    }
  }, [errorLine]);

  return <div ref={editorRef} style={{ height: '100%', width: '100%' }} />;
};

export default Editor;
