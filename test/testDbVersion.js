const registry = require("../src")

const test = require("test-api-express-mongo")

const ENV = require("./env")
const expect = require('chai').expect

const add101Version = test.withTest([
    {
        db: {
            preChange: {
                colname: registry.VERSION_COLLECTION,
                doc: {
                    name: "OTHER",
                    version: "1.0.2",
                    date: new Date()
                }
            }
        }
    },
    {
        db: {
            preChange: {
                colname: registry.VERSION_COLLECTION,
                doc: {
                    name: "OTHER",
                    version: "1.0.1",
                    date: new Date()
                }
            }
        }
    },
    {
        db: {
            preChange: {
                colname: registry.VERSION_COLLECTION,
                doc: {
                    name: "OTHER",
                    version: "1.0.0",
                    date: new Date()
                }
            }
        }
    },
    {
        db: {
            preChange: {
                colname: registry.VERSION_COLLECTION,
                doc: {
                    name: "test",
                    version: "1.0.1",
                    date: new Date()
                }
            }
        }
    }
])
const emptyRegistry = []
const someData = {mail: "toto@bf.org", clearpassword: "tirlititi", god: true}
const addUserRegistry = [{
    version: "0.1",
    log: "User admin",
    script: function () {
        return registry.col(registry.VERSION_COLLECTION).insertOne(someData)
    }
}]

describe('Upgrade', function () {

    beforeEach(test.initDatabase(ENV, {version: registry.VERSION_COLLECTION}))

    it('Connect then empty upgrade', function () {
        return registry.dbInit(ENV, emptyRegistry)
    })

    it('Connect then some upgrade', function () {
        return registry.dbInit(ENV, addUserRegistry).then(function () {
                return registry.col(registry.VERSION_COLLECTION).findOne(someData).then(function (doc) {
                    expect(doc).to.not.be.null
                    expect(doc.clearpassword).to.equal("tirlititi")
                })
            }
        )
    })

    describe('Versions', function () {
        beforeEach(test.initDatabase(ENV, {version: registry.VERSION_COLLECTION}))

        it('get Init version', function () {
            registry.getLastVersion("name").then(function (doc) {
                doc.should.be.equal("0.0.0")
            })
        })

        it('get Last version', function () {
            add101Version().then(function () {
                registry.getLastVersion("test").then(function (version) {
                    version.should.be.equal("1.0.1")
                })
            })
        })

        it('set Last version', function () {
            add101Version().then(function () {
                registry.setLastVersion("test", "2.0.0").then(function () {
                    registry.getLastVersion("test").then(function (version) {
                        version.should.be.equal("2.0.0")
                    })
                })
            })
        })
    })
})