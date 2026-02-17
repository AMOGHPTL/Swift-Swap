export function getReverseTokens(TokenName) {
      const Tokens = Object.fromEntries(
    Object.entries(TokenName).map(([name, addr]) => [addr, name]),
  );
  return Tokens;
} 

export function shorten(value, start = 3, end = 3) {
  if (!value) return "";
  const str = value.toString();

  if (str.length <= start + end) return str;

  return `${str.slice(0, start)}...${str.slice(-end)}`;
}
export function getAmountOut(reserveIn, reserveOut, amountIn, fee) {
  reserveIn = BigInt(reserveIn);
  reserveOut = BigInt(reserveOut);
  amountIn = BigInt(amountIn);
  fee = BigInt(fee);

  if (amountIn <= 0n) return 0n;

  const amountInWithFee = amountIn - fee;

  const amountOut = (amountInWithFee * reserveOut)/ (reserveIn + amountInWithFee);

  return amountOut;
}

export function getAmountInFromAmountOut(
  reserveIn,
  reserveOut,
  amountOut,
  fee
) {
  reserveIn = BigInt(reserveIn);
  reserveOut = BigInt(reserveOut);
  amountOut = BigInt(amountOut);
  fee = BigInt(fee);

  if (amountOut <= 0n) return 0n;

  const feeDenominator = 1000n;

  const numerator =
    reserveIn * amountOut * feeDenominator;

  const denominator =
    (reserveOut - amountOut) *
    (feeDenominator - fee);

  return numerator / denominator + 1n;
}




