/* 
    插件2：常量折叠
        简易版：https://wx.zsxq.com/dweb2/index/topic_detail/811452245148222
        丰富版：https://wx.zsxq.com/dweb2/index/topic_detail/181581428224242
 */

// import { parse } from "@babel/parser";
// import fs from "fs";

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

let jsfile = path.join(__dirname, "2_常量折叠_code.js");
const code = fs.readFileSync(jsfile, "utf-8");


console.time("处理完成，耗时");
let ast = parse(code);




//简易版
const pluginConstantFold = {
    "BinaryExpression|UnaryExpression|CallExpression|MemberExpression"(path) {
        // 排除一元表达式中诸如 m = -1; m = void 0这种情况;
        if (path.isUnaryExpression({ operator: "-" }) || path.isUnaryExpression({ operator: "void" })) {
            return;
        }
        const { confident, value } = path.evaluate();
        if (!confident) {
            return;
        }

        if (path.isIdentifier() && typeof value == "object") {
            return;
        }
        if (typeof value == 'number' && (!Number.isFinite(value))) {
            return;
        }
        path.replaceWith(types.valueToNode(value));
        ;
    },
}


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

//丰富版
const pluginConstantFold2 = {
    //"Identifier"可以还原变量定义
    "Identifier|BinaryExpression|UnaryExpression|MemberExpression": {
        exit(path) {
            if(containsSequenceExpression(path)){
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

/* 字符串连加

示例：
    a = "He";
    a += "llo";
    a += ",";
    a += "AST!";

结果：a = "hello,AST!";

参考：
    https://wx.zsxq.com/dweb2/index/topic_detail/2855814421844841
    https://wx.zsxq.com/dweb2/index/topic_detail/411525214521288

*/



// 遍历节点，使用enter方法
// traverse(ast, pluginConstantFold);
traverse(ast, pluginConstantFold2);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log(ouput);


console.timeEnd("处理完成，耗时"); 