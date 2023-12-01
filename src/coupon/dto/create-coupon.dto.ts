import { IsNumber, Min } from "class-validator"

export class RedeemCouponDto {
  @Min(1)
  @IsNumber()
  rewardId: number

  @Min(1)
  @IsNumber()
  playerId: number
}