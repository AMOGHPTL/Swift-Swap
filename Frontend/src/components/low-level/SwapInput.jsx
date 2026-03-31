import SwapTokenDropDown from "./SwapTokenDropDown";
import { useGetERC20Balance } from "../../hooks/erc20";
import Tokens from "../../abi/tokenAddressToName.json";
import { formatEther } from "viem";

const SwapInput = ({
  token,
  isOpen,
  setIsOpen,
  setToken,
  tokens,
  amount,
  setAmount,
  title = "",
}) => {
  const { data: tokenBalance, isLoading } = useGetERC20Balance(Tokens[token]);

  if (isLoading) return <div>Loading balance....</div>;

  const formattedBalance = tokenBalance
    ? Number(formatEther(tokenBalance)).toFixed(2)
    : "0.00";
  return (
    <div className="flex flex-col h-[160px] gap-[15px] px-[20px] py-[20px] border-[2px] border-gray-600 rounded-3xl">
      {title && <p className="text-xl font-semibold text-gray-400">{title}</p>}

      <div className="flex flex-col gap-[5px]">
        <div className="flex justify-between gap-[40px]">
          <div className="flex flex-1 bg-gray-600 p-[5px] rounded-2xl px-[20px]">
            <input
              disabled={!token}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              className="w-full outline-0 text-[24px]"
            />
          </div>

          <SwapTokenDropDown
            token={token}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setToken={setToken}
            tokens={tokens}
          />
        </div>
        {token && (
          <div className="flex justify-end">
            <p>balance : {formattedBalance}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapInput;
