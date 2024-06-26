/* 
    插件4：https://wx.zsxq.com/dweb2/index/topic_detail/212884181415541
    
    before:
        插件：对象属性加上引号
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

let jsfile = path.join(__dirname, "对象属性访问方式更改_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
console.time("处理完成，耗时");
let ast = parse(code);

// b.length; --> b["length"]
// 注意：es6语法时: super.xxx 还原为 super["xxx"]会报错!
const pluginIdentifierToLiteral = {
    //b.length
    MemberExpression:
    {
        exit(path) {
            let { node } = path;
            const prop = node.property;
            if (!node.computed && types.isIdentifier(prop)) {
                node.property = types.StringLiteral(prop.name);
                node.computed = true;
            }
        }
    },

    //给属性加上引号：a={name:"leizi"} ===> a={"name":"leizi"}
    //其实感觉单独提取出去比较合适
   /*  ObjectProperty:
    {
        exit(path) {
            let { node } = path;
            const key = node.key;
            //加上引号  {xxx: value} => {"xxx": value}
            if (types.isIdentifier(key) && !node.computed) {
                node.key = types.StringLiteral(key.name);
                return;
            }
            //属性为表达式：{["xxx"]: value}，替换为值{"xxx": value}
            if (types.isStringLiteral(key) && node.computed) {
                node.computed = false;
                return;
            }
        }
    }, */
}


// b["length"] -->  b.length
const pluginLiteralToIdentifier = {
    MemberExpression:
    {
        exit(path) {
            let { node } = path;
            const prop = node.property;
            if (node.computed && types.isStringLiteral(prop)) {
                node.property = types.Identifier(prop.value);
                node.computed = false;
            }
        }
    },
}

traverse(ast, pluginIdentifierToLiteral);
// traverse(ast, pluginLiteralToIdentifier);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")
