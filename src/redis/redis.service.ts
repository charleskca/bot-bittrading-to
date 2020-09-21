import { Injectable, OnModuleInit } from '@nestjs/common';
import * as redis from 'redis';
import { promisify } from 'util';
import { PLAYER_TRADES } from './redis.constant';

@Injectable()
export class RedisService implements OnModuleInit {
  _redisClient: redis.RedisClient;
  onModuleInit() {
    this._redisClient = redis.createClient({
      host: process.env.REDIS_URI || 'localhost',
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    });
  }

  get redisClient() {
    return this._redisClient;
  }

  syncMongoToCacheRedis(dataNeedRecord) {
    return this.redisClient.hmset(PLAYER_TRADES, dataNeedRecord);
  }

  async getPlayerTrades(id?: string) {
    if (id) {
      const getAsync = promisify(this.redisClient.hmget).bind(this.redisClient);
      return await getAsync(PLAYER_TRADES, id);
    }
    const getAsync = promisify(this.redisClient.hgetall).bind(this.redisClient);
    return await getAsync(PLAYER_TRADES);
  }
}
