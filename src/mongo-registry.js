const compareVersions = require('compare-versions')

const debug = require('debug')('api:mongo-registry')
const mongodb = require('mongodb')

let database = null

function auth(ENV) {
    return (ENV.DB_USER && ENV.DB_PWD) ? (ENV.DB_USER + ":" + ENV.DB_PWD + "@") : ""
}

const dbUpgrade = function (updates) {
    if (Array.isArray(updates)) {
        for (var i = 0; i < updates.length; i++) {
            doUpdate(updates[i])
        }
    }
}
const doUpdate = update => {
    debug(`${update.version}-${update.log}...`)
    return update.script()
}

const hexRegEx = /^[a-f\d]{24}$/i

const object = function (id) {
    return new mongodb.ObjectID(id)
}

const createObjectId = function () {
    return new mongodb.ObjectID()
}

const isValidId = function (_id) {
    return hexRegEx.test(_id)
}

const objectNoEx = function (_id) {
    return isValidId(_id) && object(_id)
}
const withIdIn = function (ids) {
    return {_id: {$in: ids}}
}

const dbConnect = function (ENV) {
    return Promise
        .resolve(ENV.DB_CONNECTION_STRING ? ENV.DB_CONNECTION_STRING : `mongodb://${auth(ENV)}${ENV.DB_HOST}:${ENV.DB_PORT}/${ENV.DB_NAME}?authSource=admin`)
        .then(url => {
            debug(`CONNECTING TO %o`, url)
            return mongodb.MongoClient.connect(url, {useNewUrlParser: true})
        })
        .then(client => {
            debug("CONNECTED")
            database = client.db(ENV.DB_NAME)
        })
}

const col = function (collectionName) {
    return database.collection(collectionName)
}

const VERSION_COLLECTION = "VersionCollection"

const getLastVersion = function (name) {
    return col(VERSION_COLLECTION)
        .find({name})
        .sort({date: -1})
        .limit(1)
        .next()
        .then(function (v) {
            return v && v.version || "0.0.0"
        })
}
const setLastVersion = function (name, version) {
    return col(VERSION_COLLECTION).insertOne({name, date: new Date(), version})
}

const dbInit = function (ENV, registry) {
    return dbConnect(ENV)
        .then(function () {
            return upgradeDb(ENV.NAME, ENV.VERSION, registry)
        })
}

const filter = function (array, fct) {
    const res = []
    if (Array.isArray(array)) {
        const length = array.length
        for (let i = 0; i < length; i++) {
            if (fct(array[i])) {
                res.push(array[i])
            }
        }
    }
    return res
}

function upgradeDb(name, currentAppVersion, registry) {
    return getLastVersion(name).then(function (currentDbVersion) {
        const comparison = compareVersions(currentAppVersion, currentDbVersion)
        if (comparison > 0) {
            debug(`upgrade db ${name} ${currentDbVersion} => ${currentAppVersion}`)
            dbUpgrade(
                filter(registry, update => compareVersions(update.version, currentDbVersion) > 0)
                    .sort((u1, u2) => compareVersions(u1.version, u2.version))
            )
            setLastVersion(name, currentAppVersion)
        } else if (comparison === 0) {
            debug(`db up to date (${name}-${currentDbVersion})`)
        } else {
            debug(`db is forward (${name}-${currentDbVersion})`)
        }
    })
}

module.exports = {
    object: object,
    objectNoEx: objectNoEx,
    createObjectId: createObjectId,
    isValidId: isValidId,
    withIdIn: withIdIn,
    dbConnect: dbConnect,
    col: col,
    mongodb: mongodb,
    VERSION_COLLECTION: VERSION_COLLECTION,
    getLastVersion: getLastVersion,
    setLastVersion: setLastVersion,
    dbInit: dbInit,
    upgradeDb: upgradeDb
}