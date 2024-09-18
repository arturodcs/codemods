// dynamic imports should not be affected by the codemod
const moduleName = "./module";
import(moduleName).then((module) => {
  module.doSomething();
});
