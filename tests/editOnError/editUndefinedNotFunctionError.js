var a = {};
function foo() {
  a.bar();
}
try {
  foo();
} catch(exc) {
  console.log(exc.stack);
  var stack = exc.stack.split('\n');
  console.log(stack);
}