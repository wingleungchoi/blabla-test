const _ = require('lodash/fp');

class AbstractService {
  /**
   * @constructor
   * @param {Object} app - The koa instance app property
   */
  constructor(app) {
    this.app = app;
    this.db = app.context.db;
  }

  * insert(data) {
    yield this.collection.insertOne(data);
    return data; // original input data
  }

  * find(query = {}, opts = {}) {
    let operation = this.collection.find(query, _.getOr({}, 'fields', opts));
    if (opts.sort) operation = operation.sort(opts.sort);
    if (opts.limit) operation = operation.limit(opts.limit);
    if (opts.offset) operation = operation.skip(opts.offset);
    return yield operation.toArray();
  }
  * findOne(query, opts = {}) {
    return yield this.collection.findOne(query, opts);
  }
  * findById(id, opts = {}) {
    return yield this.findOne({ _id: id }, opts);
  }
  * updateById(id, data) {
    const result = yield this.collection.findOneAndUpdate(
      { _id: id },
      { $set: _.omit('_id', data) },
      { returnOriginal: false }
    );
    return result.value;
  }
}

module.exports = AbstractService;
