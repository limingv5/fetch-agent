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

      var bodyBuff = null;

      option.agent = new ALProtocol[option.protocol].Agent({keepAlive: true});
      var nsreq = ALProtocol[option.protocol].request(
        option,
        function (nsres) {
          var headers = nsres.headers || {};
          res.writeHead(nsres.statusCode, headers);

          nsres.pipe(res, {end: true});

          if (!/video\/|audio\//.test(headers['content-type'])) {
            var buffer = [];
            nsres
              .on("error", errorHandler)
              .on("data", function (chunk) {
                buffer.push(chunk);
              })
              .on("end", function () {
                var buff = buffer.length ? Buffer.concat(buffer) : new Buffer(0);
                nsres.headers['connection'] = null;
                delete nsres.headers['connection'];

                onSuccess(null, util.unzip(buff, nsres.headers), nsres, bodyBuff);
              });
          }
          else {
            onSuccess(null, new Buffer(0), nsres);
          }
        }
      );

      nsreq.setTimeout(30000, function () {
        nsreq.abort();
        onError({code: "Timeout"});
      });
      nsreq.on("error", errorHandler);

      var bodyArr = [];
      req
        .on("data", function (chunk) {
          bodyArr.push(chunk)
        })
        .on("end", function () {
          bodyBuff = Buffer.concat(bodyArr);
        })
        .pipe(nsreq, {end: true});
    }
    else {
      onError({code: "Host Not Found"});
    }
  }
};
