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
import { TextareaPlainText } from "../editor/textarea-plain-text.jsx";

const FormSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Title must be at least 1 character.",
    })
    .max(kAppConstants.maxPostTitleLength, {
      message: `Title must not be longer than ${kAppConstants.maxPostTitleLength} characters.`,
    }),
});

export interface EditPostTitleProps {
  post: IPost;
}

export function EditPostTitle({ post }: EditPostTitleProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: post.title,
    },
  });

  const updatePostHook = useUpdatePost({ postId: post.id });
  const debouncedUpdatePostTitle = useMemo(
    () => debounce(updatePostHook.trigger, 1000),
    [updatePostHook.trigger]
  );

  const title = form.watch("title");
  useEffect(() => {
    debouncedUpdatePostTitle({ title });
  }, [title, debouncedUpdatePostTitle]);

  const isSaving = updatePostHook.isMutating;
  const error = updatePostHook.error;

  return (
    <Form {...form}>
      <form className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextareaPlainText
                  placeholder="Enter a title for your post"
                  textareaClassName="resize-none"
                  saving={isSaving}
                  maxLength={kAppConstants.maxPostTitleLength}
                  {...field}
                />
              </FormControl>
              <FormMessage>
                {error ? error.message ?? "Error updating post title" : null}
              </FormMessage>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
