/* 
    插件26：https://wx.zsxq.com/dweb2/index/topic_detail/818111288155822
    作用：与插件9_19_字符串调用方法还原类似，但没有后者优雅。
         但是作用比后者大，不仅可以还原字符串，甚至其他字面量：如数组
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
const { isNodeLiteral, isNodePure, color } = require("../0_utils");

console.time("处理完成，耗时");

let jsfile = path.join(__dirname, "9_26_实例调用方法替换为结果_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

/* function isArgsAllLiteral(argumentsNode) {

    function isBaseLiteral(node) {
        if (types.isLiteral(node)) {
            return true;
        }
        if (types.isUnaryExpression(node, { "operator": "-" }) || types.isUnaryExpression(node, { "operator": "+" })) {
            return isBaseLiteral(node.argument);
        }

        if (types.isObjectExpression(node)) {
            let { properties } = node;
            if (properties.length == 0) {
                return true;
            }

            return properties.every(property => isBaseLiteral(property));

        }

        if (types.isArrayExpression(node)) {
            let { elements } = node;
            if (elements.length == 0) {
                return true;
            }
            return elements.every(element => isBaseLiteral(element));
        }

        return false;
    }

    return argumentsNode.every(argument => isBaseLiteral(argument));
}
 */

const pluginInstanceCallFuncRestore =
{
    CallExpression: {
        exit(path) {
            let { scope, node } = path;
            let { callee, arguments } = node;

            // console.log("====>", path.toString());

            //必须是实例在调用函数；且参数必须是字面量
            if (!types.isMemberExpression(callee) || !isNodeLiteral(arguments)) {
                return;
            };

            let { object, property } = callee;
            if (!isNodeLiteral(object)) {
                return;
            }
            try {
                //直接暴力使用eval计算
                let value = eval(path.toString());
                // if (typeof value != "string") { 
                //     return; 
                // }

                // console.log(path.toString(), "----------------------------->", value);
                path.replaceWith(types.valueToNode(value));
            } catch (e) {
                console.log(color.red, "实例调用方法还原报错!", path.toString());
            }
        }
    },
}

traverse(ast, pluginInstanceCallFuncRestore);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);
