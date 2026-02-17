import { formatEther } from "viem";
import { useGetERC20Balance } from "../../hooks/erc20";
import Tokens from "../../abi/tokenAddressToName.json";

const Input = ({ token, amount, setAmount, title = "" }) => {
  const { data: tokenBalance, isLoading } = useGetERC20Balance(Tokens[token]);

  if (isLoading) return <div>Loading balance....</div>;

  const formattedBalance = tokenBalance
    ? Number(formatEther(tokenBalance)).toFixed(2)
    : "0.00";

  return (
    <div className="flex flex-col gap-[15px] px-[20px] py-[20px] border-[2px] border-gray-600 rounded-3xl">
      {title && <p className="text-xl font-semibold text-gray-400">{title}</p>}

      <div className="flex justify-between gap-[40px]">
        <div className="flex flex-1 bg-gray-600 p-[5px] rounded-2xl px-[20px]">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            className="w-full outline-0 text-[24px]"
          />
        </div>

        <div className="flex flex-col justify-between p-[5px] min-w-[150px]">
          <div className="flex bg-gray-800 px-[8px] py-[4px] rounded-xl items-center justify-center gap-[8px]">
            <img src={`/tokens/${token}.svg`} alt="" className="w-[24px]" />
            <p className="text-[24px]">{token}</p>
          </div>

          <div className="flex justify-end">
            <p>max : {formattedBalance}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Input;
