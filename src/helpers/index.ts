import { Coupon } from 'src/entities/Coupon';
import { Player } from 'src/entities/Player';
import { PlayerCoupon } from 'src/entities/PlayerCoupon';
import { Reward } from 'src/entities/Reward';
import { createConnection } from 'typeorm';
import { coupons, players, rewards } from './data';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env' });

async function seed() {
  console.log("===> Started database seeding ...")
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.TYPEORM_HOST,
    port: Number(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [Player, Reward, Coupon, PlayerCoupon],
    // autoLoadEntities: true,
    synchronize: false,
  });
  console.log("===> Successfully connected database")
  const playerRepository = connection.getRepository(Player);
  await playerRepository.save(players);

  const rewardRepository = connection.getRepository(Reward);
  await rewardRepository.save(rewards);

  const couponRepository = connection.getRepository(Coupon);
  await couponRepository.save(coupons);

  console.log("===> Successfully seeded database")
  await connection.close(); // Close connection after seeding data

}

seed().catch(error => console.error(error));
