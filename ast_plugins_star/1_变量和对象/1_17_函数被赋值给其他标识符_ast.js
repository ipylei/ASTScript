// https://wx.zsxq.com/dweb2/index/topic_detail/411245288241448
// 参考：E:\Learning相应资料\Learn_Spider相应资料\知识星球\知识星球-蔡老板\函数名还原


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



let jsfile = path.join(__dirname, "1_17_函数被赋值给其他标识符_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);



function func1(p) {
    return p + 3;
}

let funcNames = ["func1"];
const collect_deassign_func = {
    //将函数名重新赋值给其他标识符
    // AssignmentExpression(path){
    "AssignmentExpression|VariableDeclarator"(path) {
        let { node, scope } = path;
        var { left, operator, right, id, init } = node;
        left = id || left;
        right = init || right;

        if (operator && operator != "=") { return; }
        if (!types.isIdentifier(left) || !types.isIdentifier(right)) { return; }
        //fW=c; fY=c; 
        if (!funcNames.includes(right.name)) { return; }

        //再把左节点加进去
        // funcNames.push(left.name);

        // 进行还原
        let binding = scope.getBinding(left.name);
        if (!binding) { return; }
        let { constantViolations, referencePaths } = binding;
        if (constantViolations.length > 1) { return; }

        for (let referPath of referencePaths) {
            let { parentPath, node } = referPath;
            // 如fW=func; var fW=func; 然后这里将fW也加入进去
            if (parentPath.isAssignmentExpression({ "right": node, "operator": "=" }) || parentPath.isVariableDeclarator({ "init": node, })) {
                funcNames.push(left.name);
                continue;
            }

            //必须是方法调用的形式
            if (!parentPath.isCallExpression({ "callee": node })) {
                continue;
            }
            let { arguments } = parentPath.node;

            // if (arguments.length != 1 || !types.isNumberLiteral(arguments[0])) {
            //     continue;
            // }

            //【*】 结果全部用c函数执行
            let value = func1(arguments[0].value);
            console.log(parentPath.toString(), "---->", value);
            parentPath.replaceWith(types.valueToNode(value));
        }
    }
}
traverse(ast, collect_deassign_func);


const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时");

