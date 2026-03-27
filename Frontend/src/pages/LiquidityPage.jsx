import { formatEther } from "viem";
import { isAddress } from "viem";
import { useChainId } from "wagmi";
import { useNavigate, useParams } from "react-router-dom";
import { getReverseTokens, shorten } from "../utils/utils";
import TokenName from "../abi/tokenAddressToName.json";
import { useGetPoolInfoWithPoolAddress } from "../hooks/poolFactory";
import PoolFactoryAddresses from "../abi/LiquidityPoolFactoryAddresses.json";
import arrow from "../assets/arrow.svg";
import Input from "../components/low-level/input";
import ActionBtn from "../components/low-level/ActionBtn";
import { useAddLiquidity } from "../hooks/pool";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import lock from "../assets/lock.svg";

const LiquidityPage = () => {
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");

  const { address } = useParams();

  const Tokens = getReverseTokens(TokenName);

  const navigate = useNavigate();

  const chainId = useChainId();
  const factoryAddress = PoolFactoryAddresses[chainId];

  const enabled = Boolean(factoryAddress && address && isAddress(address));

  const { data, isLoading, isError } = useGetPoolInfoWithPoolAddress(
    factoryAddress,
    address,
    enabled,
  );

  const { addLiquidity, isPending, isSuccess } = useAddLiquidity(
    address,
    data?.token0,
    data?.token1,
  );

  useEffect(() => {
    if (isSuccess) {
      navigate("/ExplorePools");
    }
  }, [isSuccess]);

  if (!enabled) return null;
  if (isLoading) return <div>Loading {address}...</div>;
  if (isError) return <div>Error loading {address}</div>;

  return (
    <div className="p-[80px]">
      <div
        onClick={() => navigate(`/Pool/${address}`)}
        className="flex items-center gap-[10px] cursor-pointer"
      >
        <p>
          {Tokens[data.token0]}/{Tokens[data.token1]} {shorten(address)}
        </p>
        <img src={arrow} alt="" className="w-[10px] rotate-270" />
        <p className="text-gray-400">Supply Liquidity</p>
      </div>
      <div className="flex flex-col gap-[30px]">
        <div className="flex items-center gap-[10px]">
          <div className="flex items-center gap-[10px] text-[32px]">
            <img
              src={`../public/tokens/${Tokens[data.token0]}.svg`}
              alt=""
              className="w-[32px]"
            />
            <p>{Tokens[data.token0]}</p>
          </div>
          <p className="text-[32px]">/</p>
          <div className="flex items-center gap-[10px] text-[32px]">
            <img
              src={`../public/tokens/${Tokens[data.token1]}.svg`}
              alt=""
              className="w-[32px]"
            />
            <p>{Tokens[data.token1]}</p>
          </div>
        </div>
        <div className="flex flex-col gap-[30px]">
          <div>
            <p className="text-2xl">Add Liquidity</p>
          </div>
          <div className="flex flex-col gap-[20px] max-w-[800px]">
            <Input
              token={Tokens[data.token0]}
              max={20}
              amount={amount0}
              setAmount={setAmount0}
            />
            <Input
              token={Tokens[data.token1]}
              max={20}
              amount={amount1}
              setAmount={setAmount1}
            />
          </div>
          <div>
            <p>Pool swap Fee : {data.fee}%</p>
            <p>
              {Tokens[data.token0]} tokens: {amount0}
            </p>
            <p>
              {Tokens[data.token1]} tokens: {amount1}
            </p>
          </div>
          <div>
            <div>
              <button
                disabled={isPending || (!amount0 && !amount1)}
                onClick={() =>
                  addLiquidity(
                    parseEther(amount0 || "0"),
                    parseEther(amount1 || "0"),
                  )
                }
                className="bg-pink-500 flex justify-center w-[150px] px-[15px] h-[36px] py-[5px] cursor-pointer rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? <img src={lock} alt="" /> : "create position"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityPage;
