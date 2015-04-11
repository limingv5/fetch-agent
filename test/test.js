var assert = require("assert");
var rewire = require("rewire");

describe("Fetch", function () {
  describe("Request", function () {
    var util = rewire("../lib/util");

    /**
     *  buildOption
     */
    it("//www.taobao.com/a.html", function () {
      var opt = util.buildOption("//www.taobao.com/a.html");
      assert.equal("string", typeof opt.protocol);
      assert.equal(true, ["http:", "https:"].indexOf(opt.protocol) > -1);

      opt = util.buildOption("https://www.taobao.com/a.html");
      assert.equal("string", typeof opt.protocol);
      assert.equal(true, ["http:", "https:"].indexOf(opt.protocol) > -1);
    });

    /**
     * replaceHost
     */
    it("replaceHost", function () {
      var opt = util.replaceHost({host:"www.taobao.com"}, {"www.taobao.com":"115.238.23.251"});
      assert.equal(true, opt.host == opt.hostname);
      assert.equal(true, opt.host == "115.238.23.251");

      opt = util.replaceHost({host:"www.taobao.com"});
      assert.equal(true, opt.host == "www.taobao.com");

      opt = util.replaceHost({});
      assert.equal(true, typeof opt.host == "undefined");
    });

    var request = rewire("../lib/request");

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