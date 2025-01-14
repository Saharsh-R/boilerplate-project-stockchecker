const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test('Viewing one stock: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices?stock=aapl')
            .end((err, res) => {
                assert.equal(res.body.stockData.stock, 'AAPL')
                assert.isNumber(res.body.stockData.price)
                assert.isNumber(res.body.stockData.likes)
                done()
            })
    })

    test('Viewing one stock and liking it: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices?stock=aapl&like=true')
            .end((err, res) => {
                assert.equal(res.body.stockData.stock, 'AAPL')
                assert.isNumber(res.body.stockData.price)
                assert.isNumber(res.body.stockData.likes)
                done()
            })
    })

    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices?stock=aapl&like=true')
            .end((err, res) => {
                assert.equal(res.body.stockData.stock, 'AAPL')
                assert.isNumber(res.body.stockData.price)
                assert.isNumber(res.body.stockData.likes)
                done()
            })
    })

    test('Viewing two stocks: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices?stock=aapl&stock=goog')
            .end((err, res) => {
                assert.equal(res.body.stockData[0].stock, 'AAPL')
                assert.isNumber(res.body.stockData[0].price)
                assert.isNumber(res.body.stockData[0].rel_likes)

                assert.equal(res.body.stockData[1].stock, 'GOOG')
                assert.isNumber(res.body.stockData[1].price)
                assert.isNumber(res.body.stockData[1].rel_likes)
                done()
            })
    })

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices?stock=aapl&stock=goog&like=true')
            .end((err, res) => {
                assert.equal(res.body.stockData[0].stock, 'AAPL')
                assert.isNumber(res.body.stockData[0].price)
                assert.isNumber(res.body.stockData[0].rel_likes)

                assert.equal(res.body.stockData[1].stock, 'GOOG')
                assert.isNumber(res.body.stockData[1].price)
                assert.isNumber(res.body.stockData[1].rel_likes)
                done()
            })
    })



});
