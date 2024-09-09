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

const { isNodeLiteral, isNodePure, color } = require("../../../ast_plugins_star/0_utils");
console.time("处理完成，耗时");


//将源代码解析为AST
let encodeFile = process.argv.length > 2 ? process.argv[2] : path.join(__dirname, "code.js");
let decodeFile = process.argv.length > 3 ? process.argv[3] : path.join(__dirname, "1_output.js");
let decodeFileName = decodeFile.split("\\").at(-1);
let step = parseInt(decodeFileName.match(/^\d+/)?.at(0));

const code = fs.readFileSync(encodeFile, "utf-8");
let ast = parse(code);
/* 字符串还原 */
const pluginStringSimplify = {
    // 处理 \x77\x36\x77\x35\x42\x51\x3d\x3d
    NumericLiteral(path) {
        let { node } = path;
        if (node.extra && /^0[obx]/i.test(node.extra.raw)) {
            //console.log(path.toString());
            node.extra = undefined;
        }
    },
    StringLiteral(path) {
        let { node } = path;
        if (node.extra) {
            // node.extra = undefined;

            // console.log("====", path.toString());
            // delete path.node.extra;
            // path.node.extra.raw = `${node.extra.raw[0]}${path.node.extra.rawValue}${node.extra.raw[0]}`;

            // 处理 '\u5220\u9664\u7248\u672C\u53F7\uFF0Cjs\u4F1A\u5B9A\u671F\u5F39\u7A97'
            if (/\\u/gi.test(node.extra.raw)) {
                // console.log(path.toString());
                // node.extra = undefined;
                path.node.extra.raw = `${node.extra.raw[0]}${path.node.extra.rawValue}${node.extra.raw[0]}`;

            }

            // 处理 '\x77\x36\x77\x35\x42\x51\x3d\x3d'
            else if (/\\[ux]/gi.test(node.extra.raw)) {
                // console.log(path.toString());
                node.extra = undefined;
            }

        }
    },
}
step === 1 && traverse(ast, pluginStringSimplify);


const env_code = fs.readFileSync(path.join(__dirname, "env.js"), "utf-8");
eval(env_code);
// console.log($_0x473b)


const pluginFuncToVal = {
    // 插件15：https://wx.zsxq.com/dweb2/index/topic_detail/584585888158484
    CallExpression(path) {
        let { callee, arguments } = path.node;
        //仅处理单个函数名，过滤掉 MemberExpression(即this.xxx(), window.xxx()等)
        if (!types.isIdentifier(callee) || callee.name == "eval") return;
        if(callee.name != "$_0x473b"){
            return;
        }
        console.log(callee.name);
        //判断实参是否全部为字面量。过滤掉参数为0的原因是这些函数大多数结果充满不确定性
        if (arguments.length == 0 || !isNodeLiteral(arguments)) return;

        // let args = arguments.map(x => x.value);                        //获取实参
        // let value = func.apply(null, args);                            //计算结果
        let value = eval(path.toString());

        // if (typeof value == "function" || typeof value == "undefined") return;
        if (!['string', 'number', 'boolean'].includes(typeof value)) { return; }
        console.log("全局函数替换=>", path.toString(), "------->", value);
        path.replaceWith(types.valueToNode(value));                      //替换
    }
}
step === 2 && traverse(ast, pluginFuncToVal);


// 检查路径或其任一子路径是否包含逗号表达式
function containsSequenceExpression(path) {
    let containsSequence = false;
    // 深度优先遍历当前路径及其所有子路径
    path.traverse({
        SequenceExpression(_path) {
            containsSequence = true;
            _path.stop(); // 找到逗号表达式后立即停止遍历
        }
    });
    return containsSequence;
}

const pluginConstantFold2 = {
    //"Identifier"可以还原变量定义
    "Identifier|BinaryExpression|UnaryExpression|MemberExpression": {
        exit(path) {
            if (containsSequenceExpression(path)) {
                return;
            }
            if (path.isUnaryExpression({ operator: "-" }) || path.isUnaryExpression({ operator: "void" })) {
                return;
            }
            const { confident, value } = path.evaluate();
            if (!confident) { return; }
            if (typeof value == "function") { return; }
            if (typeof value == 'number' && (!Number.isFinite(value))) { return; }
            if (path.isIdentifier() && typeof value == "object") { return; }
            console.log(value)
            path.replaceWith(types.valueToNode(value));
        }
    },
}
step === 3 && traverse(ast, pluginConstantFold2);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast, opts = {
    "compact": false,  // 是否压缩代码
    "comments": false,  // 是否保留注释
    "jsescOption": { "minimal": true },  //Unicode转义
}).code;

// const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
// console.log(ouput);
console.timeEnd("处理完成，耗时")


console.log("encodeFile ===> ", encodeFile);
console.log("decodeFile ===> ", decodeFile);
fs.writeFile(decodeFile, ouput, (err) => { });



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