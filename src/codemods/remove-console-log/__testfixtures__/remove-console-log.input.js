function test() {
  console.log("Hello, World!");
}

if (true) {
  console.log("This should be removed");
}

function multipleLogs() {
  console.log("First log");
  console.log("Second log");
}

function nestedLog() {
  setTimeout(() => {
    console.log("Inside a callback");
  }, 1000);
}

function logAndOther() {
  console.log("Logging this");
  alert("Alerting this");
}

function logWithComment() {
  console.log("This will be removed"); // Comment after log
}

function logExpression() {
  console.log(1 + 2);
}

function multipleParams() {
  console.log("First param", "Second param", { key: "value" });
}

for (let i = 0; i < 5; i++) {
  console.log(i);
}

class Example {
  method() {
    console.log(this.value);
  }
}