var xBroker = "fetch-agent";

exports.buildOption = function (url) {
  var urlLib = require("url");

  if (url.match(/^\/{2}/)) {
    url = "http:" + url;
  }
  var requestOption = urlLib.parse(url) || {};
  requestOption.rejectUnauthorized = false;

  requestOption.headers = {
    "x-broker": xBroker,
    host: requestOption.host,
    connection: "close"
  };

  return requestOption;
};

exports.isLoop = function (req) {
  return req.headers["x-broker"] == xBroker;
};

exports.replaceHost = function (requestOption, hosts) {
  var host = requestOption.host;
  if (host && typeof hosts == "object" && hosts[host]) {
    requestOption.host = hosts[host];
    requestOption.hostname = hosts[host];
  }
  return requestOption;
};