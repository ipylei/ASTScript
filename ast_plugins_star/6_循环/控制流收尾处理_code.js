function demo(cU, cV) {
    var cW = 1;

    while (cW !== 0) {
        switch (cW) {
            case 1:
                var cZ = [];
                var d0 = 0;
                var d1 = 0;

                while (d0 < cU) {
                    cZ[(d0 + cV) % cU] = [];
                    d0++;
                }
                cW = 0;
                break;
        }
    }
}

/*     ===>

还原后:

function demo(cU, cV) {
    var cZ = [];
    var d0 = 0;
    var d1 = 0;

    while (d0 < cU) {
        cZ[(d0 + cV) % cU] = [];
        d0++;
    }
} */