const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../app')
const should = chai.should()
const sum = require('../routes/teachers')

chai.use(chaiHttp)
//Our parent block
describe('Teachers', () => {
  /*
   * Test the /GET route
   */
  describe('/GET teachers', () => {
    it('it should GET all teachers', done => {
      chai
        .request(server)
        .get('/api/teachers')
        .set(
          'authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDdlMjMwNThlMDJlMzRmNTQ2OTIzNjIiLCJpYXQiOjE2MzA2NTE0MDYsImV4cCI6MTYzMTI1NjIwNn0.KYoJbP9fytn-2uEbzm8108ecSwPGXWo9uUBGuZsfwjQ'
        )
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          done()
        })
    })
  })
})
