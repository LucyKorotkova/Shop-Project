import { IComment } from "@Shared/types";

export function validateComment(comment: Partial<IComment>): string | null {
  if (!comment) return "Comment is absent or empty";
  if (!comment.name) return "Field name is absent";
  if (!comment.email) return "Field email is absent";
  if (!comment.body) return "Field body is absent";
  if (!comment.productId) return "Field productId is absent";
  return null;
}
