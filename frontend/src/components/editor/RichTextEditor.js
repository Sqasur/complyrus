"use client";

import { useRef, useEffect, useState } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser, DOMSerializer } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";

const RichTextEditor = ({
  content = "",
  onChange,
  placeholder = "Start typing...",
  className = "",
  editable = true,
}) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Create schema with basic and list nodes
  const mySchema = new Schema({
    nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
    marks: schema.spec.marks,
  });

  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    try {
      // Parse initial content
      let doc;
      if (content) {
        const div = document.createElement("div");
        div.innerHTML = content;
        doc = DOMParser.fromSchema(mySchema).parse(div);
      } else {
        doc = mySchema.node("doc", null, [mySchema.node("paragraph")]);
      }

      // Create editor state
      const state = EditorState.create({
        doc,
        plugins: [
          ...exampleSetup({ schema: mySchema, menuBar: true }),
          keymap(baseKeymap),
        ],
      });

      // Create editor view
      const view = new EditorView(editorRef.current, {
        state,
        editable: () => editable,
        dispatchTransaction(transaction) {
          const newState = view.state.apply(transaction);
          view.updateState(newState);

          // Call onChange callback with HTML content
          if (onChange && transaction.docChanged) {
            const div = document.createElement("div");
            const fragment = DOMSerializer.fromSchema(
              mySchema
            ).serializeFragment(newState.doc.content);
            div.appendChild(fragment);
            onChange(div.innerHTML);
          }
        },
      });

      viewRef.current = view;
      setIsReady(true);

      // Cleanup function
      return () => {
        if (viewRef.current) {
          viewRef.current.destroy();
          viewRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error initializing ProseMirror editor:", error);
    }
  }, []);

  // Update content when prop changes
  useEffect(() => {
    if (viewRef.current && content !== undefined && isReady) {
      const currentContent = getEditorContent();
      if (currentContent !== content) {
        updateEditorContent(content);
      }
    }
  }, [content, isReady]);

  const getEditorContent = () => {
    if (!viewRef.current) return "";

    const div = document.createElement("div");
    const fragment = DOMSerializer.fromSchema(mySchema).serializeFragment(
      viewRef.current.state.doc.content
    );
    div.appendChild(fragment);
    return div.innerHTML;
  };

  const updateEditorContent = (newContent) => {
    if (!viewRef.current) return;

    try {
      const div = document.createElement("div");
      div.innerHTML = newContent || "";
      const doc = DOMParser.fromSchema(mySchema).parse(div);

      const newState = EditorState.create({
        doc,
        plugins: viewRef.current.state.plugins,
      });

      viewRef.current.updateState(newState);
    } catch (error) {
      console.error("Error updating editor content:", error);
    }
  };

  return (
    <div className={`prose max-w-none ${className}`}>
      <div
        ref={editorRef}
        className="min-h-[200px] border rounded-md p-4 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        style={{
          outline: "none",
        }}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-sm text-muted-foreground">Loading editor...</div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
