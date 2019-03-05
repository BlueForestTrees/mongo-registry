# mongo-registry

Manage mongodb connections + a db versioning system (registry)
Give access to mongo collections https://docs.mongodb.com/manual/reference/method/js-collection/

Example:

```javascript
import ENV from "./env"
import {dbInit, col} from "mongo-registry"

const registry = []//don't use registry now

//init db cinnection
export default dbInit(ENV, registry)
    
    //make some insert/find
    .then(()=>{
        const db = col('collectionName')
        await db.insertOne({name:"example",age:35})
        const doc = col('collectionName').findOne({name:"example"})
        console.log(`What a superb app! ${doc}`
    }))
    .catch(console.error)
```

## Configuration - ```ENV```
ENV is a configuration object, it should containt the following keys:

```javascript
VERSION: version, // comes from package.json version
DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
DB_NAME: process.env.DB_NAME || "mydb",
DB_HOST: process.env.DB_HOST || "localhost",
DB_PORT: process.env.DB_PORT || 27017,
DB_USER: process.env.DB_USER || "myuser",
DB_PWD: process.env.DB_PWD || "mydevpassword"
```

Note that ```DB_CONNECTION_STRING``` replaces others DB_x fields.

## Registry - ```registry```
At connect, mongo-registry will apply the provided registry.
A registry is a versionned array of actions to perform on the database, like adding indexes and so on.
Each version is applied only one time, depending on the current app version.

Registry will use a mongo db collection named 'VersionCollection' to store the last version applied.
Many applications can share the same VersionCollection.


Example: # a registry array containing the versionned actions to perform on a database from scratch #

```javascript
import ENV from "./env"
import {col} from "mongo-registry"
import {PATH_IDX_NAME} from "./const"

export const registry = [
    {
        version: "0.0.3",
        log: "Info.path: index unique",
        script: () => col(ENV.DB_COLLECTION).createIndex({"path": 1}, {unique: true, name: PATH_IDX_NAME})
    },
    {
        version: "0.0.9",
        log: "search (path, description, names) IDX",
        script: () => col(ENV.DB_COLLECTION).createIndex({path: 1, description: 1, "fragment.name": 1}, {name: "searchIDX"})
    }
]
```
