import { useChainId } from "wagmi";
import { getReverseTokens } from "../utils/utils";
import TokenName from "../abi/tokenAddressToName.json";
import PoolFactoryAddresses from "../abi/LiquidityPoolFactoryAddresses.json";
import { isAddress } from "viem";
import { useGetPoolLiquidity } from "../hooks/pool";
import { useGetPoolInfoWithPoolAddress } from "../hooks/poolFactory";
import arrow from "../assets/arrow.svg";
import { shorten } from "../utils/utils";
import Input from "./low-level/input";

const PoolSwap = ({ address }) => {
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
      </div>
      <div className="flex flex-col gap-[30px]">
        <div>
          <p className="text-2xl">Swap tokens</p>
        </div>
        <div className="flex flex-col gap-[20px] max-w-[800px]">
          <Input
            token={Tokens[data.token0]}
            max={20}
            amount={0}
            setAmount={0}
          />
          <Input
            token={Tokens[data.token1]}
            max={20}
            amount={0}
            setAmount={0}
          />
        </div>
        <div>
          <p>Pool swap Fee : {data.fee} ETH</p>
          <p>
            {Tokens[data.token0]} amount: 
          </p>
          <p>
            {Tokens[data.token1]} amount:
          </p>
        </div>
        <div>
          <div>
            <button className="bg-blue-700 px-[15px] py-[5px] cursor-pointer rounded-xl">
              swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolSwap;
