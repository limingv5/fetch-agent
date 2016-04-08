var xBroker = "fetch-agent";
var zlib = require("zlib");

var headers = function (req) {
  var headerStr = ' ' + req.rawHeaders.join(':').trim();
  var headerArr = headerStr.split(':');
  var headers = [headerArr[0].trim()];
  var tmp = null;
  for (var i = 1, len = headerArr.length - 1; i < len; i++) {
    tmp = headerArr[i].match(/(.+)\s{1,}(.+)/);
    if (tmp && tmp[1] && tmp[2]) {
      headers.push(tmp[1].trim(), tmp[2].trim());
    }
  }
  headers.push(headerArr[headerArr.length - 1].trim());

  var _headers = {};
  for (var i = 0, len = headers.length; i < len; i = i + 2) {
    _headers[headers[i].toLowerCase()] = headers[i + 1];
  }

  return _headers;
};

exports.parseURL = function (url) {
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

exports.buildOption = function (req, hosts) {
  if (!req.headers.host) {
    req.headers = headers(req);
  }

  var host = req.headers.host;
  if (host) {
    req.url = req.url.replace(/https?\:\/\/[^\/]+/, '');
    var protocol = req.connection.encrypted ? "https:" : "http:";

    var H = host.split(':');
    var reqPort = H[1] || (protocol == "https:" ? 443 : 80);
    var reqHostName = H[0];

    var option = exports.parseURL(protocol + "//" + reqHostName + ':' + reqPort + req.url);
    option.method = req.method;
    option.port = reqPort;
    if (hosts) {
      option = exports.replaceHost(option, hosts);
    }

    option.headers = req.headers || {};
    return option;
  }
  else {
    return false;
  }
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

exports.unzip = function (buff, headers) {
  var gunzipResBuf = buff;
  if (headers) {
    var encoding = headers['content-encoding'];
    if (headers && encoding) {
      if (/gzip/i.test(encoding)) {
        gunzipResBuf = zlib.gunzipSync(buff);
      }
      else if (/deflate/i.test(encoding)) {
        gunzipResBuf = zlib.inflateRawSync(buff);
      }
    }
  }
  return gunzipResBuf;
}
