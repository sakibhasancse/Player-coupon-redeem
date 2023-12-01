import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { Coupon } from '../entities/Coupon';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { Reward } from '../entities/Reward';
import { Player } from '../entities/Player';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, PlayerCoupon, Player, Reward,]),
  ],
  controllers: [CouponController],
  providers: [{ provide: 'COUPON_SERVICE', useClass: CouponService }],
  exports: [{ provide: 'COUPON_SERVICE', useClass: CouponService }],
})
export class CouponModule { }
