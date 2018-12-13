const chai = require('chai')
const expect = require('chai').expect
const registry = require("../src")

chai.should()

beforeEach(async () => {
    //rien
})

const id = "5a6a03c03e77667641d2d2c3"
const badId = id + "ee"

describe('TU query', function () {

    it('validate a good id', function () {
        expect(registry.isValidId(id)).is.true
    })

    it('invalidate a bad id', function () {
        expect(registry.isValidId(badId)).is.false
    })

    it('validate a good id as array', function () {
        expect(registry.isValidIds(id)).is.true
    })

    it('invalidate a bad id as array', function () {
        expect(registry.isValidId(badId)).is.false
    })

    it('validate a good ids', function () {
        expect(registry.isValidIds([id, id, id])).is.true
        expect(registry.isValidIds(['5a6a03c03e77667641d2d2c3', '5a6a03c03e77667641d2d2c3'])).is.true
    })

    it('invalidate a bad ids', function () {
        expect(registry.isValidId([id, badId, id])).is.false
    })

    it('object', function () {
        registry.object(id).should.deep.equal(registry.object(id))
    })

    it('give objectId from id', function () {
        registry.objectNoEx(id).should.deep.equal(registry.object(id))
    })

    it('createObjectId', function () {
        registry.createObjectId().should.not.be.null
        registry.createObjectId().toString().should.have.length(24)
    })

    it('gives null since id is bad', function () {
        expect(registry.objectNoEx(badId)).to.be.false
    })

})