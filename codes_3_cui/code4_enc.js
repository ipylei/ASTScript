/* const s = "3|1|2".split("|");
let x = 0;
var  a, b, c;
while (true) {
    switch (s[x++]) {
        case "1":
            a = 1;
            continue;
        case "3":
            b = 3;
            continue;

        case "2":
            c = 0;
            continue;
    }
    break;
}
console.log(a, b, c) 

var s2;
s2 = "3|1|2".split("|");
for (y = 0; !![];) {
    switch (s2[y++]) {
        case "1":
            a = 1;
            continue;
        case "3":
            b = 3;
            continue;

        case "2":
            c = 0;
            continue;
    }
    break;
}
console.log(a, b, c)  
*/
//*=========================================

function func(aS) {

    for (aM = 1; aM != aR;) {
        aS = "2|4|3|1|0"["split"]('|');
        for (aT = 0; !![];) {
            switch (aS[aT++]) {
                case '0':
                    aM <<= 1;
                    continue;
                case '1':
                    aQ |= (0 < aU ? 1 : 0) * aM;
                    continue;
                case '2':
                    aU = aN & aO;
                    continue;
                case '3':
                    0 == aO && (aO = aE, aN = aF(aP++));
                    continue;
                case '4':
                    aO >>= 1;
                    continue;
            }
            break;
        }
    }
}


/*=========================================
const s = "3|1|2".split("|");
let x = 0;
var a, b, c;

count = 0;
while (true) {
    console.log(count);
    if (count >= 100){
        break
    }

    switch (s[x++]) {
        case "1":
            a = 1;
            x = 1
            count++;
            continue;
        case "2":
            b = 3;
            x = 0
            count++;

            continue;

        case "3":
            c = 0;
            x = 1
            count++;
            continue;
    }
    break;
}
console.log(a, b, c)

 */

// function P(Y) {
//     var Z = "0|1|2|3|4".split("|");
//     var a0 = 0;
//     while (!![]) {
//         switch (Z[a0++]) {
//         case "0":
//             var a1,
//             a2 = [];
//             continue;
//         case "1":
//             for (a2[(Y.length >> 2) - 1] = void 0, a1 = 0; a1 < a2.length; a1 += 1)
//                 a2[a1] = 0;
//             continue;
//         case "2":
//             var a3 = 8 * Y.length;
//             continue;
//         case "3":
//             for (a1 = 0; a1 < a3; a1 += 8)
//                 a2[a1 >> 5] |= (255 & Y.charCodeAt(a1 / 8)) << a1 % 32;
//             continue;
//         case "4":
//             return a2;
//         }
//         break;
//     }
// }