var urlLib = require("url");
var ALProtocol = {
  "http:": require("http"),
  "https:": require("https")
};

function buildOption(url) {
  if (url.match(/^\/{2}/)) {
    url = "http:" + url;
  }
  var requestOption = urlLib.parse(url) || {};
  requestOption.rejectUnauthorized = false;

  var host = requestOption.host;
  requestOption.headers = {
    "x-broker": "fetch-agent",
    host: host
  };

  return requestOption;
}

exports = module.exports = function (option, cb) {
  if (typeof option == "string") {
    option = buildOption(option);
  }

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
          cb(null, Buffer.concat(buff));
        });
    })
    .on("error", function (e) {
      cb(e);
    })
    .end();
};

exports.buildOption = buildOption;
