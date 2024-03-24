/*
before：
    插件：if加上括号{}  
    插件：循环语句加上括号{}
*/


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

let jsfile = path.join(__dirname, "控制流收尾处理_code.js");
const code = fs.readFileSync(jsfile, "utf-8");

let ast = parse(code);
const replaceSwitchNOde = {
    "ForStatement|WhileStatement"(path) {
        let { scope, node } = path;
        let body = node.body.body;
        if (body.length != 1 || !types.isSwitchStatement(body[0])) {
            return;
        }
        
        let { discriminant, cases } = body[0];
        let binding = path.scope.getBinding(discriminant.name);
        if (!binding || !binding.path || !binding.path.isVariableDeclarator()) { return; }

        if (cases.length != 1) return;
        let { consequent } = cases[0];
        if (types.isBreakStatement(consequent[consequent.length - 1])) { consequent.pop(); }
        if (types.isExpressionStatement(consequent[consequent.length - 1]) && types.isAssignmentExpression(consequent[consequent.length - 1].expression)) {
            let { left } = consequent[consequent.length - 1].expression;
            if (types.isIdentifier(left, { name: discriminant.name })) {
                consequent.pop();
            }
        }

        path.replaceWithMultiple(consequent);
        binding.path.remove();
    }
}

traverse(ast, replaceSwitchNOde);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log(ouput);

// fs.writeFileSync("result.js", ouput);

