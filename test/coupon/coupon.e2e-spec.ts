import * as request from 'supertest';
import { Test, TestingModule } from "@nestjs/testing";
import { Connection, Repository } from 'typeorm';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { prepareAllDataForCouponRedemptionApi } from './coupon.helper';
import { Reward } from '../../src/entities/Reward';
import { Coupon } from '../../src/entities/Coupon';

describe('Coupon Redemption (e2e)', () => {
  let app;
  let seedData: { players: any[], rewards: any[], coupons: any[] }; // Define types for seedData
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    connection = moduleFixture.get<Connection>(Connection);
    seedData = await prepareAllDataForCouponRedemptionApi(connection); // Update seedData type
  });

  afterAll(async () => {
    await app.close();
  });

  it('should not redeem a coupon without required fields', async () => {
    const exceededResponse = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .expect(400);

    expect(exceededResponse.body.message).toEqual([
      "rewardId must be a number conforming to the specified constraints",
      "rewardId must not be less than 1",
      "playerId must be a number conforming to the specified constraints",
      "playerId must not be less than 1"
    ]);
  });

  it('should throw BadRequestException for a non-existing reward', async () => {
    const { players } = seedData;

    const playerId = players[0].id;
    const fakeRewardId = 99;
    const exceededResponse = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send({ playerId, rewardId: fakeRewardId })
      .expect(400);

    expect(exceededResponse.body.message).toBe('Reward not found');
  });

  it('should throw BadRequestException for a non-existing player id', async () => {
    const { rewards } = seedData;

    const fakePlayerId = 232; // Random player id
    const rewardId = rewards[0].id;
    const exceededResponse = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send({ playerId: fakePlayerId, rewardId })
      .expect(400);

    expect(exceededResponse.body.message).toBe('Player not found');
  });

  it('should throw an error if the reward is outdated', async () => {
    const { players, rewards } = seedData;

    const playerId = players[0].id;
    const rewardId = rewards[0].id;

    const rewardRepository: Repository<Reward> = connection.getRepository(Reward);
    await rewardRepository.update({ id: rewardId }, {
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date(new Date().setDate(new Date().getDate() - 4))
    })

    const exceededResponse = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send({ playerId, rewardId })
      .expect(400);

    expect(exceededResponse.body.message).toBe('Reward is outdated');
  });

  it('should throw an error if the reward is not started yet', async () => {
    const { players, rewards } = seedData;

    const playerId = players[0].id;
    const rewardId = rewards[0].id;

    const rewardRepository: Repository<Reward> = connection.getRepository(Reward);
    await rewardRepository.update({ id: rewardId }, {
      startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7))
    })

    const exceededResponse = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send({ playerId, rewardId })
      .expect(400);

    expect(exceededResponse.body.message).toBe('Reward is not started yet');
  });

  it('should redeem a coupon for a player', async () => {
    const { coupons, rewards, players } = seedData;

    const playerId = players[0].id;
    const rewardId = rewards[0].id;

    const rewardRepository: Repository<Reward> = connection.getRepository(Reward);
    await rewardRepository.update({ id: rewardId }, {
      startDate: new Date(new Date().setDate(new Date().getDate() - 3)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7))
    })

    const redemptionResponse = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send({ playerId, rewardId })
      .expect(200);

    expect(redemptionResponse.body).toHaveProperty('id');
    expect(redemptionResponse.body).toHaveProperty('value');

    expect(redemptionResponse.body.value).toBe(coupons[0].value);
  });

  it('should throw an error if the player is already taken the coupon', async () => {
    const { players, rewards } = seedData;

    const playerId = players[0].id;
    const rewardId = rewards[0].id;

    const exceededResponse = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send({ playerId, rewardId })
      .expect(400);

    expect(exceededResponse.body.message).toBe('Coupon not found for this reward');
  });

  it('should throw an error if the player is exceeded daily redemption limit', async () => {
    const { players, rewards } = seedData;

    const playerId = players[0].id;
    const rewardId = rewards[0].id;

    const couponRepository: Repository<Coupon> = connection.getRepository(Coupon);
    await couponRepository.save({ value: 'Coupon 25', Reward: rewardId })

    const exceededResponse = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send({ playerId, rewardId })
      .expect(400);

    expect(exceededResponse.body.message).toBe('Exceeded daily redemption limit');
  });


  it('should throw an error if the player is exceeded total redemption limit', async () => {
    const { players, rewards } = seedData;

    const playerId = players[0].id;
    const rewardId = rewards[0].id;

    const couponRepository: Repository<Coupon> = connection.getRepository(Coupon);
    await couponRepository.save({ value: 'Coupon 25', Reward: rewardId })

    const rewardRepository: Repository<Reward> = connection.getRepository(Reward);
    await rewardRepository.update({ id: rewardId }, {
      totalLimit: 20, perDayLimit: 4
    })

    const exceededResponse = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send({ playerId, rewardId })
      .expect(400);

    expect(exceededResponse.body.message).toBe('Exceeded total redemption limit');
  });
});
