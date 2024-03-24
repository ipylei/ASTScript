// 3 === this.Cn ? this.Yz = 256 : 23 === this.Cn ? this.$V ? this.Yz = 480 : this.Yz = 512 : this.$V ? this.Yz = 960 : this.Yz = 1024;
3 === this.Cn ? this.Yz == 256 ? this.x = 6 : this.x = 10 : 23 === this.Cn ? this.$V ? this.Yz = 480 : this.Yz = 512 : this.$V ? this.Yz = 960 : this.Yz = 1024;

// 3 === this.Cn ? (this.Yz = 256, this.yy = 257) : (this.Yz = 480, this.Yy = 481)

/* ===>

if (3 === this.Cn) {
  this.Yz = 256;
} else {
  if (23 === this.Cn) {
    if (this.$V) {
      this.Yz = 480;
    } else {
      this.Yz = 512;
    }
  } else {
    if (this.$V) {
      this.Yz = 960;
    } else {
      this.Yz = 1024;
    }
  }
} */