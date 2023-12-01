import { Request, Response } from 'express'
import { Controller, Post, Body, Inject, Req, Res } from '@nestjs/common';

import { RedeemCouponDto } from './dto/create-coupon.dto';
import { ICouponService } from './interfaces/coupon';

@Controller('coupon-redeem')
export class CouponController {
  constructor(
    @Inject('COUPON_SERVICE') private readonly couponService: ICouponService
  ) { }

  @Post()
  async redeemCoupon(@Req() req: Request, @Body() redeemData: RedeemCouponDto, @Res() res: Response) {
    console.log("===> Coupon redeem payload", redeemData)
    const redeemedCoupon = await this.couponService.redeemCoupon(redeemData);
    return res.status(200).json({ id: redeemedCoupon.id, value: redeemedCoupon.value })
  }
}
