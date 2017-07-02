class MockKoa {
  constructor() {
    this.params = {};
    this.app = {
      context: {
        db: {}
      }
    };
    this.request = {
      body: {}
    };
  }
}
module.exports = MockKoa;
