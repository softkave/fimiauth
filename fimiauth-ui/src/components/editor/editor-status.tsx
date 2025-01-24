import { cn } from "@/src/lib/utils.js";
import { isNumber } from "lodash-es";

export interface EditorStatusProps {
  length?: number;
  maxLength?: number;
  showCount?: boolean;
  className?: string;
  saving?: boolean;
}

export function EditorStatus({
  length,
  maxLength,
  showCount,
  className,
  saving,
}: EditorStatusProps) {
  return (
    <div className={cn("flex flex-row gap-2", className)}>
      {showCount && isNumber(length) && (
        <div className="text-sm text-muted-foreground">
          {length} {maxLength ? `of ${maxLength}` : ""}
        </div>
      )}
      {saving && <div className="text-sm text-muted-foreground">Saving...</div>}
    </div>
  );
}
