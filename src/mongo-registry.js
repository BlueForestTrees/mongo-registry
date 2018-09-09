import compareVersions from 'compare-versions';
const debug = require('debug')('api:mongo-registry')
import _mongodb from 'mongodb'
import {filter, forEach} from 'lodash';
import {map} from 'lodash'

let database = null
const auth = ENV => (ENV.DB_USER && ENV.DB_PWD) ? (ENV.DB_USER + ":" + ENV.DB_PWD + "@") : ""

export const dbConnect = (ENV) => Promise
    .resolve(`mongodb://${auth(ENV)}${ENV.DB_HOST}:${ENV.DB_PORT}/${ENV.DB_NAME}?authSource=admin`)
    .then(url => {
        debug(`CONNECTING TO %o`, url)
        return _mongodb.MongoClient.connect(url, {useNewUrlParser: true})
    })
    .then(client => {
        debug("CONNECTED")
        database = client.db(ENV.DB_NAME)
    })

export const col = collectionName => database.collection(collectionName)
export const mongodb = _mongodb

export const VERSION_COLLECTION = "VersionCollection";

export const getLastVersion = async (name) => {
    const v = await col(VERSION_COLLECTION).find({name}).sort({date: -1}).limit(1).next();
    return v && v.version || "0.0.0"
};
export const setLastVersion = (name,version) => col(VERSION_COLLECTION).insertOne({name, date: new Date(), version});

export const dbInit = (ENV, registry) =>
    dbConnect(ENV)
        .then(()=>upgradeDb(ENV.NAME, ENV.VERSION, registry));

export async function upgradeDb(name, currentAppVersion, registry) {
    const currentDbVersion = await getLastVersion(name);
    const comparison = compareVersions(currentAppVersion, currentDbVersion);
    
    if (comparison > 0) {
        debug(`upgrade db ${currentDbVersion} => ${currentAppVersion}`);
        dbUpgrade(
            filter(registry, update =>
                compareVersions(update.version, currentDbVersion) > 0
            ).sort((u1, u2) => compareVersions(u1.version, u2.version))
        );
        setLastVersion(name, currentAppVersion);
    } else if (comparison === 0) {
        debug(`db up to date (${name}-${currentDbVersion})`);
    } else {
        debug(`db is forward (${name}-${currentDbVersion})`);
    }
}

const dbUpgrade = updates => forEach(updates, doUpdate);
const doUpdate = async update => {
    debug(`${update.version}-${update.log}...`);
    await update.script();
};

const hex = /^[a-f\d]{24}$/i;

export const objects = ids => Array.isArray(ids) ? map(ids, object) : [object(ids)];
export const object = id => new mongodb.ObjectID(id)

export const createObjectId = () => new mongodb.ObjectID()

export const isValidId = _id => hex.test(_id);
export const isValidIds = _ids => Array.isArray(_ids) ? filter(map(_ids, isValidId), item => item).length === _ids.length : isValidId(_ids);


export const objectNoEx = _id => isValidId(_id) && object(_id);
export const withIdIn = ids => ({_id: {$in: ids}});