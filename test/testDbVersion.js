import {col, dbInit, getLastVersion, setLastVersion, VERSION_COLLECTION} from "../src";
import {withTest} from "test-api-express-mongo";
import {initDatabase} from "test-api-express-mongo";
import {cols} from "test-api-express-mongo";
import ENV from "./env";
import {expect} from 'chai';

const add101Version = withTest([
    {
        db: {
            preChange: {
                colname: VERSION_COLLECTION,
                doc: {
                    name:"OTHER",
                    version:"1.0.2",
                    date: new Date()
                }
            }
        }
    },
    {
        db: {
            preChange: {
                colname: VERSION_COLLECTION,
                doc: {
                    name:"OTHER",
                    version:"1.0.1",
                    date: new Date()
                }
            }
        }
    },
    {
        db: {
            preChange: {
                colname: VERSION_COLLECTION,
                doc: {
                    name:"OTHER",
                    version:"1.0.0",
                    date: new Date()
                }
            }
        }
    },
    {
        db: {
            preChange: {
                colname: VERSION_COLLECTION,
                doc: {
                    name:"test",
                    version:"1.0.1",
                    date: new Date()
                }
            }
        }
    }
]);
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
        (await getLastVersion("name")).should.be.equal("0.0.0");
    });

    it('get Last version', async function () {
        await add101Version();
        (await getLastVersion("test")).should.be.equal("1.0.1");
    });

    it('set Last version', async function () {
        await add101Version();
        await setLastVersion("test","2.0.0");
        (await getLastVersion("test")).should.be.equal("2.0.0");
    });
});