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

  requestOption.headers = {
    "x-broker": "fetch-agent",
    host: requestOption.host
  };

  return requestOption;
}

function replaceHost(requestOption, hosts) {
  var host = requestOption.host;
  if (host && typeof hosts == "object" && hosts[host]) {
    requestOption.host = hosts[host];
    requestOption.hostname = hosts[host];
  }
  return requestOption;
}

exports = module.exports = function (option, hosts, cb) {
  if (typeof option == "string") {
    option = buildOption(option);
  }

  if (typeof hosts == "function") {
    cb = hosts;
    hosts = {};
  }

  option = replaceHost(option, hosts);

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
