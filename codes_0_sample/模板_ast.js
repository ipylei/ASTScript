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
//节点构造模块
const template = require("@babel/template").default;

// const { isNodeLiteral, isNodePure, color } = require("../../ast_plugins_star/0_utils");
console.time("处理完成，耗时");


//将源代码解析为AST
let encodeFile = process.argv.length > 2 ? process.argv[2] : path.join(__dirname, "input.js");
let decodeFile = process.argv.length > 3 ? process.argv[3] : path.join(__dirname, "output.js");
let decodeFileName = decodeFile.split("\\").at(-1);
let step = decodeFileName.match(/^\d+/)?.at(0);

const code = fs.readFileSync(encodeFile, "utf-8");
let ast = parse(code);
const Plugin = {
    FunctionDeclaration(path) {
        let { node, parentPath, scope } = path;

        let binding = scope.getBinding("a");
        let pbinding = parentPath.scope.getBinding("a");
        console.log("============");
    }
}
traverse(ast, Plugin);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast, opts = {
    "compact": false,  // 是否压缩代码
    "comments": false,  // 是否保留注释
    "jsescOption": { "minimal": true },  //Unicode转义
}).code;

// const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


console.log("encodeFile ===> ", encodeFile);
console.log("decodeFile ===> ", decodeFile);
// fs.writeFile(decodeFile, ouput, (err) => { });



/* 
let envCode = fs.readFileSync(path.join(__dirname, "env.js"), { encoding: "utf-8" });
let envAst = parse(envCode);  //压缩环境代码
let envCodeCompact = generate(envAst, opts = { "compact": true, }).code;
eval(envCodeCompact);         //运行环境代码

console.log(envCodeCompact);

let envFuncNames = [];        //提取环境代码中的函数名
traverse(envAst, {
    FunctionDeclaration(path) {
        let { parentPath, node } = path;
        if (!parentPath.isProgram()) {
            return; //非全局函数不处理
        }

        let { id, params, body } = node;
        let length = body.body.length;
        //参数为0；函数体为空；函数没有返回值
        if (params.length == 0 || length == 0 || !types.isReturnStatement(body.body[length - 1])){
            return;
        }
        envFuncNames.push(id.name);
    }
})

console.log(envFuncNames);
 */