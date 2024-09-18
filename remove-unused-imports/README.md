# Codemod: Remove Unused Imports
This codemod is designed to automatically remove unused import statements from your JavaScript and TypeScript codebase. It helps in keeping your code clean, reducing clutter, and potentially improving build times by eliminating unnecessary dependencies.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Examples](#examples)
- [Test Cases](#test-cases)
- [Limitations](#limitations)


## Introduction
In large codebases, it's common to accumulate import statements that are no longer used due to refactoring, feature removal, or code evolution. Manually identifying and removing these unused imports can be tedious and error-prone. This codemod automates the process, ensuring your code remains clean and maintainable.

## Features
- Supports JavaScript and TypeScript: Works with both `.js`, `.jsx`, `.ts`, and `.tsx` files.
- Handles Various Import Types:
    - Default imports
    - Named imports
    - Namespace imports (`import * as`)
    - Mixed imports (default and named)
    - Side-effect imports (`import './styles.css';`)
- Considers Usages in:
    - Code execution paths
    - JSX elements
    - Type annotations (TypeScript)
    - Re-exports
- Ignores:
    - Comments and strings (does not consider them as usage)
    - Unused imports mentioned in comments
    - Import statements without specifiers (assumed to have side effects)

## Examples
### Before Transformation
```
// Example: src/components/App.js
import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from './Button';
import * as utils from './utils';
import './styles.css';

function App() {
  const [state, setState] = useState(null);

  return (
    <div>
      <Button onClick={() => setState('Clicked!')}>Click me</Button>
      {state}
    </div>
  );
}

export default App;
```

### After Transformation
```
import React from 'react';
import { useState } from 'react';
import { Button } from './Button';
import './styles.css';

function App() {
  const [state, setState] = useState(null);

  return (
    <div>
      <Button onClick={() => setState('Clicked!')}>Click me</Button>
      {state}
    </div>
  );
}

export default App;
```
#### Explanation:
- Removed `useEffect` from the import statement because it wasn't used.
- Removed the namespace import `* as utils` because it wasn't used.
- Kept `React` import.
- Kept the side-effect import `import './styles.css';`.

## Test Cases
The codemod has been tested extensively to ensure it handles a wide range of scenarios. Below are detailed test cases with input and expected output.

#### Case 1: Unused Default Import
Input:
```
import config from "./config.json";

function App() {
  return <div>Hello World</div>;
}

export default App;
```
Output:
```
function App() {
  return <div>Hello World</div>;
}

export default App;
````

#### Case 2: Unused Named Import
Input:
```
import { useState, useEffect } from 'react';

function Component() {
  console.log('Component mounted');
}

export default Component;
```
Output:
```
function Component() {
  console.log('Component mounted');
}

export default Component;
```

#### Case 3: Unused Namespace Import  
Input:
```
import * as utils from './utils';

const result = 42;

export default result;
```
Output:
```
const result = 42;

export default result;
```

#### Case 4: Mixed Import with Some Unused Specifiers
Input:
```
import React, { useState, useEffect } from 'react';

function App() {
  const [state, setState] = useState(null);
  return <div>{state}</div>;
}

export default App;
```
Output:
```
import React, { useState } from 'react';

function App() {
  const [state, setState] = useState(null);
  return <div>{state}</div>;
}

export default App;
```

#### Case 5: Side-Effect Import (Should Not Be Removed)
Input:
```
import './styles.css';

function Component() {
  return <div>Styled Component</div>;
}

export default Component;
```
Output:
```
import './styles.css';

function Component() {
  return <div>Styled Component</div>;
}

export default Component;
```

#### Case 6: Import Used in JSX
Input:
```
import { Button } from 'components';

function App() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}

export default App;
```
Output:
```
import { Button } from 'components';

function App() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}

export default App;
```

#### Case 7: Import Mentioned in Comments (Not considered, should be removed)
Input:
```
import { helper } from './helpers';

// TODO: use helper function here

function doSomething() {
  console.log('Doing something');
}

export default doSomething;
```
Output:
```
// TODO: use helper function here

function doSomething() {
  console.log('Doing something');
}

export default doSomething;
```

#### Case 8: Import Used as Type in TypeScript
Input:
```
import { User } from './types';

function getUser(id: number): User {
  // Implementation
}

export default getUser;
```
Output:
```
import { User } from './types';

function getUser(id: number): User {
  // Implementation
}

export default getUser;
```

#### Case 9: Import Used in Generic Type
Input: 
```
import React, { Component } from 'react';

interface Props {
  message: string;
}

class MyComponent extends Component<Props> {
  render() {
    return <div>{this.props.message}</div>;
  }
}

export default MyComponent;
```
Output:
```
import React, { Component } from 'react';

interface Props {
  message: string;
}

class MyComponent extends Component<Props> {
  render() {
    return <div>{this.props.message}</div>;
  }
}

export default MyComponent;
```

#### Case 10: Unused Renamed Import
Input:
```
import { foo as bar } from './module';

function doSomething() {
  console.log('Doing something');
}

export default doSomething;
```
Output:
```
function doSomething() {
  console.log('Doing something');
}

export default doSomething;
```

#### Case 11: Imports with Name Conflicts
Input:
```
import { duplicate } from './module1';
import { duplicate as dup } from './module2';

function test() {
  console.log(duplicate());
}

export default test;
```
Output:
```
import { duplicate } from './module1';

function test() {
  console.log(duplicate());
}

export default test;
```

#### Case 12: Re-exported Import
Input:
```
import { helper } from './helpers';

export { helper };
```
Output:
```
import { helper } from './helpers';

export { helper };
```

#### Case 13: Dynamic Import (Should Not Be Affected)
Input:
```
const moduleName = './module';
import(moduleName).then((module) => {
  module.doSomething();
});
```
Output:
```
const moduleName = './module';
import(moduleName).then((module) => {
  module.doSomething();
});
```

#### Case 14: Import with Alias Used
Input:
```
import { originalName as aliasName } from './module';

function test() {
  console.log(aliasName());
}

export default test;
```
Output:
```
import { originalName as aliasName } from './module';

function test() {
  console.log(aliasName());
}

export default test;
```

#### Case 15: Multiple Imports with Some Unused
Input:
```
import { a, b, c } from './module';

function test() {
  console.log(a);
}

export default test;
```
Output:
```
import { a } from './module';

function test() {
  console.log(a);
}

export default test;
```

#### Case 16: Import Used in Method Chain
Input:
```
import _ from 'lodash';

const result = _.chain([1, 2, 3]).map(n => n * 2).value();

export default result;
```
Output:
```
import _ from 'lodash';

const result = _.chain([1, 2, 3]).map(n => n * 2).value();

export default result;
```

#### Case 17: Import Used as Type Qualifier in TypeScript
Input:
```
import * as utils from './utils';

const data: utils.DataType = {};

export default data;
```
Output:
```
import * as utils from './utils';

const data: utils.DataType = {};

export default data;
```

#### Case 18: Import Used in JSDoc Comment (Not considered, should be removed)
Input:
```
import { User } from './types';

/**
 * @param {User} user
 */
function printUser(user) {
  console.log(user.name);
}

export default printUser;
```
Output:
```
/**
 * @param {User} user
 */
function printUser(user) {
  console.log(user.name);
}

export default printUser;
```

#### Case 19: Import Used in String (Not considered, should be removed)
Input:
```
import { VERSION } from './constants';

console.log('Current version is VERSION');

export default {};
```
Output:
```
console.log('Current version is VERSION');

export default {};
```

#### Case 20: JSON Module Import
Input:
```
import config from './config.json';

console.log(config.port);

export default config;
```
Output:
```
import config from './config.json';

console.log(config.port);

export default config;
```

#### Case 21: Import Used in eval (Not considered, should be removed)
Input:
```
import { secretKey } from './secrets';

function getSecret() {
  return eval('secretKey');
}

export default getSecret;
```
Output:
```
function getSecret() {
  return eval('secretKey');
}

export default getSecret;
```

#### Case 22: Import Used in Template Literal
Input:
```
import { name } from './info';

const message = `Hello, ${name}!`;

export default message;
```
Output:
```
import { name } from './info';

const message = `Hello, ${name}!`;

export default message;
```

#### Case 23: Import Used in Destructuring
Input:
```
import { data } from './module';

const { a, b } = data;

export default a;
```
Output:
```
import { data } from './module';

const { a, b } = data;

export default a;
```

#### Case 24: Import Used in Callback Function
Input:
```
import { fetchData } from './api';

setTimeout(() => {
  fetchData();
}, 1000);

export default {};
```
Output:
```
import { fetchData } from './api';

setTimeout(() => {
  fetchData();
}, 1000);

export default {};
```

#### Case 25: Conditionally Used Import
Input:
```
import { feature } from './features';

if (Math.random() > 0.5) {
  feature();
}

export default {};
```
Output:
```
import { feature } from './features';

if (Math.random() > 0.5) {
  feature();
}

export default {};
```

#### Case 26: Ignoring React Default Import
Input:
```
import React from 'react';

function App() {
  return <div>Hello World</div>;
}

export default App;
```
Output:
```
import React from 'react';

function App() {
  return <div>Hello World</div>;
}

export default App;
```

#### Case 27: Keep First Line Comment
Input:
```
// This is a comment
import { helper } from './helpers';

function doSomething() {
  console.log('Doing something');
}

export default doSomething;
```
Output:
```
// This is a comment

function doSomething() {
  console.log('Doing something');
}

export default doSomething;
```


## Limitations
- **Dynamic Usages**: The codemod relies on static analysis and may not detect usages in dynamic contexts like eval or computed property names.
- **Comments and Strings**: References to imports in comments or strings are not considered as usages.
- **Tooling Compatibility**: If you have custom tooling that relies on certain import statements being present (e.g., for code generation or documentation), verify the impact before applying the codemod.
