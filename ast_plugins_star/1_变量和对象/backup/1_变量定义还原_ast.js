/* 
    插件1：https://wx.zsxq.com/dweb2/index/topic_detail/584418484544454
    介绍：变量定义初始化为常量时的还原，该变量在其作用域没有发生更改的时候，可以通过绑定来进行还原

    before

    after:
        插件：2_常量折叠
    
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
const { isNodeLiteral, isNodePure } = require("../../0_utils");

let jsfile = path.join(__dirname, "1_变量定义还原_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);
console.time("处理完成，耗时");

const pluginVarDeclaratorRestore = {
    VariableDeclarator(path) {
        let scope = path.scope;
        let { id, init } = path.node;
        //var a=x; 左边a必须为标识符，右边必须是纯节点
        if (!types.isIdentifier(id)) {
            return;
        }

        let is_literal = isNodeLiteral(init);
        let is_pure = isNodePure(init, scope);
        console.log("============================>");
        console.log(path.toString());
        console.log(">>>", path.node.loc.start.line);
        console.log("is_literal:", is_literal);
        console.log("is_pure:", is_pure);
        console.log("<============================\n");
        if (!is_pure) {
            return;
        }
        const binding = scope.getBinding(id.name);
        //变量的定义一定会有binding.
        let { constant, referencePaths, constantViolations } = binding; 
        if (constantViolations.length > 1) {
            return;
        }
        //如果没改变过
        //或者只改变了一次(而且是当次，即声明+初始化，如var a=100)
        if (constant || (constantViolations && constantViolations[0] == path)) {
            for (let referPath of referencePaths) {
                referPath.replaceWith(init);
            }
            // console.log(path.toString())
            path.remove(); //没有被引用，或者替换完成，可直接删除
        }
    },
}






traverse(ast, pluginVarDeclaratorRestore);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")
