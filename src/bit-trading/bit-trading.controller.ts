import { Controller, Get, Param } from '@nestjs/common';
import { BitTradingService } from './bit-trading.service';

@Controller('player')
export class BitTradingController {
  constructor(private readonly bitTradingService: BitTradingService) {}
  @Get('trades/:id?')
  async getPlayerTrades(@Param('id') id = null) {
    return (await this.bitTradingService.getPlayerTrades(id)) || {};
  }

  @Get('sync')
  async syncData() {
    return await this.bitTradingService.syncMongoToCacheRedis();
  }
}
