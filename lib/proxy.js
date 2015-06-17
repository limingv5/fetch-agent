var ALProtocol = {
  "http:": require("http"),
  "https:": require("https")
};
var util = require("./util");

exports = module.exports = function (req, res, onData, onEnd, onError) {
  if (util.isLoop(req)) {
    cb({code: "Redirect Loop"});
  }
  else {
    req.url = req.url.replace(/http\:\/\/[^\/]+/, '');
    var protocol = req.connection.encrypted ? "https:" : "http:";

    if (!req.headers.host) {
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

      req.headers = {};
      for (var i = 0, len = headers.length; i < len; i = i + 2) {
        req.headers[headers[i].toLowerCase()] = headers[i + 1];
      }
    }

    var host = req.headers.host;
    if (host) {
      var H = host.split(':');
      var reqPort = H[1] || (protocol == "https:" ? 443 : 80);
      var reqHostName = H[0];

      var option = util.buildOption(protocol + "//" + reqHostName + ':' + reqPort + req.url);
      option.method = req.method;
      option.port = reqPort;

      for (var k in req.headers) {
        option.headers[k] = req.headers[k];
      }
      option.headers.connection = "close";

      var nsreq = ALProtocol[option.protocol].request(
        option,
        function (nsres) {
          res.writeHead(nsres.statusCode, nsres.headers || {});

          nsres
            .on("error", function (e) {
              console.log(host, reqPort, req.url);
              console.log(e);

              onError(e, nsres);
            })
            .on("data", function (chunk) {
              onData(null, chunk);
            })
            .on("end", function () {
              console.log("=>", nsres.statusCode, host, reqPort, req.url);

              onEnd(null, nsres);
            });
        }
      );

      nsreq.on("error", function (e) {
        console.log(host, reqPort, req.url);
        console.log(e);
        onError(e);
      });
      req.pipe(nsreq, {end: true});
    }
    else {
      onError({code: "Host Not Found"});
    }
  }
};
