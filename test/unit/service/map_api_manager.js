// for eslint
/* global describe it */
// loading environment
require('../../../app');
const expect = require('chai').expect;
const _ = require('lodash/fp');
const MapApiManager = require('../../../service/map_api_manager');

function expectOK(response) {
  expect(response.status).to.equal(200);
  expect(response.json.status).to.equal('OK');
  return response;
}

describe('Testing MapApiManager Service', () => {
  describe('Testing getThirdPartyAPIresult method', () => {
    it('#1 Should check required fields and output error', (done) => {
      // let expectedResult = {
      //   destination_addresses:
      //   [
      //     'Laguna City, Central, Hong Kong',
      //     '789 Nathan Rd, Mong Kok, Hong Kong'
      //   ],
      //   origin_addresses: [
      //     '11 Hoi Shing Rd, Tsuen Wan, Hong Kong'
      //   ],
      //   rows: [
      //     {
      //       elements: [
      //         {
      //           distance: {
      //             text: '15.5 km',
      //             value: 15518
      //           },
      //           duration: {
      //             text: '16 mins',
      //             value: 986
      //           },
      //           status: 'OK'
      //         },
      //         {
      //           distance: {
      //             text: '9.7 km',
      //             value: 9667
      //           },
      //           duration: {
      //             text: '14 mins',
      //             value: 833
      //           },
      //           status: 'OK'
      //         }
      //       ]
      //     }
      //   ],
      //   status: 'OK'
      // };
      const actualResult = MapApiManager.getThirdPartyAPIresult(
        [
          ['22.372081', '114.107877'],
          ['22.284419', '114.159510'],
          ['22.326442', '114.167811']
        ]
      );
      actualResult
      .asPromise()
      .then(expectOK)
      .then((response) => {
        expect(_.get('rows.0.elements.0.status', response.json)).to.equal('OK');
      })
      .then(done)
      .catch(done);
    });
    it('#2 Should return error when inputs are invalid', (done) => {
      // let expectedResult = {
      //   destination_addresses: ['2,2', '2,4'],
      //   origin_addresses: ['1,1'],
      //   rows: [
      //     {
      //       elements: [
      //         { status: 'ZERO_RESULTS' },
      //         { status: 'ZERO_RESULTS' }
      //       ]
      //     }
      //   ],
      //   status: 'OK'
      // };
      const actualResult = MapApiManager.getThirdPartyAPIresult(
        [
            [1, 1],
            [2, 2],
            [2, 4]
        ]
      );
      actualResult
      .asPromise()
      .then(expectOK)
      .then((response) => {
        expect(_.get('rows.0.elements.0.status', response.json)).to.equal('ZERO_RESULTS');
      })
      .then(done)
      .catch(done);
    });
  });
});
