const fs = require('fs');
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const types = require("@babel/types");
const generate = require("@babel/generator").default;

//将源代码解析为AST
process.argv.length > 2 ? encodeFile = process.argv[2] : encodeFile = path.join(__dirname, "input.js");
console.log("encodeFile ===> ", encodeFile);


let sourceCode = fs.readFileSync(encodeFile, { encoding: "utf-8" });
let ast = parser.parse(sourceCode);

console.time("处理完毕，耗时");


// let { code } = generate(ast, opts = { jsescOption: { "minimal": true } });
const { code } = generate(ast, { minified: true, compact: true });
// const { code } = generate(ast, { compact: true });
console.log(code);
console.timeEnd("处理完毕，耗时");

process.argv.length > 3 ? decodeFile = process.argv[3] : decodeFile = path.join(__dirname, "output.js");
console.log("decodeFile ===> ", decodeFile);
fs.writeFile(decodeFile, code, (err) => { });
