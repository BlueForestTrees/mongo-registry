import compareVersions from 'compare-versions';
import {filter, forEach} from 'lodash';
import {col as dbcol} from "mongo-connexion";
import {dbConnect} from "mongo-connexion";

export const VERSION_COLLECTION = "VersionCollection";

export const col = dbcol;
export const getLastVersion = async () => {
    const v = await col("VersionCollection").find().sort({date: -1}).limit(1).next();
    return v && v.version || "0.0.0"
};
export const setLastVersion = version => col("VersionCollection").insert({date: new Date(), version});

export const dbInit = (ENV, registry) =>
    dbConnect(ENV)
        .then(()=>upgradeDb(ENV.VERSION, registry));

export async function upgradeDb(currentAppVersion, registry) {
    const currentDbVersion = await getLastVersion();
    const comparison = compareVersions(currentAppVersion, currentDbVersion);

    if (comparison > 0) {
        console.log(`upgrade db ${currentDbVersion} => ${currentAppVersion}`);
        dbUpgrade(
            filter(registry, update =>
                compareVersions(update.version, currentDbVersion) > 0
            ).sort((u1, u2) => compareVersions(u1.version, u2.version))
        );
        setLastVersion(currentAppVersion);
    } else if (comparison === 0) {
        console.log(`db up to date (${currentDbVersion})`);
    } else {
        console.log(`db is forward (${currentDbVersion})`);
    }
}

const dbUpgrade = updates => forEach(updates, doUpdate);
const doUpdate = async update => {
    console.log(`${update.version}-${update.log}...`);
    await update.script();
};