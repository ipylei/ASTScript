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
console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "code2.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);


const transform_literal = {
    NumericLiteral({ node }) {
        if (node.extra && /^0[obx]/i.test(node.extra.raw)) {
            node.extra = undefined;
        }
    },
    StringLiteral({ node }) {
        if (node.extra && /\\[ux]/gi.test(node.extra.raw)) {
            node.extra = undefined;
        }
    },
}

// traverse(ast, transform_literal);


const constantFold = {
    "BinaryExpression|UnaryExpression"(path) {
        if (path.isUnaryExpression({ operator: "-" }) || path.isUnaryExpression({ operator: "void" })) {
            return;
        }
        const { confident, value } = path.evaluate();
        if (!confident)
            return;
        if (typeof value == 'number' && (!Number.isFinite(value))) {
            return;
        }
        path.replaceWith(types.valueToNode(value));
    },
}

// traverse(ast, constantFold);


const member_property_literals = {
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
            }
        }
    },
}
// traverse(ast, member_property_literals);


function isBaseLiteral(node) {
    if (types.isLiteral(node)) {
        return true;
    }
    if (types.isUnaryExpression(node, { operator: "-" }) || types.isUnaryExpression(node, { operator: "+" })) {
        return isBaseLiteral(node.argument);
    }

    return false;
}
const decodeObject =
{
    VariableDeclarator(path) {
        // console.log("==============", path.parentPath.toString());

        let { node, scope } = path;
        const { id, init } = node;
        if (!types.isObjectExpression(init)) {return};

        let properties = init.properties;
        if (properties.length == 0 || !properties.every(property => isBaseLiteral(property.value)))
            return;

        let binding = scope.getBinding(id.name);

        let { constant, referencePaths } = binding;
        if (!constant) return;

        for (const property of properties) {
            let { key, value } = property;
            let objKey = key.value;
            let objValue = value;

            // for (let referPath of binding.referencePaths) {
            for (let referPath of binding.referencePaths) {
                let { parentPath } = referPath;
                if (!parentPath.isMemberExpression()) {//isMemberExpression
                    console.log("可能会报错!", parentPath.toString());
                    // return;
                    continue;
                }
                // console.log(">>>>", "正常");

                if(types.isStringLiteral(parentPath.node.property, {"value": objKey})){
                    parentPath.replaceWith(objValue);
                    break;  //为了避免卡死，遍历首次出现的，看看效果即可
                }

            }
        }
    },
}
traverse(ast, decodeObject);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
// console.log(ouput);
console.timeEnd("处理完成，耗时")


let outputfile = path.join(__dirname, "output2.js");
fs.writeFileSync(outputfile, ouput);
