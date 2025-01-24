import React from "react";
import { Textarea } from "../ui/textarea.jsx";
import { EditorStatus } from "./editor-status.jsx";
import { cn } from "@/src/lib/utils.js";

export interface TextareaPlainTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  maxLength?: number;
  showCount?: boolean;
  className?: string;
  textareaClassName?: string;
  saving?: boolean;
  onBlur?: () => void;
  name?: string;
}

export const TextareaPlainText = React.forwardRef<
  HTMLTextAreaElement,
  TextareaPlainTextProps
>(
  (
    {
      value,
      onChange,
      placeholder = "Enter some text...",
      autoFocus = true,
      disabled,
      maxLength,
      showCount = false,
      className,
      textareaClassName,
      saving,
      onBlur,
      name,
    },
    ref
  ) => {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          maxLength={maxLength}
          onBlur={onBlur}
          name={name}
          className={textareaClassName}
        />
        <EditorStatus
          length={value.length}
          maxLength={maxLength}
          showCount={showCount}
          saving={saving}
        />
      </div>
    );
  }
);

TextareaPlainText.displayName = "TextareaPlainText";
