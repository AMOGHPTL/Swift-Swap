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
  const [currentToken, setCurrentToken] = useState("");
  const [buyToken, setBuyToken] = useState("");

  const [currentTokenIsopen, setCurrentTokenIsopen] = useState(false);
  const [buyTokenIsOpen, setBuyTokenIsOpen] = useState(false);

  const [currentTokenAmount, setCurrentTokenAmount] = useState(0n);
  const [buyTokenAmount, setBuyTokenAmount] = useState(0n);

  const chainId = useChainId();
  const poolFactoryAddress = PoolFactoryAddresses[chainId];

  useEffect(() => {
    setBuyToken("");
  }, [currentToken]);

  function swapTokens() {
    setCurrentToken(buyToken);
    setBuyToken(currentToken);
    setCurrentTokenAmount(0n);
    setBuyTokenAmount(0n);
  }

  const addressToTokens = getReverseTokens(Tokens);
  const { data: tokenPairKeys, isLoading: isLoadingKeys } =
    useGetTokenPairKeys(poolFactoryAddress);

  const { data: buyTokenOptions, isLoading: isLoadingPairs } = useGetTokenPair(
    poolFactoryAddress,
    Tokens[currentToken] ?? undefined,
  );

  const { data: poolInfo, isLoading: IsLoadingPoolInfo } = useGetPoolInfo(
    poolFactoryAddress,
    Tokens[currentToken],
    Tokens[buyToken],
  );

  const { swap, isSuccess, isConfirming } = useSwap(poolInfo?.poolAddress);

  useEffect(() => {
    if (isSuccess) {
      // reset inputs after successful swap
      setCurrentTokenAmount(0n);
      setBuyTokenAmount(0n);
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
      setCurrentTokenAmount(weiValue);
    } catch {
      setCurrentTokenAmount(0n);
    }
  };

  /*********calculate output **************/

  useEffect(() => {
    if (!poolInfo || currentTokenAmount === "") {
      setBuyTokenAmount("");
      return;
    }

    const reserveIn =
      buyToken === poolInfo.token0 ? reserveToken0 : reserveToken1;

    const reserveOut =
      buyToken === poolInfo.token0 ? reserveToken1 : reserveToken0;

    const output = getAmountOut(
      reserveIn,
      reserveOut,
      currentTokenAmount,
      poolInfo.fee,
    );

    setBuyTokenAmount(output);
  }, [currentTokenAmount, buyToken, reserveToken0, reserveToken1, poolInfo]);

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
      <div className="flex flex-col relative gap-[15px] max-w-[800px]">
        <SwapInput
          token={currentToken}
          isOpen={currentTokenIsopen}
          setIsOpen={setCurrentTokenIsopen}
          setToken={setCurrentToken}
          tokens={allTokens}
          amount={formatEther(currentTokenAmount)}
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
      <div>
        <button
          disabled={!currentToken || !buyToken || !currentTokenAmount}
          onClick={() => swap(Tokens[currentToken], currentTokenAmount)}
          className={`bg-pink-500 px-[15px] py-[5px] w-[200px] cursor-pointer rounded-xl disabled:cursor-not-allowed disabled:bg-pink-950`}
        >
          swap
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
