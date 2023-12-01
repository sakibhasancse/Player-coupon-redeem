
export const players = [
  { name: 'Player 1' },
  { name: 'Player 2' },
];

export const rewards = [
  { name: 'Airline ticket', startDate: new Date(new Date().setHours(0, 0, 0, 0)), endDate: new Date(new Date().setDate(new Date().getDate() + 7)), perDayLimit: 3, totalLimit: 21 },
  { name: 'Nike shoes', startDate: new Date("2023-12-01"), endDate: new Date("2023-12-02"), perDayLimit: 2, totalLimit: 15 },
];

export const coupons = [
  { value: 'coupon1', rewardId: 1 }, // Assuming rewardId 1 corresponds to 'Airline ticket'
  { value: 'coupon2', rewardId: 2 }, // Assuming rewardId 2 corresponds to 'Nike shoes'
];