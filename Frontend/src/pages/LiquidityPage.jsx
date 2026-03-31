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
import { useAddLiquidity, useGetTokenReserve } from "../hooks/pool";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import lock from "../assets/lock.svg";
import toast from "react-hot-toast";

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

  const reserveToken0 = useGetTokenReserve(address, data?.token0).reserve;
  const reserveToken1 = useGetTokenReserve(address, data?.token1).reserve;

  const { addLiquidity, isPending, isSuccess } = useAddLiquidity(
    address,
    data?.token0,
    data?.token1,
  );

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        `Added ${Number(formatEther(amount0)).toFixed(2)}${Tokens[data.token0]} and ${Number(formatEther(amount1)).toFixed(2)}${Tokens[data.token1]}`,
      );
      navigate("/ExplorePools");
    }
  }, [isSuccess]);

  if (!enabled) return null;
  if (isLoading) return <div>Loading {address}...</div>;
  if (isError) return <div>Error loading {address}</div>;

  return (
    <div className="p-[80px] pb-[70px]">
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
          <div className="flex gap-[48px]">
            <div className="flex flex-col gap-[20px] min-w-[800px]">
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
            <div className="w-full flex flex-col justify-between">
              <div className="flex flex-col bg-white/10 py-[6px] px-[12px] rounded-xl gap-[10px]">
                <p className="text-[24px]">Pool Info</p>
                <div className="flex flex-col gap-[3px]">
                  <p>Pool swap Fee : {data.fee}%</p>
                  <div className="flex items-center gap-[8px]">
                    <img
                      src={`../../public/tokens/${Tokens[data.token0]}.svg`}
                      alt=""
                      className="w-[18px]"
                    />
                    <p>
                      {Tokens[data.token0]} tokens:{" "}
                      {reserveToken0
                        ? Number(formatEther(reserveToken0)).toFixed(2)
                        : 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <img
                      src={`../../public/tokens/${Tokens[data.token1]}.svg`}
                      alt=""
                      className="w-[18px]"
                    />
                    <p>
                      {Tokens[data.token1]} tokens:{" "}
                      {reserveToken1
                        ? Number(formatEther(reserveToken1)).toFixed(2)
                        : 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col bg-white/10 py-[6px] px-[12px] rounded-xl gap-[10px]">
                <p className="text-[24px]">Summary</p>
                <div className="flex flex-col gap-[3px]">
                  <div className="flex items-center gap-[8px]">
                    <img
                      src={`../../public/tokens/${Tokens[data.token0]}.svg`}
                      alt=""
                      className="w-[18px]"
                    />
                    <p>
                      {Tokens[data.token0]} tokens: {amount0 ? amount0 : 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <img
                      src={`../../public/tokens/${Tokens[data.token1]}.svg`}
                      alt=""
                      className="w-[18px]"
                    />
                    <p>
                      {Tokens[data.token1]} tokens: {amount1 ? amount1 : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
                className="bg-pink-500 flex justify-center items-center w-[150px] px-[15px] h-[42px] py-[5px] cursor-pointer rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <img src={lock} alt="" className="w-[24px]" />
                ) : (
                  "create position"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityPage;
