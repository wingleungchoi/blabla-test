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

  async insert(data) {
    await this.collection.insertOne(data);
    return data; // original input data
  }

  async find(query = {}, opts = {}) {
    let operation = this.collection.find(query, _.getOr({}, 'fields', opts));
    if (opts.sort) operation = operation.sort(opts.sort);
    if (opts.limit) operation = operation.limit(opts.limit);
    if (opts.offset) operation = operation.skip(opts.offset);
    const result = await operation.toArray();
    return result;
  }

  async findOne(query, opts = {}) {
    const result = await this.collection.findOne(query, opts);
    return result;
  }

  async findById(id, opts = {}) {
    const result = await this.findOne({ _id: id }, opts);
    return result;
  }

  async updateById(id, data) {
    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: _.omit('_id', data) },
      { returnOriginal: false }
    );
    return result.value;
  }
}

module.exports = AbstractService;
