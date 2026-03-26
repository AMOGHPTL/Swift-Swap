import { formatEther } from "viem";

const PoolCard = ({ tokens, fee }) => {
  return (
    <div className="flex gap-[40px] items-center">
      <div className="flex gap-[10px] items-center">
        {tokens.map((token) => (
          <div className="flex gap-[6px] items-center bg-gray-700 px-[10px] py-[3px] rounded-2xl">
            <img
              src={`../public/tokens/${token}.svg`}
              alt=""
              className="w-[20px]"
            />
            <p>{token}</p>
          </div>
        ))}
      </div>
      <div className="bg-gray-700 px-[10px] py-[3px] rounded-2xl">
        <p>Fee : {fee}%</p>
      </div>
    </div>
  );
};

export default PoolCard;
