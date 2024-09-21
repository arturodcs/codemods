import {
  API,
  ASTPath,
  Collection,
  FileInfo,
  ImportDeclaration,
  ImportSpecifier,
  JSCodeshift,
} from "jscodeshift";
import {
  getInterpreterDirectivePath,
  removeInterpreterDirective,
} from "./functions/interpreter-directive";
import { getFirstASTNode, removeNode } from "./functions/jscodeshift";
import { isUsedInJSX, isUsedInScopes, isUsedAsType } from "./functions/utils";
import { fixFirstNodeCommentsDeletion } from "./functions/first-comment-deletion-bug";

function shouldRemoveUnusedIdentifier(name: string) {
  return name !== "React";
}

function hasImportSpecifier(importDeclaration: ImportDeclaration): boolean {
  return !!(
    importDeclaration.specifiers && importDeclaration.specifiers.length > 0
  );
}

export default function transformer(file: FileInfo, api: API, options) {
  const j: JSCodeshift = api.jscodeshift;
  const root: Collection<any> = j(file.source);

  let wasFileModified = false;

  const originalFirstNode = getFirstASTNode(j, root);

  // interpreter directive handling due a bug in jscodeshift
  const interpreterDirectivePath = getInterpreterDirectivePath(j, root);
  let interpreterDirectiveValue: string | null = null;
  if (interpreterDirectivePath) {
    interpreterDirectiveValue = removeInterpreterDirective(
      j,
      root,
      interpreterDirectivePath
    );
  }

  function removeIfUnused(importSpecifierPath: ASTPath<ImportSpecifier>) {
    if (!importSpecifierPath.value.local) return;
    const varName = importSpecifierPath.value.local.name;

    if (
      shouldRemoveUnusedIdentifier(varName) &&
      !(
        isUsedInScopes(j, root, importSpecifierPath, varName) ||
        isUsedInJSX(j, root, varName) ||
        isUsedAsType(j, root, file, varName)
      )
    ) {
      j(importSpecifierPath).remove();
      wasFileModified = true;
    }
  }

  root
    .find(j.ImportDeclaration)
    .forEach((importDeclarationPath: ASTPath<ImportDeclaration>) => {
      const importDeclaration = importDeclarationPath.node;
      if (!importDeclaration.specifiers) return;

      // ignore import declarations without specifiers
      // (e.g. `import 'styles.css';`)
      if (!hasImportSpecifier(importDeclaration)) return;

      const importSpecifiers = importDeclarationPath.get("specifiers");
      importSpecifiers.each((importSpecifierPath: ASTPath<ImportSpecifier>) => {
        removeIfUnused(importSpecifierPath);
      });

      // if there are no specifiers left, remove the whole import declaration
      if (importDeclaration.specifiers.length === 0) {
        j(importDeclarationPath).remove();
        wasFileModified = true;
      }
    });

  fixFirstNodeCommentsDeletion(j, root, originalFirstNode);

  if (wasFileModified) {
    let source = root.toSource();

    // add back the interpreter directive if it was removed
    if (interpreterDirectiveValue) {
      source = `#!${interpreterDirectiveValue}\n${source}`;
    }

    return source;
  } else {
    return file.source;
  }
}
