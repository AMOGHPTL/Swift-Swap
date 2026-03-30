import { formatEther, isAddress } from "viem";
import { useChainId } from "wagmi";
import { useNavigate, useParams } from "react-router-dom";
import { getReverseTokens, shorten } from "../utils/utils";
import TokenName from "../abi/tokenAddressToName.json";
import PoolFactoryAddresses from "../abi/LiquidityPoolFactoryAddresses.json";
import { useGetPoolInfoWithPoolAddress } from "../hooks/poolFactory";
import arrow from "../assets/arrow.svg";
import { useGetPoolLiquidity, useGetTokenReserve } from "../hooks/pool";
import swap from "../assets/swap.svg";
import plus from "../assets/plus.svg";
import Btn from "../components/low-level/Btn";
import Balancer from "../components/low-level/Balancer";

const PoolPage = () => {
  const { address } = useParams();

  const navigate = useNavigate();

  const Tokens = getReverseTokens(TokenName);
  const chainId = useChainId();
  const factoryAddress = PoolFactoryAddresses[chainId];

  const enabled = Boolean(factoryAddress && address && isAddress(address));

  const { liquidity, isLoadingLiquidity, error, refetch } =
    useGetPoolLiquidity(address);

  const { data, isLoading, isError } = useGetPoolInfoWithPoolAddress(
    factoryAddress,
    address,
    enabled,
  );

  const reserveToken0 = useGetTokenReserve(address, data?.token0).reserve;
  const reserveToken1 = useGetTokenReserve(address, data?.token1).reserve;

  if (!enabled) return null;
  if (isLoading || isLoadingLiquidity) return <div>Loading {address}...</div>;
  if (isError) return <div>Error loading {address}</div>;

  return (
    <div className="p-[80px]">
      <div
        onClick={() => navigate("/ExplorePools")}
        className="flex items-center gap-[10px] cursor-pointer"
      >
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
        <div className="flex flex-col bg-black rounded-3xl gap-[60px]">
          <div className="flex flex-col gap-[30px]">
            <div className="grid items-center gap-[24px] grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
              <div className="flex flex-col gap-[6px]">
                <p className="text-2xl">{Tokens[data.token0]} </p>
                <p>
                  {reserveToken0
                    ? `$${Number(formatEther(reserveToken0)).toFixed(2)}`
                    : "$0.00"}
                </p>
              </div>
              <div className="w-[1px] h-[36px] bg-white/20" />
              <div className="flex flex-col gap-[6px]">
                <p className="text-2xl"> {Tokens[data.token1]} </p>{" "}
                <p>
                  {reserveToken1
                    ? `$${Number(formatEther(reserveToken1)).toFixed(2)}`
                    : "$0.00"}
                </p>
              </div>
              <div className="w-[1px] h-[36px] bg-white/20" />

              <div className="flex flex-col gap-[6px]">
                <p className="text-2xl">TVL</p>
                <p>${Number(formatEther(liquidity?.toString())).toFixed(2)}</p>
              </div>
              <div className="w-[1px] h-[36px] bg-white/20" />

              <div className="flex flex-col gap-[6px]">
                <p className="text-2xl">Fee</p>
                <p>{data.fee}%</p>
              </div>
            </div>
          </div>
          {reserveToken0 > 0n && reserveToken1 > 0n && (
            <div className="bg-white/10 p-[12px] rounded-xl grid grid-cols-[1fr_1fr]">
              <Balancer
                token0={Tokens[data.token0]}
                token1={Tokens[data.token1]}
                token0Price={1n}
                token1Price={1n}
                token0Amount={reserveToken0 || 1}
                token1Amount={reserveToken1 || 1}
                tvl={liquidity}
              />
              <div className="flex ml-[64px] pl-[64px] flex-col gap-[16px] border-l-[1px] border-gray-700">
                <p className="text-[24px]">Oracle Price</p>
                <div className="flex items-center gap-[24px]">
                  <div className="flex items-center gap-[4px]">
                    <img
                      src={`../../public/tokens/${Tokens[data.token0]}.svg`}
                      alt=""
                      className="w-[24px]"
                    />
                    <p className="text-[16px]">
                      {Tokens[data.token0]} - ${1}
                    </p>
                  </div>
                  <div className="flex items-center gap-[4px]">
                    <img
                      src={`../../public/tokens/${Tokens[data.token1]}.svg`}
                      alt=""
                      className="w-[24px]"
                    />
                    <p className="text-[16px]">
                      {Tokens[data.token1]} - ${1}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-[50px]">
            <Btn
              img={swap}
              text="swap"
              to="Swap"
              poolAddress={address}
              disabled={formatEther(liquidity?.toString()) == 0}
            />
            <Btn
              img={plus}
              text="add liquidity"
              to="Liquidity"
              poolAddress={address}
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolPage;
