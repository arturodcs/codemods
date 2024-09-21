import { Collection, JSCodeshift } from "jscodeshift";

/**
 * This function is used to fix the comments deletion issue when the first node is changed.
 * 
 * If there are changes in the first node and the original first node had comments
 * then we need to add the comments to the new first node
 */
export function fixFirstNodeCommentsDeletion(
  j: JSCodeshift,
  root: Collection<any>,
  originalFirstNode: any
) {
  const originalFirstNodeComments = originalFirstNode.comments;
  const newFirstNodePath = root.find(j.Program).get("body", 0);
  const newFirstNode = newFirstNodePath.node;

  if (
    originalFirstNode !== newFirstNode &&
    originalFirstNodeComments &&
    originalFirstNodeComments.length > 0
  ) {
    if (newFirstNode.comments && newFirstNode.comments.length > 0) {
      newFirstNode.comments = [
        ...originalFirstNodeComments,
        ...newFirstNode.comments,
      ];
    } else {
      newFirstNode.comments = originalFirstNodeComments;
    }
  }
}
