var assert = require("assert");
var rewire = require("rewire");

describe("Fetch", function () {
  describe("Request", function () {
    var request = rewire("../lib/request");
    var buildRequestOption = request.__get__("buildOption");

    it("//www.taobao.com/a.html", function () {
      var opt = buildRequestOption("//www.taobao.com/a.html");

      assert.equal("string", typeof opt.protocol);
      assert.equal(true, ["http:", "https:"].indexOf(opt.protocol) > -1);
    });

    it("https://www.taobao.com/a.html", function () {
      var opt = buildRequestOption("https://www.taobao.com/a.html");

      assert.equal("string", typeof opt.protocol);
      assert.equal(true, ["http:", "https:"].indexOf(opt.protocol) > -1);
    });

    it("build request option", function() {
      assert.equal("object", typeof request.buildOption("//www.baidu.com"));
    });

    it("fetch", function (done) {
      request("http://www.taobao.com/go/market/ju/mingpin.php", function(e) {
        assert.equal(null, e);
        done();
      });
    });
  });
});