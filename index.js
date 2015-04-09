var Util = require('mace');
var Url = require('url');
var Http = require('http');
var Https = require('https');
var iconv = require("iconv-lite");
var isUtf8 = require("is-utf8");

function HttpFetch() {
    function resolve(_url, options) {
        var urlInfo = Url.parse(_url || '');

        urlInfo.port = urlInfo.port || 80;
        urlInfo.protocol = urlInfo.protocol || 'http:';
        urlInfo.agent = false;
        urlInfo.method = options.method || "get";

        urlInfo.headers = Util.merge(true, {
            'X-Proxy-Server': 'HTTP-Fetch',
            'X-Proxy-Version': '1.0.0',
            'X-Forwarded-Protocol': urlInfo.protocol
        }, options.headers || {});

        return urlInfo;
    }

    function toString(buffer, charset) {
        return isUtf8(buffer) ? buffer.toString() : iconv.decode(buffer, charset || "gbk");
    }

    function toBuffer(str, outputEncoding) {
        return iconv.encode(str, outputEncoding || "utf-8");
    }

    function isFetchRequest(req) {
        var headers = req.headers;
        if ((headers['X-Proxy-Server'] || headers['x-proxy-server']) === 'HTTP-Fetch') {
            return true;
        }
        return false;
    }

    var reqOpts = {};

    return {
        fetchUrl: function (_url, options, fn) {
            if (!fn && Util.isFunction(options)) {
                fn = options;
                options = {};
            }

            reqOpts = resolve(_url, options);

            var nsreq = (reqOpts.protocol === 'http:' ? Http : Https)
                .request(
                    reqOpts,
                    function (nsres) {
                        var buffer = [];
                        nsres.on('data', function (chunk) {
                            buffer.push(chunk);
                        });
                        nsres.on('error', function (e) {
                            fn(e);
                        });
                        nsres.on('end', function () {
                            buffer = Util.joinBuffer(buffer);
                            fn(null, nsres, toString(buffer, options.charset));
                        });
                    }
                );

            nsreq.on('error', function (e) {
                fn(e);
            });
            nsreq.end();
        },
        proxy: function (req, options, fn) {
            if (isFetchRequest(req)) {
                Util.error('Circle request with HTTP-Fetch! Request URL: %s', req.url);
                return;
            }
            if (!fn && Util.isFunction(options)) {
                fn = options;
                options = {};
            }

            reqOpts = resolve(req.url, options);

            var nsreq = (reqOpts.protocol === 'http:' ? Http : Https)
                .request(
                    reqOpts,
                    function (nsres) {
                        var buffer = [];
                        nsres.on('data', function (chunk) {
                            buffer.push(chunk);
                        });
                        nsres.on('error', function (e) {
                            fn(e);
                        });
                        nsres.on('end', function () {
                            buffer = Util.joinBuffer(buffer);
                            fn(null, buffer, nsres);
                        });
                    }
                );
            nsreq.on('error', function (e) {
                fn(e);
            });
            req.pipe(nsreq, {end: true});
        }
    };
}

exports = module.exports = HttpFetch();

