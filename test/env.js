import {debug} from 'test-api-express-mongo/dist/util'

const ENV = {
    DB_NAME: process.env.DB_NAME || "BlueForestTreesDB",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: process.env.DB_PORT || 27017,
    DB_UPGRADE: process.env.DB_UPGRADE || "NONE",
};

ENV.VERSION = "1.0.0";

debug({ENV});

export default ENV;