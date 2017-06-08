/* global describe it before */ // for eslint

require('../../config'); // loading environment
const MongoClient = require('mongodb').MongoClient;
const MockKoa = require('../mock/koa');
const expect = require('chai').expect;
require('co-mocha'); // support generator test
const RouteService = require('../../../service/route');

const koa = new MockKoa();
const services = {};

describe('Testing RouteService Service', () => {
  before(function* () {
    const db = yield MongoClient.connect('mongodb://127.0.0.1:27017/lala-test');
    koa.app.context.db = db;
    services.route = new RouteService(koa.app);
    koa.app.context.services = services;
  });

  describe('Testing insert', () => {
    it('presist valid data and set token', function* () {
      const route = {
        title: 'test',
        text: 'test',
      };
      let result = yield services.route.create(route);
      expect(result.token.length).to.be.eql(36);
    });
  });
});
