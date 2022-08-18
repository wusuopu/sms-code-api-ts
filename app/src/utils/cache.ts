// a key-value store base redis or leveldb.
import redis, { createClient } from 'redis'
import levelup from 'levelup'
import leveldown from 'leveldown'
import levelttl from 'level-ttl'
import path from 'path'
import _ from 'lodash'
import fs from 'fs-extra'
import config, { ROOT_PATH } from "@/config";

interface Store {
  key_prefix?: string;
  client: any;
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<boolean>;
  del(key: string): Promise<boolean>;
}

export class RedisStore implements Store {
  key_prefix: string;
  client: redis.RedisClientType
  redis_uri: string;

  constructor (redis_uri: string, key_prefix = '') {
    this.key_prefix = key_prefix
    this.redis_uri = redis_uri
    this.client = createClient({ url: this.redis_uri })
    this.client.connect()
  }
  async get (key: string): Promise<any> {
    return await this.client.get(`${this.key_prefix}${key}`)
  }
  async set (key: string, value: any, ttl?: number): Promise<boolean> {
    if (!_.isString(value)) {
      value = JSON.stringify(value)
    }
    if (ttl) {
      await this.client.set(`${this.key_prefix}${key}`, value, { EX: ttl })
    } else {
      await this.client.set(`${this.key_prefix}${key}`, value)
    }
    return true
  }
  async del (key: string): Promise<boolean> {
    try {
      await this.client.del(`${this.key_prefix}${key}`)
      return true
    } catch (error) {
      return false
    }
  }
}

export class LevelDBStore implements Store {
  _client: any;
  dbpath: string;
  constructor (dbpath: string) {
    this.dbpath = dbpath
  }
  async get (key: string): Promise<string|undefined> {
    try {
      return await this.client.get(key)
    } catch (error) {
      return
    }
  }
  async set (key: string, value: any, ttl?: number): Promise<boolean> {
    if (!_.isString(value)) {
      value = JSON.stringify(value)
    }
    const options: {ttl?: number} = {}
    if (ttl) {
      options.ttl = ttl * 1000
    }
    await this.client.put(key, value, options)
    return true
  }
  async del (key: string): Promise<boolean> {
    return await this.client.del(key)
  }

  get client() {
    if (!this._client) {
      this._client = levelttl(levelup(leveldown(this.dbpath)))
    }
    return this._client
  }
}

let levelDBStore: LevelDBStore
let redisStore: RedisStore
export const createLevelDBStore = (): LevelDBStore => {
  if (!levelDBStore) {
    let LEVELDB_PATH = path.join(ROOT_PATH, config.LEVELDB_PATH || path.resolve('tmp/data'))
    LEVELDB_PATH = `${LEVELDB_PATH}-${config.NODE_ENV}`
    const dirname = path.dirname(LEVELDB_PATH)
    fs.ensureDirSync(dirname)
    levelDBStore = new LevelDBStore(LEVELDB_PATH)
  }
  return levelDBStore
}
export const createRedisStore = (): RedisStore => {
  if (!redisStore) {
    redisStore = new RedisStore(config.REDIS_URL, config.REDIS_KEY_PREFIX)
  }
  return redisStore
}

let db: Store
if (config.STORAGE_PROVIDER === 'leveldb') {
  db = createLevelDBStore()
} else {
  db = createRedisStore()
}

export default db
