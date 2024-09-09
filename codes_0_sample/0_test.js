
const template = require("@babel/template").default;

let newNode = template.ast("let a = 36, b=37;");
console.log(newNode);