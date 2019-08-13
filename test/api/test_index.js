//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();
chai.use(chaiHttp);
let companies = require("../../api/companies");
let app = require("../../index");
// Configure chai
chai.use(chaiHttp);
chai.should();
/*
 * Test the /GET route
 */
describe("/GET companies", () => {
  it("should get all homepage ", done => {
    chai
      .request(companies)
      .post("http://localhost:3000/api")
      .end((err, res) => {
        res.should.have.status(200);

        done();
      });
  });
});
