/* 
    插件1：https://wx.zsxq.com/dweb2/index/topic_detail/584418484544454
        介绍：变量定义初始化为常量时的还原，该变量在其作用域没有发生更改的时候，可以通过绑定来进行还原
    插件1(赋值语句还原)：https://wx.zsxq.com/dweb2/index/topic_detail/584418822184214

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
const { isNodeLiteral, isNodePure, color } = require("../0_utils");


// let jsfile = path.join(__dirname, "1_变量引用还原_code.js");
let jsfile = path.join(__dirname, "变量引用还原_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);
console.time("处理完成，耗时");

const pluginVarReferenceRestore = {
    // 插件1：https://wx.zsxq.com/dweb2/index/topic_detail/584418484544454
    VariableDeclarator(path) {
        let { scope, parentPath } = path;
        // console.log(parentPath.toString());

        let { id, init } = path.node;
        //var a=x; 左边a必须为标识符，右边必须是纯节点
        if (!types.isIdentifier(id) || !isNodePure(init, scope)) {
            return;
        }
        const binding = scope.getBinding(id.name);
        if (!binding) { return; }

        let { constant, referencePaths, constantViolations } = binding;
        if (constantViolations.length > 1) { return; }

        //如果没改变过; 或者只改变了一次(var a = 10; var a = 5;) 
        // if (constant || (constantViolations.length === 1 && constantViolations[0] == path)) {
        let cicleChange = constantViolations.length === 1 && constantViolations[0] == path
            && parentPath.parentPath.isBlockStatement()
            && (parentPath.parentPath.parentPath.isForStatement() || parentPath.parentPath.parentPath.isWhileStatement());
        //如果是在循环体中重复定义，且原始并未初始化则可以还原 (var a; var a = 5;)
        let valid = constant || (cicleChange && binding.path.node.init == null);
        if (valid) {
            var referCount = referencePaths.length;
            for (let referPath of referencePaths) {
                console.log("变量声明语句还原", referPath.toString(), '<--->', generate(init).code);
                referPath.replaceWith(init);
                referCount--;
            }

            if (referCount == 0) {
                path.remove(); //没有被引用，或者替换完成，可直接删除
            } else {
                console.log("变量声明->还有被引用的地方", path.toString());
            }

        }
    },

    // 插件1：https://wx.zsxq.com/dweb2/index/topic_detail/584418822184214
    AssignmentExpression: {
        exit(path) {
            let { scope, node, parentPath } = path;
            let { left, operator, right } = node;
            if (!types.isIdentifier(left) || operator != "=" || !isNodePure(right, scope)) {
                return;
            }
            let binding = scope.getBinding(left.name);
            if (!binding) { return; }
            let { constant, referencePaths, constantViolations } = binding;

            //如果没有binding,或者赋值语句本身改变了它，因此这里判断只有一处改变。
            if (constantViolations.length > 1) { return; }
            if (constantViolations.length === 1 && constantViolations[0] !== path) { return; }

            var referCount = referencePaths.length;
            for (let referPath of referencePaths) {
                console.log("变量赋值语句还原", referPath.toString(), '<--->', generate(right).code);
                referPath.replaceWith(right);
                referCount--;
            }

            // if (parentPath.isExpressionStatement() || parentPath.isSequenceExpression()) {
            //     path.remove();
            // }

            if (referCount == 0) {
                //满足这个条件时，顺便将绑定path也删除
                if (binding.path.isVariableDeclarator() && binding.path.node.init == null) {
                    binding.path.remove();
                }

                //排除一些情况：($ = 9) * (f = 10)
                if (parentPath.isExpressionStatement() || parentPath.isSequenceExpression()) {
                    path.remove(); //没有被引用，或者替换完成，可直接删除
                }
                //处理以下情况：($ = 9) * (f = 10) 
                else if (parentPath.isBinaryExpression()) {
                    path.replaceWith(right);
                }

            } else {
                console.log("变量赋值->还有被引用的地方", path.toString());
            }
        }
    },
}

traverse(ast, pluginVarReferenceRestore);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")
