var ALProtocol = {
  "http:": require("http"),
  "https:": require("https")
};

var util = require("./util");

exports = module.exports = function (req, hosts, cb) {
  if (util.isLoop(req)) {
    cb(true);
  }
  else {
    var protocol = req.connection.encrypted ? "https:" : "http:";
    var H = req.headers.host.split(':');
    var reqPort = H[1] || (protocol == "https:" ? 443 : 80);
    var reqHostName = H[0];

    var option = util.buildOption(protocol + "//" + reqHostName + req.url);
    option.method = req.method;
    option.port = reqPort;
    option = util.replaceHost(option, hosts);

    for (var k in req.headers) {
      if (k == "accept-encoding") {
        continue;
      }
      option.headers[k] = req.headers[k];
    }

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
            cb(null, Buffer.concat(buffer), nsres);
          });
      }
    );
    nsreq.on("error", function (e) {
      cb(e);
    });
    req.pipe(nsreq, {end: true});
  }
};