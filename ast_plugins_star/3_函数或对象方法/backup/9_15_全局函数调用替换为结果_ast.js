/* 
    插件15：https://wx.zsxq.com/dweb2/index/topic_detail/584585888158484

    //已融合至插件：函数调用替换为结果
    
*/
const fs = require("fs");
const path = require("path");

const template = require("@babel/template").default;

//解析模块
const parse = require("@babel/parser").parse;
//输出模块
const generate = require("@babel/generator").default;
//遍历模块
const traverse = require("@babel/traverse").default;
//插入模块
const types = require("@babel/types");
const { isNodeLiteral, isNodePure, color } = require("../../0_utils");

console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "9_15_全局函数调用替换为结果_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);



// 参考：https://mp.weixin.qq.com/s/AOglPvMGVYqvpIcSadKTaw
const evaluate_global_func = {
    "CallExpression"(path) {
        let { callee, arguments } = path.node;
        if (!types.isIdentifier(callee) || callee.name == "eval") return;
        if (!arguments.every(arg => types.isLiteral(arg))) return;

        let func = global[callee.name];
        if (typeof func !== "function") return;

        let args = [];
        arguments.forEach((ele, index) => { args[index] = ele.value; });
        let value = func.apply(null, args);
        if (typeof value == "function") return;
        path.replaceInline(types.valueToNode(value));
    },
}
// traverse(ast, evaluate_global_func);


//参考：https://wx.zsxq.com/dweb2/index/topic_detail/584585888158484
const evaluateGlobalFunc = {//系统全局函数的还原，仅限单个名称的全局函数。请在node环境或者浏览器环境下运行。
    "CallExpression"(path) {

        let { callee, arguments } = path.node;
        if (!types.isIdentifier(callee) || callee.name == "eval") return;//仅处理单个函数名，过滤掉 MemberExpression
        if (arguments.length == 0 || !isNodeLiteral(arguments)) return; //判断实参是否全部为字面量。

        let func = this[callee.name];                                   //本地获取函数名
        if (typeof func !== "function") return;                         //如果不是全局函数，则返回

        let args = [];
        arguments.forEach((ele, index) => { args[index] = ele.value; }); //获取实参
        let value = func.apply(null, args);         //计算结果
        if (typeof value == "function" || typeof value == "undefined") return;
        path.replaceWith(types.valueToNode(value)); //替换
    }
}
traverse(ast, evaluateGlobalFunc);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")
