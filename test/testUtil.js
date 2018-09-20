import chai from 'chai'
import {expect} from 'chai'
import {isValidId, isValidIds, object, objectNoEx} from "../src"
import {mongodb} from "../src"

chai.should()

beforeEach(async () => {
    //rien
})

const id = "5a6a03c03e77667641d2d2c3"
const badId = id + "ee"

describe('TU query', function () {
    
    it('validate a good id', function () {
        expect(isValidId(id)).is.true
    })
    
    it('invalidate a bad id', function () {
        expect(isValidId(badId)).is.false
    })
    
    it('validate a good id as array', function () {
        expect(isValidIds(id)).is.true
    })
    
    it('invalidate a bad id as array', function () {
        expect(isValidId(badId)).is.false
    })
    
    it('validate a good ids', function () {
        expect(isValidIds([id, id, id])).is.true
        expect(isValidIds(['5a6a03c03e77667641d2d2c3', '5a6a03c03e77667641d2d2c3'])).is.true
    })
    
    it('invalidate a bad ids', function () {
        expect(isValidId([id, badId, id])).is.false
    })
    
    it('object', async function () {
        object(id).should.deep.equal(new mongodb.ObjectID(id))
    })

    it('give objectId from id', async function () {
        objectNoEx(id).should.deep.equal(new mongodb.ObjectID(id))
    })
    
    it('gives null since id is bad', async function () {
        expect(objectNoEx(badId)).to.be.false
    })
    
})