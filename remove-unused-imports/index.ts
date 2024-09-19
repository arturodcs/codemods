import {
  API,
  ASTPath,
  Collection,
  FileInfo,
  ImportDeclaration,
  ImportSpecifier,
  JSCodeshift,
} from "jscodeshift";

function isUsedAsType(
  j: JSCodeshift,
  root: Collection<any>,
  file: FileInfo,
  varName: string
) {
  const isTypeScriptFile =
    file.path.endsWith(".ts") || file.path.endsWith(".tsx");

  if (!isTypeScriptFile) return false;
  return (
    root.find(j.TSTypeReference, { typeName: { name: varName } }).size() > 0
  );
}

function isUsedInJSX(j: JSCodeshift, root: Collection<any>, varName: string) {
  return root.find(j.JSXIdentifier, { name: varName }).size() > 0;
}

function shouldRemoveUnusedIdentifier(name: string) {
  return name !== "React";
}

function isUsedInScopes(
  j: JSCodeshift,
  root: Collection<any>,
  importSpecifierPath: ASTPath<ImportSpecifier>,
  varName: string
) {
  return (
    root
      .find(j.Identifier, { name: varName })
      .filter((path) => {
        // Ignorar el propio importador
        if (
          path.parentPath &&
          path.parentPath.value === importSpecifierPath.value
        ) {
          return false;
        }

        // Excluir referencias en propiedades y claves de objetos
        if (
          path.name === "property" &&
          (path.parentPath.value.type === "MemberExpression" ||
            path.parentPath.value.type === "Property")
        ) {
          return false;
        }

        // Excluir referencias en declaraciones de importación
        let currentPath = path;
        while (currentPath) {
          // @ts-ignore
          if (currentPath.value.type === "ImportDeclaration") {
            return false;
          }
          currentPath = currentPath.parentPath;
        }
        return true;
      })
      .size() > 0
  );
}

function hasImportSpecifier(importDeclaration: ImportDeclaration): boolean {
  return !!(
    importDeclaration.specifiers && importDeclaration.specifiers.length > 0
  );
}

function fixFirstNodeCommentsDeletion(
  j: JSCodeshift,
  root: Collection<any>,
  originalFirstNode: any
) {
  // this function is used to fix the comments deletion issue when the first node is changed
  // if there are changes in the first node and the original first node had comments
  // then we need to add the comments to the new first node
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

function handleReturn(root: Collection<any>, file: FileInfo, hasRemovedImports: boolean) {
  return hasRemovedImports ? root.toSource() : file.source;
}

export default function transformer(file: FileInfo, api: API, options) {
  const j: JSCodeshift = api.jscodeshift;
  const root: Collection<any> = j(file.source);

  let hasRemovedImports = false;

  const originalFirstNode = root.find(j.Program).get("body", 0).node;

  const removeIfUnused = (importSpecifierPath: ASTPath<ImportSpecifier>) => {
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
      hasRemovedImports = true;
      return true;
    }
    return false;
  };

  const removeUnusedImportSpecifiers = (
    importDeclarationPath: ASTPath<ImportDeclaration>
  ) => {
    const importSpecifiers = importDeclarationPath.get("specifiers");

    importSpecifiers.each((importSpecifierPath: ASTPath<ImportSpecifier>) => {
      removeIfUnused(importSpecifierPath);
    });
  };

  root
    .find(j.ImportDeclaration)
    .forEach((importDeclarationPath: ASTPath<ImportDeclaration>) => {
      const importDeclaration = importDeclarationPath.node;
      if (!importDeclaration.specifiers) return;

      // ignore import declarations without specifiers (e.g. `import 'styles.css';`)
      if (!hasImportSpecifier(importDeclaration)) return;

      removeUnusedImportSpecifiers(importDeclarationPath);

      // if there are no specifiers left, remove the whole import declaration
      if (importDeclaration.specifiers.length === 0) {
        j(importDeclarationPath).remove();
        hasRemovedImports = true;
      }
    });

  fixFirstNodeCommentsDeletion(j, root, originalFirstNode);

  return handleReturn(root, file, hasRemovedImports);
}
