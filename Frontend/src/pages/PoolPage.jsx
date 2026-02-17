import { formatEther, isAddress } from "viem";
import { useChainId } from "wagmi";
import { useParams } from "react-router-dom";
import { getReverseTokens, shorten } from "../utils/utils";
import TokenName from "../abi/tokenAddressToName.json";
import PoolFactoryAddresses from "../abi/LiquidityPoolFactoryAddresses.json";
import { useGetPoolInfoWithPoolAddress } from "../hooks/poolFactory";
import arrow from "../assets/arrow.svg";
import { useGetPoolLiquidity, useGetTokenReserve } from "../hooks/pool";
import swap from "../assets/swap.svg";
import plus from "../assets/plus.svg";
import Btn from "../components/low-level/Btn";

const PoolPage = () => {
  const { address } = useParams();

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
    <div className="p-[80px] max-w-[800px]">
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
          <p className="text-2xl">Stats</p>
          <div className="flex  justify-between">
            <div className="flex flex-col gap-[3px]">
              <p className="text-xl">Balances</p>
              <p>
                {Tokens[data.token0]} :{" "}
                {reserveToken0
                  ? Number(formatEther(reserveToken0)).toFixed(2)
                  : null}
              </p>
              <p>
                {Tokens[data.token1]} :{" "}
                {reserveToken1
                  ? Number(formatEther(reserveToken1)).toFixed(2)
                  : null}
              </p>
            </div>
            <div className="flex flex-col gap-[3px]">
              <p className="text-xl">TVL</p>
              <p>${Number(formatEther(liquidity?.toString())).toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-[3px]">
              <p className="text-xl">Fee</p>
              <p>{data.fee} Tokens</p>
            </div>
          </div>
        </div>
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
  );
};

export default PoolPage;
