/* 
    插件 5.Array类型元素还原
        https://wx.zsxq.com/dweb2/index/topic_detail/218584215241451
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


//将源代码解析为AST
let encodeFile = process.argv.length > 2 ? process.argv[2] : path.join(__dirname, "数组元素还原_code.js");
console.log("encodeFile ===> ", encodeFile);

const code = fs.readFileSync(encodeFile, "utf-8");
let ast = parse(code);

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

traverse(ast, replaceArrayElements);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast, opts = {
    "compact": false,  // 是否压缩代码
    "comments": false,  // 是否保留注释
    "jsescOption": { "minimal": true },  //Unicode转义
}).code;

// const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


// let outputFile = path.join(__dirname, "output.js");
// let decodeFile = process.argv.length > 3 ? process.argv[3] : outputFile;
// console.log("decodeFile ===> ", decodeFile);
// fs.writeFile(decodeFile, ouput, (err) => { });
