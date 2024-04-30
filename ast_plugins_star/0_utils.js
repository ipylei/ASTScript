/* 
    插件14：https://wx.zsxq.com/dweb2/index/topic_detail/212224825428111

    before：
        插件：29_ob对象属性合并_ast

*/
const types = require("@babel/types");

const color = {};
color.black = "\x1b[30m";
color.red = "\x1b[31m";
color.green = "\x1b[32m";
color.yellow = "\x1b[33m";
color.blue = "\x1b[34m";
color.magenta = "\x1b[35m";
color.cyan = "\x1b[36m";
color.white = "\x1b[37m";


//判断节点是否为字面量
function isNodeLiteral(node) {
    //情况：this对象也视为一个字面量
    if (types.isThisExpression(node)) {
        console.log(color.red, "风险操作：this视为了字面量", node.loc.start.line, node.name);
        return true;
    }

    //情况：如果参数是一个数组，且所有元素节点都是字面量
    if (Array.isArray(node)) {
        return node.every(ele => isNodeLiteral(ele));
    }

    //情况：参数node是一个XXXLiteral，且有value的情况
    if (types.isLiteral(node)) {
        if (node.value == null) {
            return false;
        }
        return true;
    }

    //情况：一元表达式：如：-3、+3
    if (types.isUnaryExpression(node, { "operator": "-" }) || types.isUnaryExpression(node, { "operator": "+" })) {
        return isNodeLiteral(node.argument);
    }

    //情况：二元表达式 且 左右都是字面量的情况：如a+b，a-b，a==b
    if (types.isBinaryExpression(node)) {
        return isNodeLiteral(node.left) && isNodeLiteral(node.right);
    }

    //情况：数组表达式节点，且所有元素节点都是字面量
    if (types.isArrayExpression(node)) {
        let { elements } = node;
        if (elements.length == 0) {
            return true;
        }
        return elements.every(element => isNodeLiteral(element));
    }

    //情况：如果是一个对象，且对象所有属性对应的值都是字面量，a = {name:"xxx",age:666}
    if (types.isObjectExpression(node)) {
        let { properties } = node;
        //空对象比较危险，应该判断为false
        if (properties.length == 0) {
            return false;
        }
        return properties.every(property => isNodeLiteral(property));
    }

    return false;
}

// 判断节点在其作用域内是否为常量(即未发生更改)
function isNodePure(node, scope) {
    //情况：字面量
    if (isNodeLiteral(node)) {
        return true;
    }

    //情况：标识符
    if (types.isIdentifier(node)) {
        // 注意：在循环里面重新被赋值就不行了!
        // if (scope && scope.isPure(node, true)) {
        //     return true;
        // }

        //处理 var c = String;
        if (typeof this[node.name] != 'undefined' && node.name != "window") {
            console.log(color.red, "风险操作", node.loc.start.line, node.name);
            return true;
        }
    }

    //成员表达式：var d = String.fromCharCode;
    if (types.isMemberExpression(node)) {
        let { object, property, computed } = node;
        //需要先对属性进行过滤：object[property]格式时，property在变化的情况!
        if (computed && !isNodePure(property, scope)) {
            return false;
        }

        //情况：object是静态的情况
        if (isNodePure(object, scope)) {
            return true;
        }

        //情况：var a=(func.property)["apply"]，
        if (types.isMemberExpression(object)) {
            return isNodePure(object, scope);
        }
    }

    return false;
}



// 判断节点在其作用域内是否为常量(即未发生更改)
function isNodePure_backup(node, scope) {
    //情况：字面量
    if (types.isLiteral(node)) {
        return true;
    }

    //一元表达式："-" | "+" | "!" | "~" | "typeof" | "void" | "delete" 
    //var a=-3;
    if (types.isUnaryExpression(node)) {
        return isNodePure(node.argument, scope)
    }

    //二元表达式，逻辑表达式：var a = 1+2;、 var a = b==c;
    if (types.isBinary(node) && scope) {
        return isNodePure(node.left, scope) && isNodePure(node.right, scope);
    }


    //情况：标识符
    if (types.isIdentifier(node)) {
        if (scope && scope.isPure(node, true)) {
            return true;
        }
        //处理 var c = String;
        if (typeof this[node.name] != 'undefined') {
            return true;
        }
        return false;
    }

    //成员表达式：var d = String.fromCharCode;
    if (types.isMemberExpression(node)) {
        let { object, property, computed } = node;
        //情况：object[property]格式时，property必须为字面量
        if (computed && !isNodePure(property, scope)) {
            return false;
        }
        //情况：object是静态的情况
        if (isNodePure(object, scope)) {
            return true;
        }
        //情况：object是标识符的情况:
        if (types.isIdentifier(object)) {
            let name = object.name;
            //注意object为window时，可能会还原出错
            if (typeof this[name] != 'undefined' && name != 'window') {
                return true;
            }
            return false;
        }
        //情况：var a=(func.property)["apply"]
        if (types.isMemberExpression(object)) {
            return isNodePure(object, scope);
        }
        return false;
    }

    return false;
}



module.exports.color = color;
module.exports.isNodeLiteral = isNodeLiteral;
module.exports.isNodePure = isNodePure;
