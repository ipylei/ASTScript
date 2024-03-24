
const fs = require("fs");
const path = require("path");

//解析模块
const parse = require("@babel/parser").parse;
//输出模块
const generate = require("@babel/generator").default;

//遍历模块
const traverse = require("@babel/traverse").default;
//插入模块
const types = require("@babel/types");

let jsfile = path.join(__dirname, "code5_enc.js");
const code = fs.readFileSync(jsfile, "utf-8");

let ast = parse(code);

traverse(ast, {

    BinaryExpression(path) {
        let node = path.node;
        if (node.left.type === "StringLiteral" && node.right.type === "StringLiteral" && node.operator === "+") {
            let new_node = types.valueToNode(node.left.value + node.right.value);
            path.replaceWith(new_node);

        }

    }
});


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log(ouput);

// fs.writeFileSync("result.js", ouput);

