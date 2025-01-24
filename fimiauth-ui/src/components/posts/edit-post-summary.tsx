"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form.js";
import { kAppConstants } from "@/src/definitions/appConstants.js";
import { IPost } from "@/src/definitions/post.js";
import { useUpdatePost } from "@/src/lib/clientApi/post.js";
import { debounce } from "lodash-es";
import { useEffect, useMemo } from "react";
import { TextareaPlainText } from "../editor/textarea-plain-text.js";

const FormSchema = z.object({
  summary: z
    .string()
    .min(1, {
      message: "Summary must be at least 1 character.",
    })
    .max(kAppConstants.maxPostSummaryLength, {
      message: `Summary must not be longer than ${kAppConstants.maxPostSummaryLength} characters.`,
    }),
});

export interface EditPostSummaryProps {
  post: IPost;
}

export function EditPostSummary({ post }: EditPostSummaryProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      summary: post.summary,
    },
  });

  const updatePostHook = useUpdatePost({ postId: post.id });
  const debouncedUpdatePostSummary = useMemo(
    () => debounce(updatePostHook.trigger, 1000),
    [updatePostHook.trigger]
  );

  const summary = form.watch("summary");
  useEffect(() => {
    debouncedUpdatePostSummary({ summary });
  }, [summary, debouncedUpdatePostSummary]);

  const isSaving = updatePostHook.isMutating;
  const error = updatePostHook.error;

  return (
    <Form {...form}>
      <form className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextareaPlainText
                  placeholder="Enter a summary for your post"
                  textareaClassName="resize-none"
                  saving={isSaving}
                  maxLength={kAppConstants.maxPostSummaryLength}
                  {...field}
                />
              </FormControl>
              <FormMessage>
                {error ? error.message ?? "Error updating post summary" : null}
              </FormMessage>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
