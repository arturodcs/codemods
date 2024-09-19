import {
  API,
  ASTPath,
  Collection,
  FileInfo,
  ImportDeclaration,
  ImportSpecifier,
  JSCodeshift,
} from "jscodeshift";

function shouldRemoveUnusedIdentifier(name: string) {
  return name !== "React";
}

export default function transformer(file: FileInfo, api: API, options) {
  const j: JSCodeshift = api.jscodeshift;
  const root: Collection<any> = j(file.source);

  const isTypeScriptFile =
    file.path.endsWith(".ts") || file.path.endsWith(".tsx");

  const firstNode = root.find(j.Program).get("body", 0).node;
  const firstNodeComments = firstNode.comments;

  const removeIfUnused = (
    importSpecifierPath: ASTPath<ImportSpecifier>,
    importDeclarationPath: ASTPath<ImportDeclaration>
  ) => {
    if (!importSpecifierPath.value.local) return;
    const varName = importSpecifierPath.value.local.name;

    // Ignorar algunos identificadores
    if (!shouldRemoveUnusedIdentifier(varName)) return;

    const isUsedInScopes = () => {
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
    };

    const isUsedInJSX = () => {
      return root.find(j.JSXIdentifier, { name: varName }).size() > 0;
    };

    const isUsedAsType = () => {
      if (!isTypeScriptFile) return false;
      return (
        root.find(j.TSTypeReference, { typeName: { name: varName } }).size() > 0
      );
    };

    if (!(isUsedInScopes() || isUsedInJSX() || isUsedAsType())) {
      j(importSpecifierPath).remove();
      return true;
    }
    return false;
  };

  const removeUnusedImportSpecifiers = (
    importDeclarationPath: ASTPath<ImportDeclaration>
  ) => {
    const importSpecifiers = importDeclarationPath.get("specifiers");

    importSpecifiers.each((importSpecifierPath: ASTPath<ImportSpecifier>) => {
      removeIfUnused(importSpecifierPath, importDeclarationPath);
    });
  };

  function hasImportSpecifier(importDeclaration: ImportDeclaration): boolean {
    return !!(
      importDeclaration.specifiers && importDeclaration.specifiers.length > 0
    );
  }

  // this function is used to fix the comments deletion issue when the first node is changed
  function fixFirstNodeCommentsDeletion() {
    // if there are changes in the first node and the original first node had comments
    // then we need to add the comments to the new first node
    if (
      firstNode !== newFirstNode &&
      firstNodeComments &&
      firstNodeComments.length > 0
    ) {
      if (newFirstNode.comments && newFirstNode.comments.length > 0) {
        newFirstNode.comments = [
          ...firstNodeComments,
          ...newFirstNode.comments,
        ];
      } else {
        // 
        newFirstNode.comments = firstNodeComments;
      }
    }
  }

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
      }
    });

  const newFirstNodePath = root.find(j.Program).get("body", 0);
  const newFirstNode = newFirstNodePath.node;

  fixFirstNodeCommentsDeletion();

  return root.toSource();
}
