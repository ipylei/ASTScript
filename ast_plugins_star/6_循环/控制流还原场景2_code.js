function test(cU, cV) {
    var cW = 1;

    while (cW !== 0) {
        switch (cW) {
            case 1:
                var cZ = [];
                cW = 5;
                break;

            case 2:
                cW = d0 < cU ? 7 : 3;
                break;

            case 3:
                cW = d1 < cU ? 8 : 4;
                break;

            case 4:
                return cZ;
                break;

            case 5:
                var d0 = 0;
                cW = 6;
                break;

            case 6:
                var d1 = 0;
                cW = 2;
                break;

            case 7:
                cZ[(d0 + cV) % cU] = [];
                cW = 9;
                break;

            case 8:
                var d2 = cU - 1;
                cW = 10;
                break;

            case 9:
                d0++;
                cW = 2;
                break;

            case 10:
                cW = d2 >= 0 ? 12 : 11;
                break;

            case 11:
                d1++;
                cW = 3;
                break;

            case 12:
                cZ[d1][(d2 + cV * d1) % cU] = cZ[d2];
                cW = 13;
                break;

            case 13:
                d2--;
                cW = 10;
                break;

            case 100:
                d2++;
                cW = 2;
                break;
            case 102:
                d2++;
                cW = 2;
                break;
            case 103:
                d2++;
                cW = 2;
                break;
            case 104:
                d2++;
                cW = 2;
                break;
        }

    }
}


function test2(cU, cV) {
    var cW = 1;
    var cZ = []; //case 1
    var d0 = 0; //case 5
    var d1 = 0; //case 6
    while (d0 < cU) { //case 2
        cZ[(d0 + cV) % cU] = []; //case 7
        d0++; //case 9
    }
    while (d1 < cU) {
        var d2 = cU - 1; //case 8
        while (d2 >= 0) {
            cZ[d1][(d2 + cV * d1) % cU] = cZ[d2]; //case 12
            d2--; //case 13
        }
        d1++; //case 11

    }
    return cZ;
}


var ret1 = test();
console.log(ret1);

var ret2 = test2();
console.log(ret2);