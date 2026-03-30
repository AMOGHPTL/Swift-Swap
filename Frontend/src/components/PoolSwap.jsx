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
import lock from "../assets/lock.svg";
import back from "../assets/back.svg";
import { useNavigate } from "react-router-dom";

const PoolSwap = ({ address }) => {
  const [sellToken, setSellToken] = useState("");
  const [buyToken, setBuyToken] = useState("");

  const [amountIn, setAmountIn] = useState(0n);
  const [amountOut, setAmountOut] = useState(0n);

  const navigate = useNavigate();

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

  const { swap, isPending, isSuccess } = useSwap(address);

  useEffect(() => {
    if (isSuccess) {
      navigate(`/Pool/${address}`);
    }
  }, [isSuccess]);

  /* ---------------- INIT TOKENS ---------------- */

  useEffect(() => {
    if (!data) return;

    setBuyToken(data.token1);
    setSellToken(data.token0);
  }, [data]);

  /* ---------------- CALCULATE OUTPUT ---------------- */

  useEffect(() => {
    if (!data || amountIn === 0n) {
      setAmountOut(0n);
      return;
    }

    const reserveIn = sellToken === data.token0 ? reserveToken0 : reserveToken1;
    const reserveOut =
      sellToken === data.token0 ? reserveToken1 : reserveToken0;

    const output = getAmountOut(reserveIn, reserveOut, amountIn, data.fee);

    setAmountOut(output);
  }, [amountIn, buyToken, sellToken, reserveToken0, reserveToken1, data]);

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
        <div
          onClick={() => navigate(`/Pool/${address}`)}
          className="flex items-center gap-[10px] cursor-pointer"
        >
          <p className="text-gray-400">
            {Tokens[data.token0]}/{Tokens[data.token1]} {shorten(address)}
          </p>
          <img src={arrow} alt="" className="w-[10px] rotate-270" />
          <p>Swap</p>
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

      <div className="flex flex-col bg-black p-[30px] rounded-4xl gap-[20px] max-w-[70%]">
        <div>
          <p className="text-2xl">Swap tokens</p>
        </div>

        <div className="flex justify-between">
          <div className="flex flex-col gap-[30px]">
            <div className="flex flex-col relative gap-[15px] max-w-[800px]">
              <Input
                token={Tokens[sellToken]}
                amount={formatEther(amountIn)}
                setAmount={handleAmountChange}
                title="Sell"
              />

              <SwapArrow action={swapTokens} />

              <Input
                token={Tokens[buyToken]}
                amount={formatEther(amountOut)}
                setAmount={() => {}}
                title="Buy"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[30px]">
            <div>
              <p>Pool swap Fee : {data.fee.toString()}%</p>
              <p>
                {Tokens[data.token0]} tokens:{" "}
                {Number(formatEther(reserveToken0)).toFixed(2)}
              </p>
              <p>
                {Tokens[data.token1]} tokens:{" "}
                {Number(formatEther(reserveToken1)).toFixed(2)}
              </p>
            </div>

            <div>
              <button
                disabled={isPending || amountIn == 0n}
                onClick={() => swap(sellToken, amountIn)}
                className="bg-pink-500 flex justify-center items-center h-[42px] px-[15px] py-[8px] min-w-[150px] cursor-pointer rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <img src={lock} alt="" className="w-[16px]" />
                ) : (
                  "swap"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolSwap;
