var assert = require("assert");
var rewire = require("rewire");

describe("Fetch", function () {
  describe("Request", function () {
    var request = rewire("../index");

    /**
     *  buildOption
     */
    var buildOption = request.__get__("buildOption");

    it("//www.taobao.com/a.html", function () {
      var opt = buildOption("//www.taobao.com/a.html");
      assert.equal("string", typeof opt.protocol);
      assert.equal(true, ["http:", "https:"].indexOf(opt.protocol) > -1);

      opt = buildOption("https://www.taobao.com/a.html");
      assert.equal("string", typeof opt.protocol);
      assert.equal(true, ["http:", "https:"].indexOf(opt.protocol) > -1);
    });

    /**
     * replaceHost
     */
    var replaceHost = request.__get__("replaceHost");

    it("replaceHost", function () {
      var opt = replaceHost({host:"www.taobao.com"}, {"www.taobao.com":"115.238.23.251"});
      assert.equal(true, opt.host == opt.hostname);
      assert.equal(true, opt.host == "115.238.23.251");

      opt = replaceHost({host:"www.taobao.com"});
      assert.equal(true, opt.host == "www.taobao.com");

      opt = replaceHost({});
      assert.equal(true, typeof opt.host == "undefined");
    });

    /**
     * fetch
     */
    it("fetch", function (done) {
      request("http://www.taobao.com/go/market/ju/mingpin.php", function(e) {
        assert.equal(null, e);
        done();
      });
    });

    it("fetch", function (done) {
      request("http://www.taobao.com/go/market/ju/mingpin.php", {
        "www.taobao.com": "115.238.23.251"
      }, function(e) {
        assert.equal(null, e);
        done();
      });
    });
  });
});