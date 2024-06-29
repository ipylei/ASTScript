(function (e) {
  var f = e || 12;
  for (;;) {
    if (f === 24) {
      console.log(n(String(Date.now())));
      f -= 7;
    }
    if (f === 22) {
      var m = function (f, i) {
        var l = e || 0;
        for (;;) {
          {
            return o(A(f, i));
          }
        }
      };
      f -= 6;
    }
    if (f === 20) {
      f += 4;
    }
    if (f === 18) {
      var b = function (f) {
        var i = e || 18;
        for (;;) {
          if (i === 18) {
            var l, s, r, n, a;
            i += 1;
          }
          if (i === 14) {
            return s;
          }
          if (i === 10) {
            i += 5;
          }
          if (i === 8) {
            a++;
            i += 1;
          }
          if (i === 6) {
            r = 0;
            i += 6;
          }
          if (i === 4) {
            i += 10;
          }
          if (i === 2) {
            s = "";
            i += 4;
          }
          if (i === 0) {
            s += h;
            i += 5;
          }
          {
            if (i === 20) {
              i -= 12;
            }
            if (i === 19) {
              l = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
              i -= 17;
            }
            if (i === 17) {
              i -= 7;
            }
            if (i === 15) {
              r += 3;
              i -= 3;
            }
            if (i === 13) {
              s += l.charAt(n >> 6 * (3 - a) & 63);
              i -= 10;
            }
            if (i === 11) {
              n = (f[r >> 2] >> 8 * (r % 4) & 255) << 16 | (f[r + 1 >> 2] >> 8 * ((r + 1) % 4) & 255) << 8 | f[r + 2 >> 2] >> 8 * ((r + 2) % 4) & 255;
              i -= 10;
            }
            if (i === 7) {
              i += 13;
            }
            if (i === 5) {
              i += 2;
            }
            if (i === 3) {
              i += 4;
            }
            if (i === 1) {
              a = 0;
              i += 8;
            }
            if (i < 16) {
              if (i < 8) {
                if (i < 4) {
                  if (i < 2) {
                    if (i < 1) {}
                  } else {
                    if (i < 3) {}
                  }
                } else {
                  if (i < 6) {
                    if (i < 5) {}
                  } else {
                    if (i < 7) {}
                  }
                }
              } else {
                if (i < 12) {
                  if (i < 10) {
                    if (i < 9) {} else {
                      if (a < 4) i += 7;else i += 8;
                    }
                  } else {
                    if (i < 11) {}
                  }
                } else {
                  if (i < 14) {
                    if (i < 13) {
                      if (r < f.length * 4) i -= 1;else i -= 8;
                    }
                  } else {
                    if (i < 15) {}
                  }
                }
              }
            } else {
              if (i < 20) {
                if (i < 18) {
                  if (i < 17) {
                    if (r * 8 + a * 6 > f.length * 32) i -= 16;else i -= 3;
                  }
                } else {
                  if (i < 19) {}
                }
              }
            }
          }
        }
      };
      f += 1;
    }
    if (f === 16) {
      var C = function (f, i) {
        var l = e || 0;
        for (;;) {
          {
            return b(A(f, i));
          }
        }
      };
      f -= 6;
    }
    if (f === 14) {
      var d = function (f, i) {
        var l = e || 2;
        for (;;) {
          if (l === 2) {
            var s, r;
            l -= 2;
          }
          if (l === 0) {
            s = (f & 65535) + (i & 65535);
            l += 3;
          }
          {
            if (l === 3) {
              r = (f >> 16) + (i >> 16) + (s >> 16);
              l -= 2;
            }
            if (l === 1) {
              return r << 16 | s & 65535;
            }
            if (l < 2) {
              if (l < 1) {}
            } else {
              if (l < 3) {}
            }
          }
        }
      };
      f -= 5;
    }
    if (f === 12) {
      var g = function (f) {
        var i = e || 0;
        for (;;) {
          {
            return;
          }
        }
      };
      f -= 8;
    }
    if (f === 10) {
      var c = function (f, i) {
        var l = e || 0;
        for (;;) {
          {
            return S(A(f, i));
          }
        }
      };
      f += 15;
    }
    if (f === 8) {
      var v = function (f, i, l, s, r, n, t) {
        var o = e || 0;
        for (;;) {
          {
            return a(l ^ (i | ~s), f, i, r, n, t);
          }
        }
      };
      f += 5;
    }
    if (f === 6) {
      var t = function (f, i, l, s, r, n, t) {
        var o = e || 0;
        for (;;) {
          {
            return a(i ^ l ^ s, f, i, r, n, t);
          }
        }
      };
      f += 2;
    }
    if (f === 4) {
      var n = function (f) {
        var i = e || 0;
        for (;;) {
          {
            return o(E(s(f), f.length * r));
          }
        }
      };
      f += 11;
    }
    if (f === 2) {
      var s = function (f) {
        var i = e || 9;
        for (;;) {
          if (i === 8) {
            return l;
          }
          if (i === 6) {
            l = Array();
            i += 1;
          }
          if (i === 2) {
            i += 1;
          }
          if (i === 0) {
            l[n >> 5] |= (f.charCodeAt(n / r) & s) << n % 32;
            i += 2;
          }
          {
            if (i === 9) {
              var l, s, n;
              i -= 3;
            }
            if (i === 7) {
              s = (1 << r) - 1;
              i -= 2;
            }
            if (i === 5) {
              n = 0;
              i -= 1;
            }
            if (i === 3) {
              n += r;
              i += 1;
            }
            if (i === 1) {
              i += 7;
            }
            if (i < 8) {
              if (i < 4) {
                if (i < 2) {
                  if (i < 1) {}
                } else {
                  if (i < 3) {}
                }
              } else {
                if (i < 6) {
                  if (i < 5) {
                    if (n < f.length * r) i -= 4;else i -= 3;
                  }
                } else {
                  if (i < 7) {}
                }
              }
            } else {
              if (i < 9) {}
            }
          }
        }
      };
      f += 19;
    }
    if (f === 0) {
      var i = function (f) {
        var i = e || 0;
        for (;;) {
          {
            return S(E(s(f), f.length * r));
          }
        }
      };
      f += 22;
    }
    {
      if (f === 26) {
        var E = function (f, i) {
          var s = e || 28;
          for (;;) {
            if (s === 82) {
              n = l(n, a, o, r, f[u + 3], 22, -1044525330);
              s -= 50;
            }
            if (s === 80) {
              r = d(r, c);
              s -= 62;
            }
            if (s === 78) {
              n = t(n, a, o, r, f[u + 10], 23, -1094730640);
              s -= 10;
            }
            if (s === 76) {
              o = w(o, r, n, a, f[u + 6], 9, -1069501632);
              s -= 42;
            }
            if (s === 74) {
              r = l(r, n, a, o, f[u + 12], 7, 1804603682);
              s -= 64;
            }
            if (s === 72) {
              o = w(o, r, n, a, f[u + 14], 9, -1019803690);
              s -= 2;
            }
            if (s === 70) {
              a = w(a, o, r, n, f[u + 3], 14, -187363961);
              s -= 35;
            }
            if (s === 68) {
              r = t(r, n, a, o, f[u + 13], 4, 681279174);
              s -= 19;
            }
            if (s === 66) {
              r = t(r, n, a, o, f[u + 5], 4, -378558);
              s -= 66;
            }
            if (s === 64) {
              A = o;
              s -= 16;
            }
            if (s === 62) {
              r = w(r, n, a, o, f[u + 5], 5, -701558691);
              s -= 12;
            }
            if (s === 60) {
              s += 3;
            }
            if (s === 58) {
              o = l(o, r, n, a, f[u + 1], 12, -389564586);
              s += 13;
            }
            if (s === 56) {
              a = t(a, o, r, n, f[u + 11], 16, 1839030562);
              s += 19;
            }
            if (s === 54) {
              u += 16;
              s -= 15;
            }
            if (s === 52) {
              o = l(o, r, n, a, f[u + 9], 12, -1958414417);
              s -= 44;
            }
            if (s === 50) {
              o = w(o, r, n, a, f[u + 10], 9, 38016083);
              s -= 20;
            }
            if (s === 48) {
              r = l(r, n, a, o, f[u + 0], 7, -680876936);
              s += 10;
            }
            if (s === 46) {
              a = l(a, o, r, n, f[u + 14], 17, -1502002290);
              s -= 6;
            }
            if (s === 44) {
              a = -1732584194;
              s += 37;
            }
            if (s === 42) {
              a = t(a, o, r, n, f[u + 7], 16, -155497632);
              s += 36;
            }
            if (s === 40) {
              n = l(n, a, o, r, f[u + 15], 22, 1236535329);
              s -= 3;
            }
            if (s === 38) {
              o = w(o, r, n, a, f[u + 2], 9, -51403784);
              s += 15;
            }
            if (s === 36) {
              u = 0;
              s += 3;
            }
            if (s === 34) {
              a = w(a, o, r, n, f[u + 11], 14, 643717713);
              s += 27;
            }
            if (s === 32) {
              r = l(r, n, a, o, f[u + 4], 7, -176418897);
              s += 47;
            }
            if (s === 30) {
              a = w(a, o, r, n, f[u + 15], 14, -660478335);
              s -= 24;
            }
            if (s === 28) {
              var r, n, a, o, u, c, h, g, A;
              s += 23;
            }
            if (s === 26) {
              a = l(a, o, r, n, f[u + 6], 17, -1473231341);
              s -= 21;
            }
            if (s === 24) {
              h = n;
              s += 19;
            }
            if (s === 22) {
              o = d(o, A);
              s += 35;
            }
            if (s === 20) {
              r = v(r, n, a, o, f[u + 4], 6, -145523070);
              s += 13;
            }
            if (s === 18) {
              n = d(n, h);
              s += 41;
            }
            if (s === 16) {
              n = v(n, a, o, r, f[u + 1], 21, -2054922799);
              s -= 13;
            }
            if (s === 14) {
              a = t(a, o, r, n, f[u + 15], 16, 530742520);
              s += 11;
            }
            if (s === 12) {
              n = t(n, a, o, r, f[u + 6], 23, 76029189);
              s -= 5;
            }
            if (s === 10) {
              o = l(o, r, n, a, f[u + 13], 12, -40341101);
              s += 36;
            }
            if (s === 8) {
              a = l(a, o, r, n, f[u + 10], 17, -42063);
              s += 76;
            }
            if (s === 6) {
              n = w(n, a, o, r, f[u + 4], 20, -405537848);
              s += 35;
            }
            if (s === 4) {
              o = t(o, r, n, a, f[u + 12], 11, -421815835);
              s += 10;
            }
            if (s === 2) {
              r = w(r, n, a, o, f[u + 13], 5, -1444681467);
              s += 36;
            }
            if (s === 0) {
              o = t(o, r, n, a, f[u + 8], 11, -2022574463);
              s += 56;
            }
            {
              if (s === 84) {
                n = l(n, a, o, r, f[u + 11], 22, -1990404162);
                s -= 10;
              }
              if (s === 83) {
                n = v(n, a, o, r, f[u + 9], 21, -343485551);
                s -= 3;
              }
              if (s === 81) {
                o = 271733878;
                s -= 45;
              }
              if (s === 79) {
                o = l(o, r, n, a, f[u + 5], 12, 1200080426);
                s -= 53;
              }
              if (s === 77) {
                o = v(o, r, n, a, f[u + 7], 10, 1126891415);
                s -= 12;
              }
              if (s === 75) {
                n = t(n, a, o, r, f[u + 14], 23, -35309556);
                s -= 66;
              }
              if (s === 73) {
                c = r;
                s -= 49;
              }
              if (s === 71) {
                a = l(a, o, r, n, f[u + 2], 17, 606105819);
                s += 11;
              }
              if (s === 69) {
                a = v(a, o, r, n, f[u + 6], 15, -1560198380);
                s -= 42;
              }
              if (s === 67) {
                a = v(a, o, r, n, f[u + 2], 15, 718787259);
                s += 16;
              }
              if (s === 65) {
                a = v(a, o, r, n, f[u + 14], 15, -1416354905);
                s -= 10;
              }
              if (s === 63) {
                return Array(r, n, a, o);
              }
              if (s === 61) {
                n = w(n, a, o, r, f[u + 0], 20, -373897302);
                s += 1;
              }
              if (s === 59) {
                a = d(a, g);
                s -= 37;
              }
              if (s === 57) {
                s -= 3;
              }
              if (s === 55) {
                n = v(n, a, o, r, f[u + 5], 21, -57434055);
                s -= 32;
              }
              if (s === 53) {
                a = w(a, o, r, n, f[u + 7], 14, 1735328473);
                s -= 42;
              }
              if (s === 51) {
                f[i >> 5] |= 128 << i % 32;
                s -= 20;
              }
              if (s === 49) {
                o = t(o, r, n, a, f[u + 0], 11, -358537222);
                s -= 36;
              }
              if (s === 47) {
                r = 1732584193;
                s -= 28;
              }
              if (s === 45) {
                r = v(r, n, a, o, f[u + 0], 6, -198630844);
                s += 32;
              }
              if (s === 43) {
                g = a;
                s += 21;
              }
              if (s === 41) {
                r = w(r, n, a, o, f[u + 9], 5, 568446438);
                s += 31;
              }
              if (s === 37) {
                r = w(r, n, a, o, f[u + 1], 5, -165796510);
                s += 39;
              }
              if (s === 35) {
                n = w(n, a, o, r, f[u + 8], 20, 1163531501);
                s -= 33;
              }
              if (s === 33) {
                o = v(o, r, n, a, f[u + 11], 10, -1120210379);
                s += 34;
              }
              if (s === 31) {
                f[(i + 64 >>> 9 << 4) + 14] = i;
                s += 16;
              }
              if (s === 29) {
                a = v(a, o, r, n, f[u + 10], 15, -1051523);
                s -= 13;
              }
              if (s === 27) {
                n = v(n, a, o, r, f[u + 13], 21, 1309151649);
                s -= 7;
              }
              if (s === 25) {
                n = t(n, a, o, r, f[u + 2], 23, -995338651);
                s += 20;
              }
              if (s === 23) {
                r = v(r, n, a, o, f[u + 12], 6, 1700485571);
                s -= 22;
              }
              if (s === 21) {
                r = l(r, n, a, o, f[u + 8], 7, 1770035416);
                s += 31;
              }
              if (s === 19) {
                n = -271733879;
                s += 25;
              }
              if (s === 17) {
                o = t(o, r, n, a, f[u + 4], 11, 1272893353);
                s += 25;
              }
              if (s === 15) {
                o = v(o, r, n, a, f[u + 15], 10, -30611744);
                s += 54;
              }
              if (s === 13) {
                a = t(a, o, r, n, f[u + 3], 16, -722521979);
                s -= 1;
              }
              if (s === 11) {
                n = w(n, a, o, r, f[u + 12], 20, -1926607734);
                s += 55;
              }
              if (s === 9) {
                r = t(r, n, a, o, f[u + 1], 4, -1530992060);
                s += 8;
              }
              if (s === 7) {
                r = t(r, n, a, o, f[u + 9], 4, -640364487);
                s -= 3;
              }
              if (s === 5) {
                n = l(n, a, o, r, f[u + 7], 22, -45705983);
                s += 16;
              }
              if (s === 3) {
                r = v(r, n, a, o, f[u + 8], 6, 1873313359);
                s += 12;
              }
              if (s === 1) {
                o = v(o, r, n, a, f[u + 3], 10, -1894986606);
                s += 28;
              }
              if (s < 64) {
                if (s < 32) {
                  if (s < 16) {
                    if (s < 8) {
                      if (s < 4) {
                        if (s < 2) {
                          if (s < 1) {}
                        } else {
                          if (s < 3) {}
                        }
                      } else {
                        if (s < 6) {
                          if (s < 5) {}
                        } else {
                          if (s < 7) {}
                        }
                      }
                    } else {
                      if (s < 12) {
                        if (s < 10) {
                          if (s < 9) {}
                        } else {
                          if (s < 11) {}
                        }
                      } else {
                        if (s < 14) {
                          if (s < 13) {}
                        } else {
                          if (s < 15) {}
                        }
                      }
                    }
                  } else {
                    if (s < 24) {
                      if (s < 20) {
                        if (s < 18) {
                          if (s < 17) {}
                        } else {
                          if (s < 19) {}
                        }
                      } else {
                        if (s < 22) {
                          if (s < 21) {}
                        } else {
                          if (s < 23) {}
                        }
                      }
                    } else {
                      if (s < 28) {
                        if (s < 26) {
                          if (s < 25) {}
                        } else {
                          if (s < 27) {}
                        }
                      } else {
                        if (s < 30) {
                          if (s < 29) {}
                        } else {
                          if (s < 31) {}
                        }
                      }
                    }
                  }
                } else {
                  if (s < 48) {
                    if (s < 40) {
                      if (s < 36) {
                        if (s < 34) {
                          if (s < 33) {}
                        } else {
                          if (s < 35) {}
                        }
                      } else {
                        if (s < 38) {
                          if (s < 37) {}
                        } else {
                          if (s < 39) {} else {
                            if (u < f.length) s += 34;else s += 21;
                          }
                        }
                      }
                    } else {
                      if (s < 44) {
                        if (s < 42) {
                          if (s < 41) {}
                        } else {
                          if (s < 43) {}
                        }
                      } else {
                        if (s < 46) {
                          if (s < 45) {}
                        } else {
                          if (s < 47) {}
                        }
                      }
                    }
                  } else {
                    if (s < 56) {
                      if (s < 52) {
                        if (s < 50) {
                          if (s < 49) {}
                        } else {
                          if (s < 51) {}
                        }
                      } else {
                        if (s < 54) {
                          if (s < 53) {}
                        } else {
                          if (s < 55) {}
                        }
                      }
                    } else {
                      if (s < 60) {
                        if (s < 58) {
                          if (s < 57) {}
                        } else {
                          if (s < 59) {}
                        }
                      } else {
                        if (s < 62) {
                          if (s < 61) {}
                        } else {
                          if (s < 63) {}
                        }
                      }
                    }
                  }
                }
              } else {
                if (s < 80) {
                  if (s < 72) {
                    if (s < 68) {
                      if (s < 66) {
                        if (s < 65) {}
                      } else {
                        if (s < 67) {}
                      }
                    } else {
                      if (s < 70) {
                        if (s < 69) {}
                      } else {
                        if (s < 71) {}
                      }
                    }
                  } else {
                    if (s < 76) {
                      if (s < 74) {
                        if (s < 73) {}
                      } else {
                        if (s < 75) {}
                      }
                    } else {
                      if (s < 78) {
                        if (s < 77) {}
                      } else {
                        if (s < 79) {}
                      }
                    }
                  }
                } else {
                  if (s < 84) {
                    if (s < 82) {
                      if (s < 81) {}
                    } else {
                      if (s < 83) {}
                    }
                  }
                }
              }
            }
          }
        };
        f -= 21;
      }
      if (f === 25) {
        var B = function () {
          var f = e || 0;
          for (;;) {
            {
              return n("abc") == "900150983cd24fb0d6963f7d28e17f72";
            }
          }
        };
        f += 1;
      }
      if (f === 23) {
        var w = function (f, i, l, s, r, n, t) {
          var o = e || 0;
          for (;;) {
            {
              return a(i & s | l & ~s, f, i, r, n, t);
            }
          }
        };
        f -= 17;
      }
      if (f === 21) {
        var S = function (f) {
          var i = e || 1;
          for (;;) {
            if (i === 8) {
              l += String.fromCharCode(f[n >> 5] >>> n % 32 & s);
              i -= 8;
            }
            if (i === 6) {
              s = (1 << r) - 1;
              i -= 3;
            }
            if (i === 2) {
              n += r;
              i += 2;
            }
            if (i === 0) {
              i += 2;
            }
            {
              if (i === 9) {
                i -= 2;
              }
              if (i === 7) {
                return l;
              }
              if (i === 5) {
                l = "";
                i += 1;
              }
              if (i === 3) {
                n = 0;
                i += 1;
              }
              if (i === 1) {
                var l, s, n;
                i += 4;
              }
              if (i < 8) {
                if (i < 4) {
                  if (i < 2) {
                    if (i < 1) {}
                  } else {
                    if (i < 3) {}
                  }
                } else {
                  if (i < 6) {
                    if (i < 5) {
                      if (n < f.length * 32) i += 4;else i += 5;
                    }
                  } else {
                    if (i < 7) {}
                  }
                }
              } else {
                if (i < 9) {}
              }
            }
          }
        };
        f -= 14;
      }
      if (f === 19) {
        var D = 0;
        f -= 8;
      }
      if (f === 17) {
        return;
      }
      if (f === 15) {
        var y = function (f) {
          var i = e || 0;
          for (;;) {
            {
              return b(E(s(f), f.length * r));
            }
          }
        };
        f -= 15;
      }
      if (f === 13) {
        var A = function (f, i) {
          var l = e || 7;
          for (;;) {
            if (l === 16) {
              l -= 15;
            }
            if (l === 14) {
              return E(t.concat(v), 512 + 128);
            }
            if (l === 10) {
              a[o] = n[o] ^ 909522486;
              l -= 1;
            }
            if (l === 8) {
              o = 0;
              l += 5;
            }
            if (l === 6) {
              n = s(f);
              l += 6;
            }
            if (l === 4) {
              l += 11;
            }
            if (l === 2) {
              t = Array(16);
              l += 6;
            }
            if (l === 0) {
              l += 15;
            }
            {
              if (l === 17) {
                l -= 12;
              }
              if (l === 15) {
                l -= 12;
              }
              if (l === 11) {
                n = E(n, f.length * r);
                l -= 11;
              }
              if (l === 9) {
                t[o] = n[o] ^ 1549556828;
                l += 8;
              }
              if (l === 7) {
                var n, a, t, o, v;
                l -= 1;
              }
              if (l === 5) {
                o++;
                l += 8;
              }
              if (l === 3) {
                a = Array(16);
                l -= 1;
              }
              if (l === 1) {
                v = E(a.concat(s(i)), 512 + i.length * r);
                l += 13;
              }
              if (l < 16) {
                if (l < 8) {
                  if (l < 4) {
                    if (l < 2) {
                      if (l < 1) {}
                    } else {
                      if (l < 3) {}
                    }
                  } else {
                    if (l < 6) {
                      if (l < 5) {}
                    } else {
                      if (l < 7) {}
                    }
                  }
                } else {
                  if (l < 12) {
                    if (l < 10) {
                      if (l < 9) {}
                    } else {
                      if (l < 11) {}
                    }
                  } else {
                    if (l < 14) {
                      if (l < 13) {
                        if (n.length > 16) l -= 1;else l -= 8;
                      } else {
                        if (o < 16) l -= 3;else l += 3;
                      }
                    } else {
                      if (l < 15) {}
                    }
                  }
                }
              } else {
                if (l < 17) {}
              }
            }
          }
        };
        f += 1;
      }
      if (f === 11) {
        var h = "";
        f -= 8;
      }
      if (f === 9) {
        var u = function (f, i) {
          var l = e || 0;
          for (;;) {
            {
              return f << i | f >>> 32 - i;
            }
          }
        };
        f -= 7;
      }
      if (f === 7) {
        var o = function (f) {
          var i = e || 4;
          for (;;) {
            if (i === 8) {
              r = 0;
              i += 1;
            }
            if (i === 6) {
              r++;
              i += 3;
            }
            if (i === 4) {
              var l, s, r;
              i -= 2;
            }
            if (i === 2) {
              l = D ? "0123456789ABCDEF" : "0123456789abcdef";
              i += 3;
            }
            if (i === 0) {
              i += 3;
            }
            {
              if (i === 7) {
                s += l.charAt(f[r >> 2] >> r % 4 * 8 + 4 & 15) + l.charAt(f[r >> 2] >> r % 4 * 8 & 15);
                i -= 6;
              }
              if (i === 5) {
                s = "";
                i += 3;
              }
              if (i === 3) {
                return s;
              }
              if (i === 1) {
                i += 5;
              }
              if (i < 8) {
                if (i < 4) {
                  if (i < 2) {
                    if (i < 1) {}
                  } else {
                    if (i < 3) {}
                  }
                } else {
                  if (i < 6) {
                    if (i < 5) {}
                  } else {
                    if (i < 7) {}
                  }
                }
              } else {
                if (i < 9) {} else {
                  if (r < f.length * 4) i -= 2;else i -= 9;
                }
              }
            }
          }
        };
        f += 11;
      }
      if (f === 5) {
        var a = function (f, i, l, s, r, n) {
          var a = e || 0;
          for (;;) {
            {
              return d(u(d(d(i, f), d(s, n)), r), l);
            }
          }
        };
        f -= 4;
      }
      if (f === 3) {
        var r = 8;
        f += 17;
      }
      if (f === 1) {
        var l = function (f, i, l, s, r, n, t) {
          var o = e || 0;
          for (;;) {
            {
              return a(i & l | ~i & s, f, i, r, n, t);
            }
          }
        };
        f += 22;
      }
      if (f < 16) {
        if (f < 8) {
          if (f < 4) {
            if (f < 2) {
              if (f < 1) {}
            } else {
              if (f < 3) {}
            }
          } else {
            if (f < 6) {
              if (f < 5) {}
            } else {
              if (f < 7) {}
            }
          }
        } else {
          if (f < 12) {
            if (f < 10) {
              if (f < 9) {}
            } else {
              if (f < 11) {}
            }
          } else {
            if (f < 14) {
              if (f < 13) {}
            } else {
              if (f < 15) {}
            }
          }
        }
      } else {
        if (f < 24) {
          if (f < 20) {
            if (f < 18) {
              if (f < 17) {}
            } else {
              if (f < 19) {}
            }
          } else {
            if (f < 22) {
              if (f < 21) {}
            } else {
              if (f < 23) {}
            }
          }
        } else {
          if (f < 26) {
            if (f < 25) {}
          }
        }
      }
    }
  }
})();