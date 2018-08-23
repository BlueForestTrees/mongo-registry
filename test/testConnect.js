import {expect} from 'chai'

import {dbConnect, col} from "../src"
import ENV from "./env"

describe('connect then insert', async function () {
    
    it('Connect', () => dbConnect(ENV))
    
    it('Insert',
        () => dbConnect(ENV)
            .then(() => col("ConnectCollection").insertOne({field: "value"}))
    )
    
    it('Insert-Find',
        () => dbConnect(ENV)
            .then(() => col("ConnectCollection").insertOne({key: "one"}))
            .then(async () => expect((await col("ConnectCollection").findOne({key: "one"})).key).to.equal("one"))
    )
    
})