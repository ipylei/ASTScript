/* 
    插件9(简单函数调用替换为结果)：https://wx.zsxq.com/dweb2/index/topic_detail/181581428844442
    插件15(全局函数调用替换为结果)：https://wx.zsxq.com/dweb2/index/topic_detail/584585888158484
    
    before:
        【*】插件：变量引用还原

        插件：函数表达式 => 函数声明
        插件：函数使用call和apply进行调用
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
const { isNodeLiteral, isNodePure, color } = require("../0_utils");

console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "函数调用替换为结果_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const pluginFuncToVal = {
    // 插件9：https://wx.zsxq.com/dweb2/index/topic_detail/181581428844442
    // 这里不搞var a = function(){}; 或者var a; a = function(){}。 是因为两者都有可能重新赋值
    FunctionDeclaration(path) {
        let { node, parentPath, scope } = path;
        let { id, body } = node;
        let define_line = node.loc.start.line;
        let func_name = node.id.name;

        //最后一句必须为return语句
        let len = body.body.length;
        if (!types.isReturnStatement(body.body[len - 1])) {
            return;
        }

        const binding = parentPath.scope.getBinding(id.name);
        // console.log("parentPath.scope.path=> ", parentPath.scope.path.toString());
        // console.log("===> call", binding.referencePaths[0].parentPath.toString());
        // console.log("============================================================");
        // let binding1 = scope.getBinding(id.name)
        // console.log("path.scope.path=> ", scope.path.toString());
        // console.log("===> call", binding1.referencePaths[0].parentPath.toString());
        // return;

        if (!binding || !binding.constant){
            return;
        }
        
        //没有被使用的情况
        // if (!binding.referenced && !parentPath.isProgram()) {
        if (!binding.referenced) {
            path.remove();
            return;
        }

        let sourceCode = path.toString();
        if (sourceCode.includes("try") || sourceCode.includes("random") || sourceCode.includes("Date")) {
            //返回值不唯一不做处理
            return;
        }

        //直接eval，如果缺环境，让其主动报错，再补上即可。下同,函数声明eval不会报错。
        eval(sourceCode);

        try {
            let referCount = binding.referencePaths.length;
            for (const referPath of binding.referencePaths) {
                let { parentPath, node } = referPath;
                let call_line = node.loc.start.line;
                console.log(`Function:${func_name}, define: ${define_line}, call: ${call_line}`);
                //排除如下情况：a=func; func2("xxx", func);
                if (!parentPath.isCallExpression({ "callee": node })) {
                    continue;
                }

                let arguments = parentPath.node.arguments;
                //判断实参必须为字面量
                if (arguments.length == 0 || !isNodeLiteral(arguments)) {
                    continue;
                }

                let value = eval(parentPath.toString());
                if (typeof value == "function" || typeof value == "undefined") { continue; }
                if (!['string', 'number', 'boolean'].includes(typeof value)) { continue; }

                console.log("局部函数替换为结果=>", parentPath.toString(), "------->", value);
                parentPath.replaceWith(types.valueToNode(value));
                referCount--;
            }

            if (referCount == 0) {
                path.remove();
            } else {
                console.log("函数声明->还有被引用的地方", referCount, path.toString());
            }

        } catch (error) {
            console.log(color.red, `局部函数还原报错, name:${func_name}, 原因:${error}`);
        }

    },

    // 插件15：https://wx.zsxq.com/dweb2/index/topic_detail/584585888158484
    CallExpression(path) {
        let { callee, arguments } = path.node;
        //仅处理单个函数名，过滤掉 MemberExpression(即this.xxx(), window.xxx()等)
        if (!types.isIdentifier(callee) || callee.name == "eval") return;
        //判断实参是否全部为字面量。过滤掉参数为0的原因是这些函数大多数结果充满不确定性
        if (arguments.length == 0 || !isNodeLiteral(arguments)) return;
        
        let func = this[callee.name];                                     //根据函数名获取本地Global函数
        if (typeof func !== "function") { return; }                       //如果不是全局函数，则返回
        // let args = arguments.map(x => x.value);                        //获取实参
        // let value = func.apply(null, args);                            //计算结果
        let value = eval(path.toString());

        // if (typeof value == "function" || typeof value == "undefined") return;
        if (!['string', 'number', 'boolean'].includes(typeof value)) { return; }
        console.log("全局函数替换=>", path.toString(), "------->", value);
        path.replaceWith(types.valueToNode(value));                      //替换
    }
}
traverse(ast, pluginFuncToVal);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast, { comments: false }).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")
