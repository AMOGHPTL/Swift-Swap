import { formatEther } from "viem";

const Balancer = ({
  token0,
  token1,
  token0Price,
  token1Price,
  token0Amount,
  token1Amount,
  tvl,
}) => {
  const token0Value = token0Amount * token0Price;
  const token1Value = token1Amount * token1Price;

  const token0Percent = (token0Value * 100n) / tvl;
  const token1Percent = (token1Value * 100n) / tvl;

  console.log("token 0 value:", token0Value);

  console.log("tvl:", tvl);

  console.log("token 0 percent:", token0Percent);

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <div className="flex items-center justify-between">
        <p>
          {token0} - {Number(formatEther(token0Amount)).toFixed(2)}
        </p>
        <p>
          {token1} - {Number(formatEther(token1Amount)).toFixed(2)}{" "}
        </p>
      </div>
      <div
        style={{
          height: "10px",
          width: "100%",
          background: `linear-gradient(to right, #0c54bc ${token0Percent}%, #ff37c7 ${token1Percent}%)`,
        }}
      />
      <div className="flex items-center justify-between">
        <p className="text-[#0c54bc]">{token0Percent}%</p>
        <p className="text-[#ff37c7]">{100n-token0Percent}%</p>
      </div>
    </div>
  );
};

export default Balancer;
