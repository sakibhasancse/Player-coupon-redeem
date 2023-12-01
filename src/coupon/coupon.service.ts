import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Not, Repository } from 'typeorm';

import { Coupon } from '../entities/Coupon';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { Reward } from '../entities/Reward';
import { ICouponService } from './interfaces/coupon';
import { RedeemCouponTypes } from './types';
import { Player } from '../entities/Player';

@Injectable()
export class CouponService implements ICouponService {
  constructor(
    @InjectRepository(PlayerCoupon)
    private readonly playerCouponRepository: Repository<PlayerCoupon>,
    @InjectRepository(Player)
    private readonly PlayerRepository: Repository<Player>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
  ) { }

  async redeemCoupon(parmas: RedeemCouponTypes): Promise<Coupon> {
    const { playerId, rewardId } = parmas
    const reward = await this.rewardRepository.findOne({ where: { id: rewardId } });

    if (!reward) {
      throw new BadRequestException('Reward not found');
    }

    const player = await this.PlayerRepository.findOne({ where: { id: playerId } });

    if (!player) {
      throw new BadRequestException('Player not found');
    }

    const coupon = await this.couponRepository.findOne({
      where: {
        id: Not(In(await this.getUsedCouponIds())),
        Reward: reward,
      },
      relations: ['Reward'],
    });

    if (!coupon) {
      throw new BadRequestException('Coupon not found for this reward');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const currentDate = new Date();


    if (coupon.Reward.endDate < currentDate) {
      throw new BadRequestException('Reward is outdated');
    }
    if (coupon.Reward.startDate > currentDate) {
      throw new BadRequestException('Reward is not started yet');
    }

    const playerCouponsRedeemedToday = await this.playerCouponRepository.count({
      where: {
        player: { id: playerId }, redeemedAt: Between(startOfDay, currentDate),
      },
    });

    if (playerCouponsRedeemedToday >= coupon.Reward.perDayLimit) {
      throw new BadRequestException('Exceeded daily redemption limit');
    }

    const playerCouponsRedeemedTotal = await this.playerCouponRepository.count({
      where: { player: { id: playerId } },
    });


    if (playerCouponsRedeemedTotal >= coupon.Reward.totalLimit) {
      throw new BadRequestException('Exceeded total redemption limit');
    }

    const newRedeemedCoupon = await this.playerCouponRepository.save({
      player: { id: playerId },
      coupon: { id: coupon.id },
      redeemedAt: currentDate,
    });

    return {
      id: newRedeemedCoupon.id,
      value: coupon.value,
      Reward: coupon.Reward
    };
  }

  private async getUsedCouponIds(): Promise<number[]> {
    const usedCoupons = await this.playerCouponRepository.find({ relations: ['coupon'] });
    return usedCoupons.map(pc => pc?.coupon?.id || 0);
  }
}
