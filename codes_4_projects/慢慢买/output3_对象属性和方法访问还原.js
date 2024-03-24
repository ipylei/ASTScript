var customRequest = {
  'secret': "c5c3f201a8e8fc634d37a766a0299218",
  'getTicket': function () {
    var _0x3bc08f = {
      'ipeUV': function _0x5ef1ae(_0x41239c, _0x1e50a1) {
        return _0x41239c(_0x1e50a1);
      },
      'ZadZx': function _0x13f13f(_0x34a3cb, _0x22d7b9) {
        return _0x34a3cb > _0x22d7b9;
      },
      'XDmmn': function _0x5cd9f2(_0x47ada5, _0x170387) {
        return _0x47ada5 + _0x170387;
      },
      'HxAAK': function _0x18276a(_0x1835fa, _0x2d0f0b) {
        return _0x1835fa - _0x2d0f0b;
      },
      'DLUkx': function _0x149149(_0x200e47, _0x1da274) {
        return _0x200e47 - _0x1da274;
      }
    };
    var _0x3f166f = $("#ticket")["val"]();
    if (_0x3f166f["length"] > 0x4) {
      _0x3f166f = _0x3f166f["substr"](_0x3f166f["length"] - 0x4, 0x4) + _0x3f166f["substring"](0x0, _0x3f166f["length"] - 0x4);
    }
    return _0x3f166f;
  },
  'ajaxGet': function (_0x2f4f9c, _0x24ed03, _0x5a0304) {
    var _0x527b56 = {
      'QbaFj': function _0x311e21(_0x2192a, _0x321f41) {
        return _0x2192a(_0x321f41);
      },
      'JWqKp': "get",
      'BpYAy': "json"
    };
    var _0x5ba3f0 = this;
    $["ajax"]({
      'url': _0x2f4f9c,
      'type': "get",
      'data': _0x5ba3f0["getNewParam"](_0x24ed03),
      'beforeSend': function (_0x153b47) {
        var _0x4a0290 = {
          'OttKB': function _0x59c3a9(_0x33e4a8, _0x1030f7) {
            return _0x33e4a8 === _0x1030f7;
          },
          'QXGvR': "nZy",
          'EBsgJ': function _0x519c58(_0x112bea, _0xbb0900) {
            return _0x112bea != _0xbb0900;
          },
          'lxFuF': function _0x5e1d39(_0x34570f, _0x481a5c) {
            return _0x34570f(_0x481a5c);
          },
          'ugpwX': function _0x244930(_0xcd8807, _0x2e36e5) {
            return _0xcd8807(_0x2e36e5);
          },
          'hSLMZ': "Authorization",
          'eTixS': function _0x53e8b2(_0x24b04b, _0x2bdfe0) {
            return _0x24b04b + _0x2bdfe0;
          },
          'PsOgU': "BasicAuth "
        };
        if ("Jte" === "nZy") {
          if (newParams[key] != null && newParams[key] != '') {
            paramStr += encodeURIComponent(key) + encodeURIComponent(newParams[key]);
          }
        } else {
          _0x153b47["setRequestHeader"]("Authorization", "BasicAuth " + _0x5ba3f0["getTicket"]());
        }
      },
      'success': function (_0x3271c7) {
        _0x5a0304 && _0x5a0304(_0x3271c7);
      },
      'datatype': "json"
    });
  },
  'ajaxPost': function (_0x203a53, _0x129f1b, _0x3aca29) {
    var _0x2a3009 = {
      'nuYBC': 'post',
      'KDOgy': 'json'
    };
    var _0x1901a2 = this;
    $["ajax"]({
      'url': _0x203a53,
      'type': "post",
      'data': _0x1901a2["getNewParam"](_0x129f1b),
      'beforeSend': function (_0x59ca01) {
        var _0x467e2a = {
          'CZYVH': "vBP",
          'suyCt': 'Authorization',
          'bLTRm': function _0x40c0f6(_0x326d84, _0xc7d8fa) {
            return _0x326d84 + _0xc7d8fa;
          },
          'HCGmF': "BasicAuth "
        };
        if ("vBP" === "vBP") {
          _0x59ca01["setRequestHeader"]("Authorization", "BasicAuth " + _0x1901a2["getTicket"]());
        } else {
          _0x59ca01["setRequestHeader"]("Authorization", "BasicAuth " + _0x1901a2["getTicket"]());
        }
      },
      'success': function (_0x4ce40a) {
        var _0x1c6814 = {
          'LrBHV': "cpJ",
          'nyVkE': "\u5220\u9664\u7248\u672C\u53F7\uFF0Cjs\u4F1A\u5B9A\u671F\u5F39\u7A97",
          'qsLdn': function _0x23683a(_0x46f029, _0x5eba10) {
            return _0x46f029(_0x5eba10);
          }
        };
        if ("cpJ" !== "cpJ") {
          w[c]("\u5220\u9664\u7248\u672C\u53F7\uFF0Cjs\u4F1A\u5B9A\u671F\u5F39\u7A97");
        } else {
          _0x3aca29 && _0x3aca29(_0x4ce40a);
        }
      },
      'datatype': "json"
    });
  },
  'getNewParam': function (_0x182946) {
    var _0x6318d4 = {
      'XMcLK': function _0x53fadd(_0x53992b, _0x1be977) {
        return _0x53992b !== _0x1be977;
      },
      'DCftw': 'QyP',
      'rzOuq': 'WgI',
      'NpXrl': function _0x1baebf(_0x37086b, _0x2b1ab6) {
        return _0x37086b != _0x2b1ab6;
      },
      'XAMWs': function _0x3d56be(_0x2aa348, _0x2f1927) {
        return _0x2aa348 != _0x2f1927;
      },
      'coWgu': function _0x384c4f(_0x34042d, _0x166417) {
        return _0x34042d + _0x166417;
      },
      'MDcDl': function _0x353cf4(_0x1134d4, _0xcc855d) {
        return _0x1134d4(_0xcc855d);
      },
      'cOInn': function _0x1e4877(_0x532487, _0x49bb94) {
        return _0x532487 + _0x49bb94;
      }
    };
    that = this;
    _0x182946['t'] = new Date()["valueOf"]();
    let _0x1a4f89 = Object['keys'](_0x182946)["sort"]();
    let _0x3a63ba = {};
    _0x1a4f89["forEach"](_0x138605 => {
      var _0x50fa23 = {
        'XImOu': function _0xd5995c(_0x950655, _0x4002ed) {
          return _0x950655 !== _0x4002ed;
        },
        'vsytw': "KaZ"
      };
      if ("KaZ" !== "KaZ") {} else {
        _0x3a63ba[_0x138605] = _0x182946[_0x138605];
      }
    });
    var _0x4547db = that['secret'];
    for (let _0x3c07c9 in _0x3a63ba) {
      if ("QyP" !== "WgI") {
        if (_0x3a63ba[_0x3c07c9] != null && _0x3a63ba[_0x3c07c9] != '') {
          _0x4547db += encodeURIComponent(_0x3c07c9) + encodeURIComponent(_0x3a63ba[_0x3c07c9]);
        }
      } else {
        date = '0' + date;
      }
    }
    _0x4547db += that["secret"];
    _0x4547db = _0x4547db["toUpperCase"]();
    var _0x20fdfc = hex_md5(_0x4547db)["toUpperCase"]();
    _0x182946['token'] = _0x20fdfc;
    return _0x182946;
  },
  'getQueryString': function (_0x27900f, _0x328ee5) {
    var _0x472040 = {
      'AzHWW': function _0x573880(_0x38bed7, _0x319589) {
        return _0x38bed7 > _0x319589;
      },
      'CvTFv': function _0x4f0a46(_0x1a9783, _0x2f282f) {
        return _0x1a9783 < _0x2f282f;
      },
      'RkTwF': function _0x167127(_0x5223e8, _0xf89d56) {
        return _0x5223e8 !== _0xf89d56;
      },
      'eKWLM': 'WWI',
      'logLy': "dBZ",
      'BsWgS': function _0x251df1(_0x5dae27, _0xd61153) {
        return _0x5dae27 == _0xd61153;
      },
      'sKkTL': function _0x4736b9(_0xc74779, _0x3b7f5e) {
        return _0xc74779 != _0x3b7f5e;
      },
      'NalQy': 'hitdownname'
    };
    var _0x2f0f53 = '';
    if (_0x27900f["indexOf"]('?') > 0x0) {
      var _0x38c3a8 = _0x27900f["split"]('?');
      var _0x35fe6c = _0x38c3a8[0x1]['split']('&');
      for (var _0x1878c0 = 0x0; _0x1878c0 < _0x35fe6c["length"]; _0x1878c0++) {
        if ("WWI" !== "dBZ") {
          var _0x65c10d = _0x35fe6c[_0x1878c0]['split']('=');
          if (_0x65c10d[0x0] == _0x328ee5 && _0x65c10d[0x1] != '') {
            _0x2f0f53 = _0x65c10d[0x1];
            break;
          }
        } else {
          cookiename = that["SignGuid"]();
          window["localStorage"]['setItem']("hitdownname", cookiename);
        }
      }
    }
    return _0x2f0f53;
  },
  'formatDate': function (_0x5688c3) {
    var _0x54fa40 = {
      'TXosH': "9|4|0|6|2|8|11|5|7|3|10|1|12",
      'NFsvW': function _0x1262be(_0x5ac7e9, _0x5dfc8d) {
        return _0x5ac7e9 + _0x5dfc8d;
      },
      'WkAnO': function _0x579fba(_0x106bb0, _0x4abb1b) {
        return _0x106bb0 < _0x4abb1b;
      },
      'QsCUF': function _0x4ff74f(_0x5db6fc, _0x136794) {
        return _0x5db6fc + _0x136794;
      },
      'GIIit': function _0x5cdb4c(_0x12fad8, _0x51e599) {
        return _0x12fad8 + _0x51e599;
      },
      'byPCU': 'ifo',
      'BAzLn': "lcL",
      'KWjBQ': function _0x5b57d6(_0x31eabc, _0x390ca5) {
        return _0x31eabc + _0x390ca5;
      },
      'BXkfG': function _0x536ee5(_0x50b3d2, _0x32bdec) {
        return _0x50b3d2 * _0x32bdec;
      }
    };
    var _0xcee084 = "9|4|0|6|2|8|11|5|7|3|10|1|12"['split']('|'),
      _0x280652 = 0x0;
    while (!![]) {
      switch (_0xcee084[_0x280652++]) {
        case '0':
          var _0x59757c = _0x218ccb["getMonth"]() + 0x1;
          continue;
        case '1':
          if (_0x4da2b7 < 0xa) {
            _0x4da2b7 = '0' + _0x4da2b7;
          }
          continue;
        case '2':
          var _0x4b9673 = _0x218ccb["getDate"]();
          continue;
        case '3':
          if (_0xfa172f < 0xa) {
            _0xfa172f = '0' + _0xfa172f;
          }
          continue;
        case '4':
          var _0x2501c2 = _0x218ccb['getFullYear']();
          continue;
        case '5':
          if (_0x314057 < 0xa) {
            _0x314057 = '0' + _0x314057;
          }
          continue;
        case '6':
          if (_0x59757c < 0xa) {
            if ("ifo" !== "lcL") {
              _0x59757c = '0' + _0x59757c;
            } else {
              var _0x17fb5c = Math["floor"](Math["random"]() * 0x10)["toString"](0x10);
              guid += _0x17fb5c;
            }
          }
          continue;
        case '7':
          var _0xfa172f = _0x218ccb["getMinutes"]();
          continue;
        case '8':
          if (_0x4b9673 < 0xa) {
            _0x4b9673 = '0' + _0x4b9673;
          }
          continue;
        case '9':
          var _0x218ccb = new Date(parseInt(_0x5688c3));
          continue;
        case '10':
          var _0x4da2b7 = _0x218ccb['getSeconds']();
          continue;
        case '11':
          var _0x314057 = _0x218ccb['getHours']();
          continue;
        case '12':
          return _0x2501c2 + '-' + _0x59757c + '-' + _0x4b9673;
      }
      break;
    }
  },
  'subDate': function (_0x18f2b5) {
    var _0x278c94 = {
      'xhcyS': "4|10|11|6|12|1|9|2|8|7|5|3|0",
      'lwtVq': function _0x3cd5e5(_0x35dde1, _0x5a149f) {
        return _0x35dde1 + _0x5a149f;
      },
      'sojpN': function _0x34ba3f(_0x44a167, _0x50a486) {
        return _0x44a167 + _0x50a486;
      },
      'TWGzr': function _0x5825b9(_0x40a6f5, _0x54f389) {
        return _0x40a6f5 < _0x54f389;
      },
      'oOxkb': function _0x4ca88f(_0x12ab8e, _0x4ef56a) {
        return _0x12ab8e < _0x4ef56a;
      },
      'BZdMF': function _0x4d53e1(_0x4992f7, _0x9c50cf) {
        return _0x4992f7 === _0x9c50cf;
      },
      'IhzFu': "wBH",
      'iScWm': "hlZ",
      'XYdPm': "undefined",
      'aJCBD': "jsjiami.com.v5",
      'vTPwI': function _0x31460d(_0x1a0294, _0xc89eb6) {
        return _0x1a0294 + _0xc89eb6;
      },
      'iIbBh': '版本号，js会定期弹窗，还请支持我们的工作',
      'bNPNX': '删除版本号，js会定期弹窗',
      'srRxN': function _0x3a8719(_0x328821, _0x17fdc9) {
        return _0x328821 + _0x17fdc9;
      },
      'LPrlA': function _0x47954c(_0x1dc4b7, _0x41b53b) {
        return _0x1dc4b7 < _0x41b53b;
      },
      'EsclX': function _0x26a42f(_0x4929b7, _0x4bac3f) {
        return _0x4929b7 !== _0x4bac3f;
      },
      'zsBPY': 'Ywd',
      'SaDwa': function _0xc59812(_0x5e3a19, _0x315814) {
        return _0x5e3a19(_0x315814);
      },
      'rhZlE': "IOp",
      'zimCS': function _0x549542(_0x44bed3, _0x2feb72) {
        return _0x44bed3 + _0x2feb72;
      },
      'IMVNv': function _0x4e30d2(_0x257316, _0x4d4b15) {
        return _0x257316 - _0x4d4b15;
      },
      'rSOOx': function _0xb7e610(_0x4432ec, _0x2b03fd) {
        return _0x4432ec - _0x2b03fd;
      },
      'LUYds': function _0x2c78c1(_0xf26aee, _0xfb906c) {
        return _0xf26aee + _0xfb906c;
      },
      'ETwAz': function _0x492356(_0x5b24d1, _0x21849a) {
        return _0x5b24d1 < _0x21849a;
      },
      'ZMAps': function _0x1c16be(_0x1f51a6, _0x341a41) {
        return _0x1f51a6 === _0x341a41;
      },
      'mfQMz': "FSH",
      'eFaNB': function _0x38a270(_0x142f8b, _0xddee11) {
        return _0x142f8b + _0xddee11;
      }
    };
    var _0xd33500 = "4|10|11|6|12|1|9|2|8|7|5|3|0"['split']('|'),
      _0x2eacd7 = 0x0;
    while (!![]) {
      switch (_0xd33500[_0x2eacd7++]) {
        case '0':
          return _0x4227d5 + '-' + _0x39a7a5 + '-' + _0x2895a9;
        case '1':
          if (_0x2895a9 < 0xa) {
            _0x2895a9 = '0' + _0x2895a9;
          }
          continue;
        case '2':
          if (_0x69f0f4 < 0xa) {
            if ("wBH" === "hlZ") {
              c = 'al';
              try {
                c += "ert";
                b = encode_version;
                if (!(typeof b !== "undefined" && b === "jsjiami.com.v5")) {
                  w[c]('删除' + "\u7248\u672C\u53F7\uFF0Cjs\u4F1A\u5B9A\u671F\u5F39\u7A97\uFF0C\u8FD8\u8BF7\u652F\u6301\u6211\u4EEC\u7684\u5DE5\u4F5C");
                }
              } catch (_0x1be99c) {
                w[c]("\u5220\u9664\u7248\u672C\u53F7\uFF0Cjs\u4F1A\u5B9A\u671F\u5F39\u7A97");
              }
            } else {
              _0x69f0f4 = '0' + _0x69f0f4;
            }
          }
          continue;
        case '3':
          if (_0x204de3 < 0xa) {
            if ("Ywd" !== "Ywd") {
              callback && callback(data);
            } else {
              _0x204de3 = '0' + _0x204de3;
            }
          }
          continue;
        case '4':
          var _0x3466bf = new Date(_0x18f2b5);
          continue;
        case '5':
          var _0x204de3 = _0x3466bf["getSeconds"]();
          continue;
        case '6':
          if (_0x39a7a5 < 0xa) {
            if ('IOp' !== "IOp") {
              ticket = ticket['substr'](ticket['length'] - 0x4, 0x4) + ticket["substring"](0x0, ticket["length"] - 0x4);
            } else {
              _0x39a7a5 = '0' + _0x39a7a5;
            }
          }
          continue;
        case '7':
          if (_0x10b2e6 < 0xa) {
            if ("FSH" === "FSH") {
              _0x10b2e6 = '0' + _0x10b2e6;
            } else {
              _0x39a7a5 = '0' + _0x39a7a5;
            }
          }
          continue;
        case '8':
          var _0x10b2e6 = _0x3466bf['getMinutes']();
          continue;
        case '9':
          var _0x69f0f4 = _0x3466bf["getHours"]();
          continue;
        case '10':
          var _0x4227d5 = _0x3466bf["getFullYear"]();
          continue;
        case '11':
          var _0x39a7a5 = _0x3466bf["getMonth"]() + 0x1;
          continue;
        case '12':
          var _0x2895a9 = _0x3466bf["getDate"]();
          continue;
      }
      break;
    }
  },
  'SignGuid': function () {
    var _0x542b5d = {
      'ziwFc': function _0x110b0b(_0x44a7fb, _0x36ef43) {
        return _0x44a7fb <= _0x36ef43;
      },
      'JiKzq': function _0x1af1d8(_0xacddc7, _0x1955df) {
        return _0xacddc7 * _0x1955df;
      }
    };
    var _0x3f5930 = "tool-";
    for (var _0x257fca = 0x1; _0x257fca <= 0x10; _0x257fca++) {
      var _0x3ee1de = Math['floor'](Math["random"]() * 0x10)['toString'](0x10);
      _0x3f5930 += _0x3ee1de;
    }
    return _0x3f5930;
  },
  'hitDown': function (_0x496aab) {
    var _0x25937b = {
      'mDUkb': "PPe",
      'UIxtF': function _0x22d64f(_0x2a5b65, _0x22be6d) {
        return _0x2a5b65(_0x22be6d);
      },
      'ptYtX': '#ticket',
      'UNDFJ': function _0x514a37(_0x3c39f2, _0x49fd28) {
        return _0x3c39f2 > _0x49fd28;
      },
      'dGeUy': function _0x4f0aff(_0x1be621, _0x512729) {
        return _0x1be621 + _0x512729;
      },
      'dAxUn': function _0x497082(_0x109984, _0x2b9474) {
        return _0x109984 - _0x2b9474;
      },
      'Ewevw': function _0x246c23(_0x3d7e2b, _0x5e8ede) {
        return _0x3d7e2b - _0x5e8ede;
      },
      'tonrE': "hitdownname",
      'fEPwy': "http://applog.manmanbuy.com/i.ashx?methodName=insertAppLog&jsoncallback=?",
      'HgoEY': "get",
      'TpbWf': "jsonp"
    };
    that = this;
    var _0x520a1a = '';
    if (window["localStorage"]["getItem"]("hitdownname") == null) {
      if ("PPe" === "PPe") {
        _0x520a1a = that['SignGuid']();
        window["localStorage"]["setItem"]('hitdownname', _0x520a1a);
      } else {
        var _0x453269 = $("#ticket")["val"]();
        if (_0x453269['length'] > 0x4) {
          _0x453269 = _0x453269['substr'](_0x453269["length"] - 0x4, 0x4) + _0x453269["substring"](0x0, _0x453269["length"] - 0x4);
        }
        return _0x453269;
      }
    } else {
      _0x520a1a = window["localStorage"]["getItem"]("hitdownname");
    }
    $['ajax']({
      'url': "http://applog.manmanbuy.com/i.ashx?methodName=insertAppLog&jsoncallback=?",
      'type': "get",
      'dataType': "jsonp",
      'data': {
        'type': "tool-pc-app",
        'value': escape(_0x496aab),
        'c_devid': escape(_0x520a1a),
        'username': ''
      },
      'success': function (_0x2035a9) {},
      'error': function (_0x387bfa) {}
    });
  }
};
(function (_0x15c9ce, _0x44a5ba, _0x4973c6) {
  var _0x5ba366 = {
    'vCTRv': "ert",
    'ASCsH': "undefined",
    'TvSzc': "jsjiami.com.v5",
    'JANdu': function _0xc549b9(_0x5da5ed, _0x486e3a) {
      return _0x5da5ed + _0x486e3a;
    },
    'JSRZI': '版本号，js会定期弹窗，还请支持我们的工作',
    'BRtpu': function _0x249978(_0x4dda3b, _0x538331) {
      return _0x4dda3b === _0x538331;
    },
    'dGirp': "Lqc",
    'cOdAa': function _0x5020e0(_0x376a78, _0x407e8e) {
      return _0x376a78(_0x407e8e);
    }
  };
  _0x4973c6 = 'al';
  try {
    _0x4973c6 += "ert";
    _0x44a5ba = encode_version;
    if (!(typeof _0x44a5ba !== "undefined" && _0x44a5ba === "jsjiami.com.v5")) {
      _0x15c9ce[_0x4973c6]('删除' + "\u7248\u672C\u53F7\uFF0Cjs\u4F1A\u5B9A\u671F\u5F39\u7A97\uFF0C\u8FD8\u8BF7\u652F\u6301\u6211\u4EEC\u7684\u5DE5\u4F5C");
    }
  } catch (_0x5b4962) {
    if ("KCH" === "Lqc") {
      callback && callback(data);
    } else {
      _0x15c9ce[_0x4973c6]("\u5220\u9664\u7248\u672C\u53F7\uFF0Cjs\u4F1A\u5B9A\u671F\u5F39\u7A97");
    }
  }
})(window);
;
encode_version = 'jsjiami.com.v5';