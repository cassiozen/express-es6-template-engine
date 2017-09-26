const utils = require("../utils");
const chai = require("chai");
const spies = require("chai-spies");

chai.use(spies);
const expect = chai.expect;

describe("Utils Module", () => {
  describe("readTemplate caching", () => {
    it("reads file only once", () => {
      const readFileSpy = chai.spy((path, encoding, cb) => cb(null, "foo"));
      const callbackSpy = chai.spy();
      utils.readTemplate("foo", null, callbackSpy, readFileSpy);
      utils.readTemplate("foo", null, callbackSpy, readFileSpy);

      expect(readFileSpy).to.have.been.called.once;
      expect(callbackSpy).to.have.been.called.twice;
    });

    it("skips caching if \"cache\" is false on setting", () => {
      const readFileSpy = chai.spy((path, encoding, cb) => cb(null, "foo"));
      const callbackSpy = chai.spy();
      utils.readTemplate("foo", { cache: false }, callbackSpy, readFileSpy);
      utils.readTemplate("foo", { cache: false }, callbackSpy, readFileSpy);

      expect(readFileSpy).to.have.been.called.twice;
      expect(callbackSpy).to.have.been.called.twice;
    });
  });
});
