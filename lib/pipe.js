var ALProtocol = {
  "http:": require("http"),
  "https:": require("https")
};

var util = require("./util");

exports = module.exports = function (req, hosts, cb) {
  if (util.isLoop(req)) {
    cb({code: "Redirect Loop"});
  }
  else {
    req.url = req.url.replace(/http\:\/\/[^\/]+/,'');
    var protocol = req.connection.encrypted ? "https:" : "http:";
    var host = req.headers.host;
    if (!host) {
      cb({code: "No Host"});
    }
    else {
      var H = host.split(':');
      var reqPort = H[1] || (protocol == "https:" ? 443 : 80);
      var reqHostName = H[0];

      var option = util.buildOption(protocol + "//" + reqHostName + ':' + reqPort + req.url);
      option.method = req.method;
      option.port = reqPort;
      option = util.replaceHost(option, hosts);

      for (var k in req.headers) {
        option.headers[k] = req.headers[k];
      }
      option.headers.connection = "close";

      var nsreq = ALProtocol[option.protocol].request(
        option,
        function (nsres) {
          var buffer = [];
          nsres
            .on("error", function (e) {
              cb(e);
            })
            .on("data", function (chunk) {
              buffer.push(chunk);
            })
            .on("end", function () {
              var buff = buffer.length ? Buffer.concat(buffer) : new Buffer(0);
              cb(null, buff, nsres);
            });
        }
      );
      nsreq.on("error", function (e) {
        cb(e);
      });
      req.pipe(nsreq, {end: true});
    }
  }
};
