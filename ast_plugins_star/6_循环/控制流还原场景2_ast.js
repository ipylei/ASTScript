/*

控制流专题:
专题的switch特征：
    1.每一个case语句最后一段代码，是break语句
    2.它没有default语句
    3.每一个case语句倒数第二段代码，要么是指向下一个case的语句test，要么是条件表达式，要么是return语句


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

let jsfile = path.join(__dirname, "控制流还原场景2_code.js");
const code = fs.readFileSync(jsfile, "utf-8");

let ast = parse(code);

// 参数path: SwitchStatement; number: case->test->value
function getPrevItemCounts(path, number) {//找到指向当前case的上一个case的个数，即当前case的引用次数
    let counts = 0;

    let { cases } = path.node;
    //遍历所有的cases节点
    // for (let i = 0; i < cases.length; i++) {
    // let item = cases[i];

    for (let item of cases) {
        let { test, consequent } = item;
        let len = consequent.length; //case中的语句块
        if (!types.isExpressionStatement(consequent[len - 2])) { //倒数第2句必须为赋值语句
            continue;
        }
        let { right } = consequent[len - 2].expression; //取出赋值语句的右节点
        // 直接是字面量的情况：cW = 5;
        if (types.isNumericLiteral(right, { value: number })) {
            counts++;
            continue;
        }
        //条件表达式的情况：如：cW = d1 < cU ? 8 : 4;
        if (types.isConditionalExpression(right)) {
            if (right.consequent.value == number) {
                counts++;
            }
            if (right.alternate.value == number) {
                counts++;
            }
        }
    }

    return counts;
}



//通过value值来获取item，path-->SwitchStatement; number--=>right.value; is_remove -->是否进行删除
//返回：SwitchCase语句块：如 case 2: {cW = d0 < cU ? 7 : 3; break;}
function getItemFromTestValue(path, number, is_remove) {
    let { cases } = path.node;
    for (let i = 0; i < cases.length; i++) {
        let item = cases[i];
        if (item.test.value == number) {
            if (is_remove) {
                //要删除的项的位置:第i项
                //要删除项的数量：1项
                return cases.splice(i, 1)[0];
            }
            else {
                return item;
            }
        }
    }
}



const dealWithSwitch = {
    //遍历switch语句
    SwitchStatement(path) {
        let { scope, node, parentPath } = path;
        let ancestorPath = parentPath.parentPath;
        if (!parentPath.isBlockStatement() || (!ancestorPath.isWhileStatement() && !ancestorPath.isForStatement())) {
            return;
        }

        let { discriminant } = node; //获取switch中的参数，如：switch(cW){...}
        //switch(arg)是字面量形式
        if (!types.isIdentifier(discriminant)) { return; }

        let binding = scope.getBinding(discriminant.name);
        //获取到switch参数cW
        if (!binding || !binding.path || !binding.path.isVariableDeclarator()) { return; }
        let { id, init } = binding.path.node;
        //该场景是字面量形式
        if (!types.isNumericLiteral(init)) { return; }

        //取出参数cW的初值
        let initValue = init.value;

        for (let i = 0; i < path.node.cases.length; i++) {//遍历cases
            let item = path.node.cases[i];                //获取每一个 SwitchCase 节点
            // for (let item of node.cases) {
            let { test, consequent } = item;              //获取consequent和test子节点
            let change_pos = consequent.length - 2;        //获取下一个指向：如case 1:var cZ = [];cW = 5; break; 中的cW=5

            //排除return语句，即：倒数第2句必须是：表达式语句，且是赋值表达式语句
            //示例：case 1: {cW = 5;} 或者 case 2:{cW = d0 < cU ? 7 : 3;}
            if (!types.isExpressionStatement(consequent[change_pos]) || !types.isAssignmentExpression(consequent[change_pos].expression)) {
                continue;
            }

            // 如果当前节点没有被引用的情况，直接可以删除
            let refer_cnt = getPrevItemCounts(path, test.value);
            if (i != 0 && refer_cnt == 0) {
                path.node.cases.splice(i, 1);   //删除这个case节点
                i = -1;
                continue;
            }

            let { right } = consequent[change_pos].expression;          //获取语句块{}里面的下个节点

            //如果是数值：那么找case 5的节点看是否多次引用，只引用一次则可以合并
            //示例：
            //case 1: {var cZ = []; cW = 5; break;}
            //case 5: {var d0 = 0; cW = 6; break;}
            if (types.isNumericLiteral(right)) {
                let value = right.value;                                //获取 value
                let prevItemCounts = getPrevItemCounts(path, value);    //获取指向下一个case的引用个数，视频中是case5的引用个数。
                if (prevItemCounts != 1) { 
                    continue; 
                }

                //示例：合并 case 1:{} <- case 5:{} 获取case为5的语句块(并删除)
                let nextItem = getItemFromTestValue(path, value, true);//单线合并，删除下一个case。
                if(!nextItem){
                    continue;
                }
                consequent.splice(change_pos, 2);                      //删除 case1的后面两个节点
                consequent.push(...nextItem.consequent);               //把case5的内容push到case1里面去
                i = -1; //合并后，下次重新开始遍历所有的cases
                console.log(`case ${test.value} <- case ${value}`);
                continue;
            }

            //如果是条件表达式： cW = d0 < cU ? 7 : 3; 
            //示例:
            // case 2: {cW = d0 < cU ? 7 : 3; break;}
            // case 7: {cZ[(d0 + cV) % cU] = []; cW=2; break;}
            /* ================================================》
                    while (d0 < cU) {            //case 2
                        cZ[(d0 + cV) % cU] = []; //case 7
                        d0++;                    //case 9
                        //...                    //case 2
                    }
                    cW = 3;                
                    // cW = d1 < cU ? 8 : 4;     //case 3
                    
            */
            if (types.isConditionalExpression(right)) {
                let nextTest = right.test;              //d0 < cU
                let nextConsequent = right.consequent;  //数值为7 
                let nextAlternate = right.alternate;    //数值为3

                let nextItem = getItemFromTestValue(path, nextConsequent.value, false);  //取出case 7
                let nextItemBlock = nextItem.consequent;                                 //取出case 7 的 consequent(即语句块)
                let next_change_pos = nextItemBlock.length - 2;                          //case 7 中的cW=2的下标
                
                //必须是赋值语句(如:cW=2;)
                if (!types.isExpressionStatement(nextItemBlock[next_change_pos]) || !types.isAssignmentExpression(nextItemBlock[next_change_pos].expression)) {
                    continue;
                }
                //判断 当前case 2里的test节点值(2) 是否和下一步 case 7中cW = 2值cW=2一致，即形成了一个环
                let nextStepNode = nextItemBlock[next_change_pos].expression.right;
                if (!types.isNumericLiteral(nextStepNode, { "value": test.value })) {
                    continue;
                }
                //获取case为7的语句块(并删除)
                nextItem = getItemFromTestValue(path, nextConsequent.value, true);  //删除 case 7 

                //构造while节点(case 7的最后两句不要)
                let whileNode = types.whileStatement(nextTest, types.blockStatement(nextItemBlock.slice(0, next_change_pos)));
                //case 2的consequent节点的条件表达式 变成是赋值语句，且是不满足条件的赋值语句(cW=3)
                consequent[change_pos].expression.right = nextAlternate;
                //将while节点插入到case 2中(插入到重新赋值cW = 3; 前)
                consequent.splice(change_pos, 0, whileNode);
                i = -1; //合并后，下次重新开始遍历所有的cases
                continue;
                // break;
            }

        }
    }
}

traverse(ast, dealWithSwitch);


console.log("======================================");
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log(ouput);

// fs.writeFileSync("result.js", ouput);