const { initAppTest } = require("./test/AppTest");

process.env.NODE_ENV = "test";
process.env.DEBUG = "-@liexp*";
// process.env.DEBUG = "";

module.exports = async () => {
  await initAppTest();
}
