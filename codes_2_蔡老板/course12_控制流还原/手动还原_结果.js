function test(cU, cV) {
    var cW = 1;
    
    var cZ = []; //case 1
    var d0 = 0;  //case 5
    var d1 = 0;  //case 6
    
    while (d0 < cU) { //case 2 -> case 7 ; case 3
        cZ[(d0 + cV) % cU] = []; //case 7
        d0++;                    //case 9
    }
    
    while (d1 < cU) { //case 3 -> case 8 ; case 4
        var d2 = cU - 1;         //case 8
        while (d2 >= 0) {
            cZ[d1][(d2 + cV * d1) % cU] = cZ[d2]; //case 12
            d2--;                //case 13
        }
        d1++;                    //case 11

    }
    return cZ;        //case 4
}
