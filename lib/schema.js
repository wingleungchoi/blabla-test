const _ = require('lodash/fp');

function setDefault(schema) {
  if (typeof schema.defaultValue === 'function') return schema.defaultValue();
  // special handling for date
  if (schema.type === 'date' && schema.defaultValue === 'now') return new Date();
  return schema.defaultValue;
}

function typeCheck(input, type) {
  switch (type) {
    case 'object':
      return _.isPlainObject(input);
    case 'array':
      return _.isArray(input);
    case 'number':
      return _.isNumber(input) && !_.isNaN(input);
    case 'string':
      return _.isString(input);
    case 'boolean':
      return _.isBoolean(input);
    case 'date':
      return _.isDate(input);
    default:
      throw new Error('not supported');
  }
}

// sanitize the object according to the schema
// opts.setDefault: whether set default (Default: true)
// the output DOES NOT always pass the validation function!
function sanitize(input, schema, opts = { setDefault: true }) {
  switch (schema.type) {
    case 'object': {
      const output = {};
      if (!schema.properties) return input;
      Object.keys(schema.properties).forEach((key) => {
        if (_.isPlainObject(input)) {
          const result = sanitize(input[key], schema.properties[key], opts);
          if (result !== undefined) output[key] = result;
        }
      });
      return _.merge(input, output);
    }
    case 'array': {
      if (opts.setDefault && input === undefined && schema.defaultValue) {
        return setDefault(schema, input);
      }
      if (_.isArray(input) && schema.items) {
        return input.map(item => sanitize(item, schema.items, opts));
      }
      return input;
    }
    case 'string':
    case 'number':
    case 'boolean':
    case 'date': {
      if (opts.setDefault && (input === null || input === undefined) && schema.defaultValue !== undefined) {
        return setDefault(schema, input);
      }
      // TODO: use typecheck function
      if (input !== undefined && schema.cast && !typeCheck(input, schema.type)) {
        return schema.cast(input);
      }
      return input;
    }
    default:
      throw new Error('Not supported type');
  }
}

function validate(input, schema, opts = { path: '' }) {
  let error = [];
  let pathPrefix = '';
  if (opts.path) pathPrefix = `${opts.path}.`;
  switch (schema.type) {
    case 'object': {
      if (input !== undefined && !typeCheck(input, 'object')) {
        return [{
          path: opts.path,
          message: `${opts.path} should be an object.`
        }];
      }
      if (input === undefined && schema.required) {
        return [{
          path: opts.path,
          message: `${opts.path} is a required field.`
        }];
      }
      if (!schema.properties) return error;
      if (input === undefined && !schema.required) return error;
      Object.keys(schema.properties).forEach((key) => {
        error = error.concat(validate(input[key], schema.properties[key], Object.assign({}, opts, { path: `${pathPrefix}${key}` })));
      });
      break;
    }
    case 'array': {
      if (input !== undefined && !typeCheck(input, 'array')) {
        return [{
          path: opts.path,
          message: `${opts.path} should be an array.`
        }];
      }
      if (_.isArray(input) && schema.items) {
        input.forEach((item, i) => {
          error = error.concat(validate(item, schema.items, Object.assign({}, opts, { path: `${pathPrefix}${i}` })));
        });
      }
      break;
    }
    case 'string': {
      if (input !== undefined && input !== null) {
        if (!typeCheck(input, 'string')) {
          return [{
            path: opts.path,
            message: `${opts.path} should be a string.`
          }];
        }
        if (input.length > 0 && schema.regex) {
          if (!new RegExp(schema.regex).test(input)) {
            return [{
              path: opts.path,
              message: `${opts.path} is in incorrect format.`
            }];
          }
        }
      }
      if (schema.required && (input === undefined || input === null || input.length === 0)) {
        return [{
          path: opts.path,
          message: `${opts.path} is a required field.`
        }];
      }
      break;
    }
    case 'number': {
      if (input !== undefined && !typeCheck(input, 'number')) {
        return [{
          path: opts.path,
          message: `${opts.path} should be a number.`
        }];
      }
      if (schema.required && (input === undefined || input === null)) {
        return [{
          path: opts.path,
          message: `${opts.path} is a required field.`
        }];
      }
      break;
    }
    case 'boolean': {
      if (input !== undefined && !typeCheck(input, 'boolean')) {
        return [{
          path: opts.path,
          message: `${opts.path} should be a boolean.`
        }];
      }
      if (schema.required && (input === undefined || input === null)) {
        return [{
          path: opts.path,
          message: `${opts.path} is a required field.`
        }];
      }
      break;
    }
    case 'date': {
      if (input !== undefined && !typeCheck(input, 'date')) {
        return [{
          path: opts.path,
          message: `${opts.path} should be a date.`
        }];
      }
      if (schema.required && (input === undefined || input === null)) {
        return [{
          path: opts.path,
          message: `${opts.path} is a required field.`
        }];
      }
      break;
    }
    default:
      throw new Error(`Not supported type ${opts.path}`);
  }
  return error;
}

module.exports = {
  sanitize,
  validate
};
