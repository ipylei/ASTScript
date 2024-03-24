
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

let jsfile = path.join(__dirname, "code6_enc.js");
const code = fs.readFileSync(jsfile, "utf-8");

let ast = parse(code);

/* const keyToIdentifier = {
    MemberExpression(path) {
        let node = path.node;
        // 将[] --> .
        if (node.computed && node.property.type === "StringLiteral") {
            node.computed = false;
            node.property.type = "Identifier";
            node.property.name = node.property.value;
            delete node.property.extra;
        }

    }
}
const keyToLiteral = {
    MemberExpression(path) {
        let node = path.node;
        // . --> []
        if (!node.computed && node.property.type === "Identifier") {
            node.computed = true;
            node.property = types.valueToNode(node.property.name);
        }
    }
} */

// []  ---> .  属性是标识符，有属性.name
const keyToIdentifier = {
    MemberExpression:
    {
        exit({ node }) {
            const prop = node.property;
            if (node.computed && types.isStringLiteral(prop)) {
                node.property = types.Identifier(prop.value);
                node.computed = false;
            }
        }
    },
}


// . ---> []   属性是字符串字面量，有属性.value
const keyToLiteral = {
    MemberExpression:
    {
        exit({ node }) {
            const prop = node.property;
            if (!node.computed && types.isIdentifier(prop)) {
                node.property = types.StringLiteral(prop.name);
                node.computed = true;
            }
        }
    },
    ObjectProperty:
    {
        exit({ node }) {
            const key = node.key;
            if (!node.computed && types.isIdentifier(key)) {
                node.key = types.StringLiteral(key.name);
                return;
            }
            if (node.computed && types.isStringLiteral(key)) {
                node.computed = false;
            }
        }
    },
}




traverse(ast, keyToIdentifier);
// traverse(ast, keyToLiteral);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log(ouput);

// fs.writeFileSync("result.js", ouput);

