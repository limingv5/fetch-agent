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
    var option = util.buildOption(req);
    if (option) {
      var host = option.headers.host;
      var reqPort = option.port;

      var nsreq = ALProtocol[option.protocol].request(
        option,
        function (nsres) {
          res.writeHead(nsres.statusCode, nsres.headers || {});

          nsres
            .on("error", function (e) {
              console.log(host, reqPort, req.url);
              console.log(e);

              res.statusCode = 500;
              res.error = e;
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

      nsreq.setTimeout(30000, function () {
        nsreq.abort();

        var e = {code: "Timeout"};
        res.statusCode = 504;
        res.error = e;
        onError(e);
      });

      nsreq.on("error", function (e) {
        console.log(host, reqPort, req.url);
        console.log(e);

        res.statusCode = 404;
        res.error = e;
        onError(e);
      });
      req.pipe(nsreq, {end: true});
    }
    else {
      onError({code: "Host Not Found"});
    }
  }
};
