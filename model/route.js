const _ = require('lodash/fp');
const uuidV4 = require('uuid/v4');
const Schema = require('../lib/schema');
const AppError = require('../lib/app_error');
const ErrorEnum = require('../enum/error');

const RouteSchema = {
  type: 'object',
  properties: {
    _id: { type: 'object' },
    inputLocations: { type: 'array', required: true },
    token: { type: 'string', required: true, defaultValue: uuidV4 },
    createdAt: { type: 'date', defaultValue: 'now' },
    updatedAt: { type: 'date', defaultValue: 'now' }
  }
};

class Route {
  static build(object, opts = { setDefault: true }) {
    const route = Route.sanitize(_.omit(Route.PROTECTED_FIELDS, object), opts);
    Route.validate(route);
    return route;
  }
  static sanitize(object, opts = { setDefault: false }) {
    return Schema.sanitize(object, RouteSchema, opts);
  }
  static validate(object) {
    const errors = Schema.validate(object, RouteSchema, { path: 'route' });
    if (errors.length !== 0) throw new AppError(Object.assign({}, ErrorEnum.INVALID_PAYLOAD, { errors }));
  }
}

Route.PROTECTED_FIELDS = ['_id', 'createdAt', 'updatedAt'];

module.exports = Route;
