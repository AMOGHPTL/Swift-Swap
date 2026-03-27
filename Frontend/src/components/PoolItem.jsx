import { formatEther, isAddress } from "viem";
import { useChainId } from "wagmi";
import { useGetPoolInfoWithPoolAddress } from "../hooks/poolFactory";
import PoolFactoryAddresses from "../abi/LiquidityPoolFactoryAddresses.json";
import TokenName from "../abi/tokenAddressToName.json";
import { useNavigate } from "react-router-dom";
import { getReverseTokens } from "../utils/utils";
import { useGetPoolLiquidity } from "../hooks/pool";
import arrow from "../assets/arrow.svg";

const PoolItem = ({ address }) => {
  const chainId = useChainId();

  const navigate = useNavigate();

  const { liquidity, isLoadingLiquidity, error, refetch } =
    useGetPoolLiquidity(address);

  const Tokens = getReverseTokens(TokenName);

  const factoryAddress = PoolFactoryAddresses[chainId];

  const enabled = Boolean(factoryAddress && address && isAddress(address));

  const { data, isLoading, isError } = useGetPoolInfoWithPoolAddress(
    factoryAddress,
    address,
    enabled,
  );

  if (!enabled) return null;
  if (isLoading) return <div>Loading {address}...</div>;
  if (isError) return <div>Error loading {address}</div>;

  return (
    <div
      onClick={() => navigate(`/Pool/${address}`)}
      className="grid grid-cols-[50%_20%_20%_10%] items-center cursor-pointer bg-white/5 px-[16px] py-[18px] rounded-xl hover:bg-white/10"
    >
      <div className="flex items-center gap-[10px]">
        <div className="flex items-center gap-[10px] text-[24px]">
          <img
            src={`../public/tokens/${Tokens[data.token0]}.svg`}
            alt=""
            className="w-[24px]"
          />
          <p>{Tokens[data.token0]}</p>
        </div>
        <p className="text-[24px]">/</p>
        <div className="flex items-center gap-[10px] text-[24px]">
          <img
            src={`../public/tokens/${Tokens[data.token1]}.svg`}
            alt=""
            className="w-[24px]"
          />
          <p>{Tokens[data.token1]}</p>
        </div>
      </div>
      <div>{data.fee}%</div>
      <div>${liquidity ? Number(formatEther(liquidity)).toFixed(2) : 0}</div>
      <div className="flex justify-end px-[10px]">
        <img src={arrow} alt="" className="w-[24px] rotate-[270deg]" />
      </div>
    </div>
  );
};

export default PoolItem;
