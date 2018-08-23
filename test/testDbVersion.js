import {col, dbInit, getLastVersion, setLastVersion, VERSION_COLLECTION} from "../src";
import {withTest} from "test-api-express-mongo/dist/api";
import {initDatabase} from "test-api-express-mongo/dist/db";
import {cols} from "test-api-express-mongo/dist/domain";
import ENV from "./env";
import {expect} from 'chai';

const add101Version = withTest({
    db: {
        preChange: {
            colname: VERSION_COLLECTION,
            doc: {
                _id:"5b3f56df46e9b64b847494a5",
                version:"1.0.1",
                date: new Date()
            }
        }
    }
});
const emptyRegistry = [];
const someData = {mail: "toto@bf.org",clearpassword: "tirlititi",god: true};
const addUserRegistry = [{
    version: "0.1",
    log: "User admin",
    script: () => col(VERSION_COLLECTION).insertOne(someData)
}];

describe('Upgrade', function () {

    beforeEach(initDatabase(ENV,{version:VERSION_COLLECTION}));

    it('Connect then empty upgrade', () => dbInit(ENV, emptyRegistry));

    it('Connect then some upgrade', () =>
        dbInit(ENV, addUserRegistry)
            .then(async () => expect((await col(VERSION_COLLECTION).findOne(someData)).clearpassword).to.equal("tirlititi"))
    );
});

describe('Versions', async function () {
    beforeEach(initDatabase(ENV,{version:VERSION_COLLECTION}));

    it('get Init version', async function () {
        (await getLastVersion()).should.be.equal("0.0.0");
    });

    it('get Last version', async function () {
        await add101Version();
        (await getLastVersion()).should.be.equal("1.0.1");
    });

    it('set Last version', async function () {
        await add101Version();
        await setLastVersion("2.0.0");
        (await getLastVersion()).should.be.equal("2.0.0");
    });
});