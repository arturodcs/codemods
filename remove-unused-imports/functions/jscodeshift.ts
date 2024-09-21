import {
  ASTPath,
  Collection,
  InterpreterDirective,
  JSCodeshift,
} from "jscodeshift";

export function removeNode(
  j: JSCodeshift,
  nodePath: ASTPath<InterpreterDirective>
): void {
  j(nodePath).remove();
}

export function getFirstASTNode(j: JSCodeshift, root: Collection<any>) {
  return root.find(j.Program).get("body", 0).node;
}
