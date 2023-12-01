import { Connection, Repository } from 'typeorm';

import { Player } from '../../src/entities/Player';
import { Reward } from '../../src/entities/Reward';
import { Coupon } from '../../src/entities/Coupon';
import { PlayerCoupon } from '../../src/entities/PlayerCoupon';

async function seedAllTestDataForCouponRedemption(connection: Connection) {
  const playerRepository: Repository<Player> = connection.getRepository(Player);
  const players: Partial<Player>[] = [
    { name: 'Player 1' },
    { name: 'Player 2' }
  ];

  await playerRepository.save(players)

  const rewardRepository: Repository<Reward> = connection.getRepository(Reward);
  const rewards: Partial<Reward>[] = [
    {
      name: 'Airline ticket',
      startDate: new Date(new Date().setHours(0, 0, 0, 0)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      perDayLimit: 3, totalLimit: 21
    },
    {
      name: 'Nike shoes',
      startDate: new Date("2023-12-01"),
      endDate: new Date("2023-12-05"),
      perDayLimit: 3, totalLimit: 21
    }
  ];

  const couponRepository: Repository<Coupon> = connection.getRepository(Coupon);
  const newRewards = await rewardRepository.save(rewards)

  const playerCouponRepository: Repository<PlayerCoupon> = connection.getRepository(PlayerCoupon);
  const coupon = await couponRepository.save({ value: `Coupon for test`, Reward: newRewards[0] })

  let redeemedAt = new Date()
  for (let i = 0; i < 20; i++) {
    if (i == 2) redeemedAt = new Date(new Date().setDate(new Date().getDate() - 3))
    const coupon = await couponRepository.save({ value: `Coupon ${i}`, Reward: newRewards[0] })
    await playerCouponRepository.save({
      player: { id: players[0].id },
      coupon: { id: coupon.id },
      redeemedAt
    })
  }

  return {
    players,
    rewards,
    coupons: [coupon]
  }
}


const clearAllDataForCouponRedemption = async (connection: Connection) => {
  const playerRepository: Repository<Player> = connection.getRepository(Player);
  const rewardRepository: Repository<Reward> = connection.getRepository(Reward);
  const couponRepository: Repository<Coupon> = connection.getRepository(Coupon);
  const playerCouponRepository: Repository<PlayerCoupon> = connection.getRepository(PlayerCoupon);

  await playerCouponRepository.delete({})
  await couponRepository.delete({});
  await playerRepository.delete({});
  await rewardRepository.delete({});
};
export const prepareAllDataForCouponRedemptionApi = async (connection: Connection) => {

  await clearAllDataForCouponRedemption(connection)
  const seedData = await seedAllTestDataForCouponRedemption(connection)
  return seedData
}