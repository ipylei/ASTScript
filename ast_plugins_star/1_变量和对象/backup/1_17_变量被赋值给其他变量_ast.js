/* 
    插件17：https://wx.zsxq.com/dweb2/index/topic_detail/214218122512851

    【注意】：可以用变量引用还原替代，且功能更强大
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


let jsfile = path.join(__dirname, "1_17_变量被赋值给其他变量_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

let rightVarList = new Map();

const collectMatchVarDefine = { //收集符合条件的变量定义，避免重复判断浪费时间。
    VariableDeclarator(path) {
        let { node, scope } = path;
        let { id, init } = node;
        if (!types.isIdentifier(id) || !types.isIdentifier(init)) {
            return;
        }
        const binding = scope.getBinding(id.name);
        if (!binding || !binding.constant) //如果被更改则不能进行替换
        {
            return;
        }

        if (rightVarList.has(id.name)) {
            console.log("发现同名变量，请不要使用该插件。");
        }

        rightVarList.set(id.name, init.name);
    }
}
traverse(ast, collectMatchVarDefine);

const deleteRepeatDefineOfVar = {
    VariableDeclarator(path) {
        let { parentPath, node, scope } = path;
        let { id, init } = node;
        let oldId = id;
        let name = id.name;

        const binding = scope.getBinding(name);
        if (!binding || !binding.constant)
            return;

        scope.traverse(scope.block, {
            VariableDeclarator(path) {
                let { node, scope } = path;
                let { id, init } = path.node;
                if (!rightVarList.has(id.name) || !types.isIdentifier(init, { name: name })) {
                    return;
                }

                const binding = scope.getBinding(id.name);
                for (let referPath of binding.referencePaths) {
                    referPath.replaceWith(oldId); //使用replaceWith函数比rename函数更快。
                }
                path.remove();
                scope.crawl();

            },
        });
    },
}
traverse(ast, deleteRepeatDefineOfVar);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);
