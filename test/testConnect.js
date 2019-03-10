const expect = require('chai').expect
const registry = require("../src")
const ENV = require("./env")

describe('connect then insert', function () {

    it('Connect', function () {
        return registry.dbConnect(ENV)
    })

    it('Insert',
        function () {
            return registry.dbConnect(ENV).then(function () {
                return registry.col("ConnectCollection").insertOne({field: "value"})
            })
        }
    )

    it('Insert-Find',
        function () {
            return registry.dbConnect(ENV).then(function () {
                return registry.col("ConnectCollection").insertOne({key: "one"})
            }).then(function () {
                return registry.col("ConnectCollection").findOne({key: "one"})
                    .then(function (doc) {
                        return expect(doc.key).to.equal("one")
                    })
            })
        }
    )

})