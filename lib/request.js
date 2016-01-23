var ALProtocol = {
  "http:": require("http"),
  "https:": require("https")
};

var util = require("./util");

exports = module.exports = function (option, hosts, cb) {
  if (typeof option == "string") {
    option = util.parseURL(option);
  }

  if (typeof hosts == "function") {
    cb = hosts;
    hosts = {};
  }

  option = util.replaceHost(option, hosts);

  ALProtocol[option.protocol]
    .request(option, function (nsres) {
      var buff = [];
      nsres
        .on("error", function (e) {
          cb(e);
        })
        .on("data", function (chunk) {
          buff.push(chunk);
        })
        .on("end", function () {
          cb(null, util.unzip(Buffer.concat(buff), nsres.headers), nsres);
        });
    })
    .on("error", function (e) {
      cb(e);
    })
    .end();
};
