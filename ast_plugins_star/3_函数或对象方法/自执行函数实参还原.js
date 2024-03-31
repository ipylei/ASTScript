/* 
    插件：7.自执行函数实参还原与替换：(实参是字面量还原？)
        https://wx.zsxq.com/dweb2/index/topic_detail/418484418415828
*/

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const types = require("@babel/types");
const template = require("@babel/template").default;
const generator = require("@babel/generator").default;

const file = require('fs');


let VAR_NODE = template(`var A = B;`);

const restoreParams = {
    CallExpression(path) {
        let { callee, arguments } = path.node;

        if (!types.isFunctionExpression(callee) || arguments.length == 0) {
            return;
        }

        let { body, params } = callee;

        body = body.body;

        if (arguments.length > params.length) return;

        for (let i = arguments.length - 1; i >= 0; i--)   //实参的个数可能小于形参的个数
        {
            //构造节点：var 形参 = 实参;
            let newNode = VAR_NODE({ "A": params[i], "B": arguments[i] });
            body.unshift(newNode);

        }

        path.node.arguments = [];
        path.node.callee.params = path.node.callee.params.slice(arguments.length);
        // console.log(path.toString());

    },
}

traverse(ast, restoreParams);