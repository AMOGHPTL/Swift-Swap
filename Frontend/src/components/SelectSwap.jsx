import { useChainId } from "wagmi";
import PoolFactoryAddresses from "../abi/LiquidityPoolFactoryAddresses.json";
import Tokens from "../abi/tokenAddressToName.json";
import {
  useGetPoolInfo,
  useGetTokenPair,
  useGetTokenPairKeys,
} from "../hooks/poolFactory";
import { getReverseTokens, getAmountOut } from "../utils/utils";
import TokenDropDown from "./low-level/TokenDropDown";
import SwapTokenDropDown from "./low-level/SwapTokenDropDown";
import { useEffect, useState } from "react";
import SwapInput from "./low-level/SwapInput";
import SwapArrow from "./low-level/SwapArrow";
import { useGetTokenReserve, useSwap } from "../hooks/pool";
import { formatEther, parseEther } from "viem";

const SelectSwap = () => {
  const [sellToken, setsellToken] = useState("");
  const [buyToken, setBuyToken] = useState("");

  const [sellTokenIsopen, setsellTokenIsopen] = useState(false);
  const [buyTokenIsOpen, setBuyTokenIsOpen] = useState(false);

  const [sellTokenAmount, setsellTokenAmount] = useState(0n);
  const [buyTokenAmount, setBuyTokenAmount] = useState(0n);

  const chainId = useChainId();
  const poolFactoryAddress = PoolFactoryAddresses[chainId];

  useEffect(() => {
    setBuyToken("");
  }, [sellToken]);

  function swapTokens() {
    setsellToken(buyToken);
    setBuyToken(sellToken);
    setsellTokenAmount(0n);
    setBuyTokenAmount(0n);
  }

  const addressToTokens = getReverseTokens(Tokens);
  const { data: tokenPairKeys, isLoading: isLoadingKeys } =
    useGetTokenPairKeys(poolFactoryAddress);

  const { data: buyTokenOptions, isLoading: isLoadingPairs } = useGetTokenPair(
    poolFactoryAddress,
    Tokens[sellToken] ?? undefined,
  );

  const { data: poolInfo, isLoading: IsLoadingPoolInfo } = useGetPoolInfo(
    poolFactoryAddress,
    Tokens[sellToken],
    Tokens[buyToken],
  );

  const { swap, isSuccess, isPending } = useSwap(poolInfo?.poolAddress);

  useEffect(() => {
    if (isSuccess) {
      window.location.reload();
    }
  }, [isSuccess]);

  const reserveToken0 =
    useGetTokenReserve(poolInfo?.poolAddress, poolInfo?.token0)?.reserve ?? 0n;

  const reserveToken1 =
    useGetTokenReserve(poolInfo?.poolAddress, poolInfo?.token1)?.reserve ?? 0n;

  /* ---------------- INPUT HANDLER ---------------- */

  const handleAmountChange = (value) => {
    try {
      const weiValue = parseEther(value || "0");
      setsellTokenAmount(weiValue);
    } catch {
      setsellTokenAmount(0n);
    }
  };

  /*********calculate output **************/

  useEffect(() => {
    if (!poolInfo || sellTokenAmount === 0n) {
      setBuyTokenAmount(0n);
      return;
    }

    // buyToken here is still the human-readable name (e.g. "ETH"),
    // so resolve it to an address first
    const buyTokenAddress = Tokens[buyToken];

    const reserveIn =
      buyTokenAddress === poolInfo.token0 ? reserveToken1 : reserveToken0;

    const reserveOut =
      buyTokenAddress === poolInfo.token0 ? reserveToken0 : reserveToken1;

    const output = getAmountOut(
      reserveIn,
      reserveOut,
      sellTokenAmount,
      poolInfo.fee,
    );

    setBuyTokenAmount(output);
  }, [sellTokenAmount, buyToken, reserveToken0, reserveToken1, poolInfo]);

  const buyTokensList = buyTokenOptions?.map((token) => addressToTokens[token]);

  if (isLoadingKeys || isLoadingPairs) {
    return <p>Loading...</p>;
  }

  const allTokens = [
    ...new Set(tokenPairKeys.map((token) => addressToTokens[token])),
  ];
  console.log("Pool Info:", poolInfo);
  return allTokens.length > 0 ? (
    <div className="flex flex-col items-center gap-[50px] pt-[30px]">
      <p className="text-3xl font-semibold">Swap</p>
      <div className="flex flex-col gap-[10px]">
        <div className="flex flex-col relative gap-[15px] max-w-[800px]">
          <SwapInput
            token={sellToken}
            isOpen={sellTokenIsopen}
            setIsOpen={setsellTokenIsopen}
            setToken={setsellToken}
            tokens={allTokens}
            amount={formatEther(sellTokenAmount)}
            setAmount={handleAmountChange}
            title="Sell"
          />

          <SwapArrow action={swapTokens} />

          <SwapInput
            token={buyToken}
            isOpen={buyTokenIsOpen}
            setIsOpen={setBuyTokenIsOpen}
            setToken={setBuyToken}
            tokens={buyTokensList}
            amount={formatEther(buyTokenAmount)}
            setAmount={() => {}}
            title="Buy"
          />
        </div>
        {sellTokenAmount > 0 && buyTokenAmount == 0 && (
          <p className="text-red-600 px-[10px]">
            * No Liquidity available please select different tokens
          </p>
        )}
      </div>

      <div>
        <button
          disabled={!sellToken || !buyToken || !sellTokenAmount || isPending}
          onClick={() => swap(Tokens[sellToken], sellTokenAmount)}
          className={`bg-pink-500 h-[48px] px-[15px] py-[5px] w-[200px] cursor-pointer rounded-xl disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {isPending ? <img src={lock} alt="" className="w-[16px]" /> : "swap"}
        </button>
      </div>
    </div>
  ) : (
    <div className="p-[80px]">
      <p className="text-3xl">No Pools Available to swap .....</p>
    </div>
  );
};

export default SelectSwap;
