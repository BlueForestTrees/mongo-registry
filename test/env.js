const debug = require('debug')('test:mongo:registry')

const ENV = {
    DB_NAME: process.env.DB_NAME || "BlueForestTreesDB",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: process.env.DB_PORT || 27017,
    DB_UPGRADE: process.env.DB_UPGRADE || "NONE",
    DB_USER: process.env.DB_USER || "doudou",
    DB_PWD: process.env.DB_PWD || "masta",
};

ENV.VERSION = "1.0.0";

debug("ENV", JSON.stringify(ENV))

export default ENV;