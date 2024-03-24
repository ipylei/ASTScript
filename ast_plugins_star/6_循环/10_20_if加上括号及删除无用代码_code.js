if (a) b;else c;
console.log("1===========================");

if (a) {b;}else c;
console.log("2===========================");

if (a) b;else {c}
console.log("3===========================");

if (1+1) b;else c;
console.log("4===========================");

if (1-1) b;else c;
console.log("5===========================");

if (a) {} else b;
console.log("6===========================");

if (a) b;else {}
console.log("7===========================");

if (a) {}

/* ===>
if (a) {
  b;
} else {
  c;
}

if (a) {
  b;
} else {
  c;
}

if (a) {
  b;
} else {
  c;
}

b;
c;

if (!a) {
  b;
}

if (a) {
  b;
}
 */