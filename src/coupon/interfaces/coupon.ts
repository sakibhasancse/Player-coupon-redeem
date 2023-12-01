import { Coupon } from "../../entities/Coupon";
import { RedeemCouponTypes } from "../types";

export interface ICouponService {
  redeemCoupon(params: RedeemCouponTypes): Promise<Coupon>;
}