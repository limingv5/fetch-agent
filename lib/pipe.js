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
    var option = util.buildOption(req, hosts);
    if (option) {
      var host = option.headers.host;
      var reqPort = option.port;

      var nsreq = ALProtocol[option.protocol].request(
        option,
        function (nsres) {
          var buffer = [];
          nsres
            .on("error", function (e) {
              console.log(host, reqPort, req.url);
              console.log(e);

              cb(e, new Buffer(0), nsres);
            })
            .on("data", function (chunk) {
              buffer.push(chunk);
            })
            .on("end", function () {
              console.log("=>", nsres.statusCode, host, reqPort, req.url);

              var buff = buffer.length ? Buffer.concat(buffer) : new Buffer(0);
              cb(null, buff, nsres);
            });
        }
      );

      nsreq.on("error", function (e) {
        console.log(host, reqPort, req.url);
        console.log(e);
        cb(e);
      });
      req.pipe(nsreq, {end: true});
    }
    else {
      cb({code: "Host Not Found"});
    }
  }
};
