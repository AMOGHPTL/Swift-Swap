import { useChainId } from "wagmi";
import { formatEther, parseEther, isAddress } from "viem";
import { useEffect, useState } from "react";

import { getReverseTokens, shorten, getAmountOut } from "../utils/utils";

import TokenName from "../abi/tokenAddressToName.json";
import PoolFactoryAddresses from "../abi/LiquidityPoolFactoryAddresses.json";

import {
  useGetPoolLiquidity,
  useGetTokenReserve,
  useSwap,
} from "../hooks/pool";
import { useGetPoolInfoWithPoolAddress } from "../hooks/poolFactory";

import arrow from "../assets/arrow.svg";
import Input from "./low-level/input";
import SwapArrow from "./low-level/SwapArrow";
import { useGetERC20Balance } from "../hooks/erc20";

const PoolSwap = ({ address }) => {
  const [sellToken, setSellToken] = useState("");
  const [buyToken, setBuyToken] = useState("");

  const [amountIn, setAmountIn] = useState(0n);
  const [amountOut, setAmountOut] = useState(0n);

  const Tokens = getReverseTokens(TokenName);

  const chainId = useChainId();
  const factoryAddress = PoolFactoryAddresses[chainId];

  const enabled = Boolean(factoryAddress && address && isAddress(address));

  const { liquidity, isLoadingLiquidity } = useGetPoolLiquidity(address);

  const { data, isLoading, isError } = useGetPoolInfoWithPoolAddress(
    factoryAddress,
    address,
    enabled,
  );

  const reserveToken0 =
    useGetTokenReserve(address, data?.token0)?.reserve ?? 0n;

  const reserveToken1 =
    useGetTokenReserve(address, data?.token1)?.reserve ?? 0n;

  const { swap } = useSwap(address);

  /* ---------------- INIT TOKENS ---------------- */

  useEffect(() => {
    if (!data) return;

    setBuyToken(data.token0);
    setSellToken(data.token1);
  }, [data]);

  /* ---------------- CALCULATE OUTPUT ---------------- */

  useEffect(() => {
    if (!data || amountIn === 0n) {
      setAmountOut(0n);
      return;
    }

    const reserveIn = buyToken === data.token0 ? reserveToken0 : reserveToken1;

    const reserveOut = buyToken === data.token0 ? reserveToken1 : reserveToken0;

    const output = getAmountOut(reserveIn, reserveOut, amountIn, data.fee);

    setAmountOut(output);
  }, [amountIn, buyToken, reserveToken0, reserveToken1, data]);

  /* ---------------- INPUT HANDLER ---------------- */

  const handleAmountChange = (value) => {
    try {
      const weiValue = parseEther(value || "0");
      setAmountIn(weiValue);
    } catch {
      setAmountIn(0n);
    }
  };

  /* ---------------- SWITCH TOKENS ---------------- */

  function swapTokens() {
    setBuyToken(sellToken);
    setSellToken(buyToken);
    setAmountIn(0n);
    setAmountOut(0n);
  }

  /* ---------------- GUARDS ---------------- */

  if (!enabled) return null;
  if (isLoading || isLoadingLiquidity) return <div>Loading {address}...</div>;
  if (isError || !data) return <div>Error loading {address}</div>;

  /* ---------------- UI ---------------- */

  return (
    <div className="flex flex-col gap-[10px] p-[80px] ">
      <div className="flex flex-col">
        <div className="flex items-center gap-[10px]">
          <p className="text-gray-400">Pools</p>
          <img src={arrow} alt="" className="w-[10px] rotate-270" />
          <p>
            {Tokens[data.token0]}/{Tokens[data.token1]} {shorten(address)}
          </p>
        </div>

        <div className="flex flex-col gap-[60px]">
          <div className="flex items-center gap-[10px]">
            <div className="flex items-center gap-[10px] text-[32px]">
              <img
                src={`/tokens/${Tokens[data.token0]}.svg`}
                alt=""
                className="w-[32px]"
              />
              <p>{Tokens[data.token0]}</p>
            </div>

            <p className="text-[32px]">/</p>

            <div className="flex items-center gap-[10px] text-[32px]">
              <img
                src={`/tokens/${Tokens[data.token1]}.svg`}
                alt=""
                className="w-[32px]"
              />
              <p>{Tokens[data.token1]}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-black p-[20px] rounded-4xl gap-[20px] max-w-[70%]">
        <div>
          <p className="text-2xl">Swap tokens</p>
        </div>

        <div className="flex justify-between">
          <div className="flex flex-col gap-[30px]">
            <div className="flex flex-col relative gap-[15px] max-w-[800px]">
              <Input
                token={Tokens[buyToken]}
                amount={formatEther(amountIn)}
                setAmount={handleAmountChange}
                title="Sell"
              />

              <SwapArrow action={swapTokens} />

              <Input
                token={Tokens[sellToken]}
                amount={formatEther(amountOut)}
                setAmount={() => {}}
                title="Buy"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[30px]">
            <div>
              <p>Pool swap Fee : {data.fee.toString()} tokens</p>
              <p>
                {Tokens[data.token0]} amount:{" "}
                {Number(formatEther(reserveToken0)).toFixed(2)}
              </p>
              <p>
                {Tokens[data.token1]} amount:{" "}
                {Number(formatEther(reserveToken1)).toFixed(2)}
              </p>
            </div>

            <div>
              <button
                onClick={() => swap(sellToken, amountIn)}
                className="bg-blue-700 px-[15px] py-[5px] cursor-pointer rounded-xl"
              >
                swap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolSwap;
