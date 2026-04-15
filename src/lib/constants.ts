export const PRICING = { 10: 20, 20: 30, 40: 60 };

export const calculateTotal = (qty: number, floor: number) => {
  const base = PRICING[qty as keyof typeof PRICING] || 0;
  const deliveryCharge = floor > 1 ? (floor - 1) * 5 : 0;
  return base + deliveryCharge;
};
