/* 
    before:
        对象属性合并
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

let jsfile = path.join(__dirname, "4_对象属性加上引号_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
console.time("处理完成，耗时");
let ast = parse(code);

const pluginFormatProperty = {
    ObjectProperty:
    {
        exit(path) {
            let { node } = path;
            const key = node.key;
            //加上引号  {xxx: value} => {"xxx": value}
            if (types.isIdentifier(key) && !node.computed) {
                node.key = types.StringLiteral(key.name);
                return;
            }
            //属性为表达式{["xxx"]: value}，替换为值{"xxx": value}
            if (types.isStringLiteral(key) && node.computed) {
                node.computed = false;
                return;
            }
        }
    },
}
traverse(ast, pluginFormatProperty);
// traverse(ast, pluginLiteralToIdentifier);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")
