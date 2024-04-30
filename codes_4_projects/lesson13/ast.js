/* 
    插件 
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
//节点构造模块
const template = require("@babel/template").default;

console.time("处理完成，耗时");
const { isNodeLiteral, isNodePure, color } = require("../../ast_plugins_star/0_utils");

//将源代码解析为AST
let encodeFile = process.argv.length > 2 ? process.argv[2] : path.join(__dirname, "input.js");
let decodeFile = process.argv.length > 3 ? process.argv[3] : path.join(__dirname, "output.js");
let decodeFileName = decodeFile.split("\\").at(-1);
let step = decodeFileName.match(/^\d+/)?.at(0);


const code = fs.readFileSync(encodeFile, "utf-8");
let ast = parse(code);


// 【*】1_数组元素还原
const replaceArrayElements = { //数组还原
    VariableDeclarator(path) {
        let { node, scope } = path;
        let { id, init } = node;
        //必须是数组
        if (!types.isArrayExpression(init) || init.elements.length == 0) return;

        const binding = scope.getBinding(id.name);
        if (!binding) { return; }

        let { constant, referencePaths, constantViolations } = binding; //变量的定义一定会有binding.
        if (constantViolations.length > 1) { return; }

        let cicleChange = constantViolations.length === 1 && constantViolations[0] == path
            && parentPath.parentPath.isBlockStatement()
            && (parentPath.parentPath.parentPath.isForStatement() || parentPath.parentPath.parentPath.isWhileStatement());
        //如果是在循环体中重复定义，且原始并未初始化则可以还原
        let valid = constant || (cicleChange && binding.path.node.init == null);

        if (valid) {
            //还原引用的地方
            for (let referPath of referencePaths) {
                let { node, parent, parentPath } = referPath;
                //父节点必须是成员表达式，且下标为Number
                if (!types.isMemberExpression(parent, { "object": node }) || !types.isNumericLiteral(parent.property)) {
                    //放宽点条件吧：如果是在赋值语句的右节点，则视为有效：yrx_$p = yrx_$n;
                    if (!types.isAssignmentExpression(parent, { "right": node })) {
                        return;
                    }
                };
                //如果是lvar则不行， 如a[5] = 100;
                if (parentPath.parentPath.isAssignmentExpression({ "left": parent })) {
                    return;
                }
                //排除类似：a[5]++
                if (parentPath.parentPath.isUpdateExpression({ "argument": parent })) {
                    return;
                }
            }

            // 最后统一修改
            var referCount = referencePaths.length;
            for (let referPath of referencePaths) {
                let { parent, parentPath } = referPath;
                if (!parent.property) {
                    continue;
                }
                let index = parent.property.value;
                let replaceNode = init.elements[index];
                console.log(parentPath.parentPath.toString(), "====>", replaceNode.value || replaceNode.name || "其他类型");
                parentPath.replaceWith(replaceNode);
                referCount--;
            }
            if(referCount == 0){
                path.remove();
            }
        }
    },

    AssignmentExpression(path) {
        let { scope, node } = path;
        let { left, operator, right } = node;
        if (!types.isIdentifier(left) || operator != "=") {
            return;
        }

        //必须是数组
        if (!types.isArrayExpression(right) || right.elements.length == 0) return;

        const binding = scope.getBinding(left.name);
        if (!binding) { return; }

        let { constant, referencePaths, constantViolations } = binding; //变量的定义一定会有binding.
        if (constantViolations.length > 1) { return; }
        if (constantViolations.length === 1 && constantViolations[0] !== path) { return; }

        //还原引用的地方
        for (let referPath of binding.referencePaths) {
            let { node, parent, parentPath } = referPath;
            //父节点必须是成员表达式，且下标为Number
            if (!types.isMemberExpression(parent, { "object": node }) || !types.isNumericLiteral(parent.property)) { return; };
            //如果是lvar则不行， 如a[5] = 100;
            if (parentPath.parentPath.isAssignmentExpression({ "left": parent })) { return; }
            //排除类似：a[5]++
            if (parentPath.parentPath.isUpdateExpression({ "argument": parent })) { return; }
        }

        for (let referPath of binding.referencePaths) {
            let { parent, parentPath } = referPath;
            let index = parent.property.value;
            let replaceNode = right.elements[index];
            console.log(parentPath.parentPath.toString(), "====>", replaceNode.value || replaceNode.name || "其他类型");
            parentPath.replaceWith(replaceNode);
        }

        path.remove();
    },


}
step == 1 && traverse(ast, replaceArrayElements);


// 【*】2_变量引用还原
const pluginVarReferenceRestore = {
    // 插件1：https://wx.zsxq.com/dweb2/index/topic_detail/584418484544454
    VariableDeclarator(path) {
        let { scope, parentPath } = path;
        // console.log(parentPath.toString());

        let { id, init } = path.node;
        //var a=x; 左边a必须为标识符，右边必须是纯节点
        if (!types.isIdentifier(id) || !isNodeLiteral(init, scope)) {
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
            if (!types.isIdentifier(left) || operator != "=" || !isNodeLiteral(right, scope)) {
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
                
                //只处理在完整句子中的情况，排除一些情况：($ = 9) * (f = 10)
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
step == 2 && traverse(ast, pluginVarReferenceRestore);


// 【*】3_常量折叠
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
step == 3 && traverse(ast, pluginConstantFold2);


// 【*】 4_函数表达式替换为函数定义
const pluginVarDeclarToFuncDeclar =
{
    VariableDeclaration(path) {
        let { parentPath, node, scope } = path;
        //过滤掉部分特殊情况，例如for循环里的变量定义
        if (!parentPath.isBlock()) {
            return;
        }

        //var a=function(){}, b=function(){}，即declarations.length != 1。这种情况可以先使用变量定义分离隔开。
        let { declarations, kind } = node;
        if (declarations.length != 1) {
            return;
        }

        let { id, init } = declarations[0];
        if (!types.isFunctionExpression(init)) {
            return;
        }

        let { params, body } = init;
        let newNode = types.FunctionDeclaration(id, params, body);
        path.replaceWith(newNode);
        scope.crawl();
    }
}
step == 4 && traverse(ast, pluginVarDeclarToFuncDeclar);



// 【*】 5_函数调用替换为结果
const pluginFuncToVal = {
    // 插件9：https://wx.zsxq.com/dweb2/index/topic_detail/181581428844442
    // 这里不搞var a = function(){}; 或者var a; a = function(){}。 是因为两者都有可能重新赋值
    FunctionDeclaration(path) {
        let { node, parentPath } = path;
        let { id, body } = node;
        let define_line = node.loc.start.line;
        let func_name = node.id.name;

        //最后一句必须为return语句
        let len = body.body.length;
        if (!types.isReturnStatement(body.body[len - 1])) {
            return;
        }

        const binding = parentPath.scope.getBinding(id.name);
        if (!binding || !binding.constant)
            return;

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
step == 5 && traverse(ast, pluginFuncToVal);


// 【*】 6_变量引用还原
step == 6 && traverse(ast, pluginVarReferenceRestore);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast, opts = {
    "compact": false,  // 是否压缩代码
    "comments": false,  // 是否保留注释
    "jsescOption": { "minimal": true },  //Unicode转义
}).code;

// const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
// console.log(ouput);
console.timeEnd("处理完成，耗时")

console.log("encodeFile ===> ", encodeFile);
console.log("decodeFile ===> ", decodeFile);
fs.writeFile(decodeFile, ouput, (err) => { });



/* 
let envCode = fs.readFileSync(path.join(__dirname, "env.js"), { encoding: "utf-8" });
let envAst = parse(envCode);  //压缩环境代码
let envCodeCompact = generate(envAst, opts = { "compact": true, }).code;
eval(envCodeCompact);         //运行环境代码

console.log(envCodeCompact);

let envFuncNames = [];        //提取环境代码中的函数名
traverse(envAst, {
    FunctionDeclaration(path) {
        let { parentPath, node } = path;
        if (!parentPath.isProgram()) {
            return; //非全局函数不处理
        }

        let { id, params, body } = node;
        let length = body.body.length;
        //参数为0；函数体为空；函数没有返回值
        if (params.length == 0 || length == 0 || !types.isReturnStatement(body.body[length - 1])){
            return;
        }
        envFuncNames.push(id.name);
    }
})

console.log(envFuncNames);
 */