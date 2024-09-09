const parser = require("@babel/parser");
const types = require("@babel/types");
const template = require("@babel/template").default;
const generator = require("@babel/generator").default;

let ast = parser.parse("console.log('hello world');");

/*
构造变量定义节点：var global_0 = 1,global_1 = 2,global_2 = 3; 
 */
let VAR_NODE = template(`var A=1, B=2, C=3`);
let firstVar = types.identifier('global_O');
let secondVar = types.identifier('global_1');
let thirdVar = types.identifier('global_2');
let newNode = VAR_NODE({ A: firstVar, B: secondVar, C: thirdVar });
ast.program.body.push(newNode);


/* 
构造赋值语句节点：_0x6f2ba4 = 666;
*/
let ASSIGN_NODE = template(`var A=B`);
let leftNode = types.identifier("_0x6f2ba4");
let rightNode = types.valueToNode(666);
let newNode2 = ASSIGN_NODE({ A: leftNode, B: rightNode });
ast.program.body.push(newNode2);


/* 
    直接使用源代码生成节点
*/
let newNode3 = template.ast("_ipylei = 777");
ast.program.body.push(newNode3);

let { code } = generator(ast);
console.log(code);
