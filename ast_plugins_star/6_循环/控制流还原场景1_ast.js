/*
before：
    插件：if加上括号{}  
    插件：循环语句加上括号{}
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

let jsfile = path.join(__dirname, "控制流还原场景1_code.js");
const code = fs.readFileSync(jsfile, "utf-8");

let ast = parse(code);
const pluginContrlFlowRestore = {
    "WhileStatement|ForStatement": function (path) {
        let { node, scope } = path;
        const test = node.test;
        const body = node.body;
        let switchNode = body.body[0];            //取到SwitchStatement
        if (!types.isSwitchStatement(switchNode)) { return; }
        let { discriminant, cases } = switchNode; //获取对应的节点 => s[x++] 和 cases是case组成的列表
        if (!types.isMemberExpression(discriminant)) { return; }

        let { object, property } = discriminant;  //获取swith(xxx)中的xxx，这里为：s[x++]。object=>s, property=>x++
        let arrName = object.name;
        let binding = scope.getBinding(arrName);  //根据绑定，获取到代码s="3|1|2".split("|");
        if (!binding) { return; }
        console.log(">>>>>>>>>>>>", binding.path.toString());


        //下面这一坨其实可以固定写死
        let { init } = binding.path.node;            //取到"3|1|2".split("|")
        let argument;
        if (init) {
            object = init.callee.object.value;      //取到字符串"3|1|2"
            property = init.callee.property.name || init.callee.property.value;   //取到属性"split"
            argument = init.arguments[0].value;     //取到参数"|"    
        }
        //未初始化的情况，直接找上一句
        else {
            let prePath = path.getPrevSibling();
            if (!prePath.isExpressionStatement()) {
                return;
            }
            let right = prePath.node.expression.right;
            object = right.callee.object.value;
            property = right.callee.property.name || right.callee.property.value;
            argument = right.arguments[0].value;
        }
        let arrayFlow = object[property](argument);  //开始计算：结果为[3,1,2]

        //固定写死的情况
        // let arrayFlow = [3, 1, 2]; // 针对特定的，固定写死也可以的!

        let resultBody = [];
        //遍历下标列表(该示例是index未变化的情况)
        arrayFlow.forEach(function (index) {
            //遍历case节点组成的列表，筛选出对应下标的case节点
            let target_list = cases.filter(function (c) { return c.test.value == index; });
            //.filter 方法返回一个列表，所以取下标[0]
            if (target_list.length > 0) {
                let caseBody = target_list[0].consequent;        //caseBody是一个列表
                //若case语句最后对应的是continue语句，则删除
                if (types.isContinueStatement(caseBody[caseBody.length - 1])) {
                    caseBody.pop();
                };
                // resultBody = resultBody.concat(caseBody);
                resultBody.push(...caseBody);
            }
        });

        console.log("控制流:", node.loc.start.line);
        path.replaceWithMultiple(resultBody);                    //替换整个while和switch组成的控制流语句
        // console.log("<<<", binding.path.parentPath.toString());
        binding.path.remove();                                   //删除const s="3|1|2".split("|");
    }
}
traverse(ast, pluginContrlFlowRestore);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log(ouput);

// fs.writeFileSync("result.js", ouput);



/* TODO
    控制流发生变化的情况下：Z[a0++]；
        列表有了(只是index下标在发生变化而已)

        首先，把所有的流程走向复制出来 (通过插桩？)
        然后，将所有case放进一个数组里面
        最后，按序匹配case，然后都丢到一个数组里面去
        最终，替换
*/