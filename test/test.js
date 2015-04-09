var fetch = require('../index');
var http = require('http').createServer(function (req1, res1) {
    fetch.fetchUrl(
        "http://140.205.230.1/",
        {
            headers: {host: "ju.taobao.com"},
            charset: "gbk"
        },
        function (err, res, content) {
            if (!err) {
                res1.write(content);
                res1.end();
            }
            else {
                console.log(err)
            }
        }
    )
}).listen(10000);