
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

let jsfile = path.join(__dirname, "code3_enc.js");
const code = fs.readFileSync(jsfile, "utf-8");

let ast = parse(code);

traverse(ast, {

    // 无用代码剔除
    IfStatement: function (path) {
        let node = path.node;

        //获取path节点对应的属性，还是节点
        let consequent = node.consequent;
        let alternate = node.alternate;

        //TODO 利用path拿到test属性对应的path
        let testPath = path.get("test"); 
        
        // 返回path的真值
        const evaluateTest = testPath.evaluateTruthy();
        
        //true则将整个path替换成consequent对应的节点，
        //false则将整个path替换成alternate对应的节点
        if (evaluateTest === true) {
            // 判断是否是语句块，是语句块的情况: body为列表且里面装的各个Statement
            if (types.isBlockStatement(consequent)) {
                consequent = consequent.body;
            }
            path.replaceWithMultiple(consequent);
        } else if (evaluateTest === false) {
            if (alternate != null) {
                // 判断是否是语句块, 是语句块的情况: body为列表且里面装的各个Statement
                if (types.isBlockStatement(alternate)) {
                    alternate = alternate.body;
                }
                path.replaceWithMultiple(alternate);
            }
            //没有else等的情况
            else {
                path.remove();
            }
        }

    }
});


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log(ouput);

fs.writeFileSync("result.js", ouput);

