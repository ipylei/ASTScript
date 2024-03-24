var cW = 1;
var cZ = []; //case 1
var d0 = 0; //case 5
var d1 = 0; //case 6

/*start <==============
cW = d0 < cU ? 7 : 3; //case 2
//转为if
if (d0 < cU) {

    cZ[(d0 + cV) % cU] = []; //case 7
    d0++; //case 9

    cW = d0 < cU ? 7 : 3; //case 2

    if (d0 < cU) {
        //case 7
    } else {
        //case 3
    }

} else {
    //case 3
}
//*/


//转为while
while (d0 < cU) { //case 2
    cZ[(d0 + cV) % cU] = []; //case 7
    d0++; //case 9
}

/*
cW = d1 < cU ? 8 : 4; //case 3
if (d1 < cU) {
    var d2 = cU - 1; //case 8
    while (d2 >= 0) {
        cZ[d1][(d2 + cV * d1) % cU] = cZ[d2]; //case 12
        d2--; //case 13
    }
    d1++; //case 11
    cW = d1 < cU ? 8 : 4; //case 3

} else {
    return cZ; //case 4
}
//*/


while (d1 < cU) {    //case 3
    var d2 = cU - 1; //case 8
    while (d2 >= 0) {
        cZ[d1][(d2 + cV * d1) % cU] = cZ[d2]; //case 12
        d2--; //case 13
    }
    d1++; //case 11

}
return cZ; //case 4
