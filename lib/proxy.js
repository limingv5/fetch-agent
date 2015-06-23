var ALProtocol = {
  "http:": require("http"),
  "https:": require("https")
};
var util = require("./util");

exports = module.exports = function (req, res, onSuccess, onError) {
  if (util.isLoop(req)) {
    res.end();
    onError({code: "Redirect Loop"});
  }
  else {
    var option = util.buildOption(req);
    if (option) {
      var host = option.headers.host;
      var reqPort = option.port;

      var errorHandler = function (e) {
        console.log(host, reqPort, req.url);
        console.log(e);
        onError(e);
      };

      req.on("error", errorHandler);
      res.on("error", errorHandler);

      option.agent = new ALProtocol[option.protocol].Agent({keepAlive: true});
      var nsreq = ALProtocol[option.protocol].request(
        option,
        function (nsres) {
          res.writeHead(nsres.statusCode, nsres.headers || {});
          nsres.pipe(res, {end: true});

          var buffer = [];
          nsres
            .on("error", errorHandler)
            .on("data", function (chunk) {
              buffer.push(chunk);
            })
            .on("end", function () {
              console.log("=>", nsres.statusCode, host, reqPort, req.url);

              var buff = buffer.length ? Buffer.concat(buffer) : new Buffer(0);
              onSuccess(null, buff, nsres);
            });
        }
      );

      nsreq.setTimeout(30000, function () {
        nsreq.abort();
        onError({code: "Timeout"});
      });
      nsreq.on("error", errorHandler);

      req.pipe(nsreq, {end: true});
    }
    else {
      onError({code: "Host Not Found"});
    }
  }
};
