a && c;
a + b || c && d;

a + b && c;

/* ===>

if (!(a + b)) {
  if (c) {
    d;
  }
}
if (a + b) {
  c;
}
 */