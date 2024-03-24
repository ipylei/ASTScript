/* 
    插件 
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
console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "7_专用插件_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const forToString = {
    ForStatement(path) {
        let body = path.get("body.body");
        if (!body || body.length !== 2) return;

        if (!body[0].isVariableDeclaration() || !body[1].isExpressionStatement()) {
            //循环体的第一个语句为声明语句，第二个语句为表达式语句
            return;
        }

        let body0_code = body[0].toString();
        let body1_code = body[1].toString();
        if (body0_code.indexOf("charCodeAt") != -1 && body1_code.indexOf("String.fromCharCode") != -1) {
            //根据上面的分析而来
            //dosomething

            try {
                let expression = body[1].node.expression; //a += String.fromCharCode(r
                
                let name = expression.left.name;
                let code = path.toString() + "\nreturn " + name;
                let func = new Function("", code);
                let value = func();
                let new_node = types.VariableDeclaration("var", [types.VariableDeclarator(types.Identifier(name), types.valueToNode(value))]);
                path.replaceWith(new_node);

            } catch (e) { };

        }

    }
}


traverse(ast, forToString);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);
