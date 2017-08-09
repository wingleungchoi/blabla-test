/* global describe it */ // for eslint
/* global describe it before */ // for eslint

require('../../config'); // loading environment
const expect = require('chai').expect;
const ROUTE_STATUS = require('../../../enum/route_status');
const MongoClient = require('mongodb').MongoClient;
const MockKoa = require('../mock/koa');
require('co-mocha'); // support generator test
const RouteService = require('../../../service/route');
const RoutesManager = require('../../../model/routes_manager');

const koa = new MockKoa();
const services = {};

describe('Testing RoutesManager Service', () => {
  before(function* () {
    const db = yield MongoClient.connect('mongodb://127.0.0.1:27017/lala-test');
    koa.app.context.db = db;
    services.route = new RouteService(koa.app);
    koa.app.context.services = services;
  });

  describe('Testing createNewRequest', () => {
    it('should store the request and return the token when inputs are valid', async () => {
      const actualResult = await RoutesManager.createNewRequest({
        services,
        inputRoute: [
          ['22.372081', '114.107877'],
          ['22.284419', '114.159510'],
          ['22.326442', '114.167811']
        ]
      });
      expect(actualResult.token).be.a('string');
    });

    it('should NOT store the request and raise an error when inputs are invalid', (done) => {
      RoutesManager.createNewRequest({
        services,
        inputRoute: 'i am no an array'
      }).then(
        () => {},
        (err) => {
          expect(err.errors[0].path).to.equal('route.inputLocations');
          expect(err.errors[0].message).to.equal('route.inputLocations should be an array.');
          done();
        }
      ).catch((err) => {
        console.error('err', err);
      });
    });
  });

  describe('Testing findAndPersist', () => {
    it('should find the route, call the map api manager and presist the result', async () => {
      const route = {
        inputLocations: [
          ['22.372081', '114.107877'],
          ['22.326442', '114.167811'],
          ['22.284419', '114.159510']
        ]
      };
      const insertResult = await services.route.create(route);
      const confirmInsertresults = await services.route.find({ _id: insertResult._id });
      const confirmInsertresult = confirmInsertresults[0];
      expect(confirmInsertresult.inputLocations).to.deep.eql(route.inputLocations);
      const updatedResult = await RoutesManager.findAndPersist({ services, routeId: confirmInsertresult._id });
      expect(updatedResult.status).to.be.eql(ROUTE_STATUS.success.value);
      expect(updatedResult.path).to.be.a('array');
      expect(updatedResult.totalDistance).to.be.a('number');
      expect(updatedResult.totalTime).to.be.a('number');
    });
  });
});
