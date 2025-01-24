import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { EditorState } from "lexical";

const theme = {
  // Theme styling goes here
  //...
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: unknown) {
  console.error(error);
}

export interface PlainTextEditorProps {
  initialValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  namespace: string;
  disabled?: boolean;
  onChangeAsString: (value: string) => void;
}

export function PlainTextEditor({
  initialValue,
  placeholder = "Enter some text...",
  autoFocus = true,
  namespace,
  disabled,
  onChangeAsString,
}: PlainTextEditorProps) {
  const initialConfig = {
    namespace,
    theme,
    onError,
    initialValue,
    editable: !disabled,
  };

  const onChange = (editorState: EditorState) => {
    const stateJSON = editorState.toJSON();
    const stateJSONString = JSON.stringify(stateJSON);
    onChangeAsString(stateJSONString);
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <PlainTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div>{placeholder}</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      {autoFocus && <AutoFocusPlugin />}
      <OnChangePlugin onChange={onChange} />
    </LexicalComposer>
  );
}
