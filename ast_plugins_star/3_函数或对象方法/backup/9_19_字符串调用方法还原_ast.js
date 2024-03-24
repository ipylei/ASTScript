/* 
    插件19：https://wx.zsxq.com/dweb2/index/topic_detail/212458412814251
    作用：字符串示例方法调用结果值替换
        与插件9_26(实例方法调用替换为结果)，但功能没有后者强大，因为限制死了只对字符串生效
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


let jsfile = path.join(__dirname, "9_19_字符串调用方法还原_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const pluginStringCallFuncRestore = {
    CallExpression: {
        exit(path) {
            let { callee, arguments } = path.node;
            //每一个参数都要求是字面量
            if (!types.isMemberExpression(callee) || !arguments.every(ele => types.isLiteral(ele))) {
                return;
            }
            let { object, property } = callee;
            //对象和其属性都必须是字面量，如("xxx".split())
            if (!types.isStringLiteral(object) || !types.isStringLiteral(property)) {
                return;
            }
            // let value = undefined;
            // if (arguments.length == 0) {
            //     value = object.value[property.value]();
            // }
            // else if (arguments.length == 1) {
            //     value = object.value[property.value](arguments[0].value);
            // }
            // else if (arguments.length == 2) {
            //     value = object.value[property.value](arguments[0].value, arguments[1].value);
            // }
            // else {
            //     return;
            // }

            let args = arguments.map((arg)=>{return arg.value});
            let value = object.value[property.value](...args);
            console.log(path.toString(), "----------------------------->", value);
            path.replaceWith(types.valueToNode(value));
        }
    },
}

traverse(ast, pluginStringCallFuncRestore);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);
