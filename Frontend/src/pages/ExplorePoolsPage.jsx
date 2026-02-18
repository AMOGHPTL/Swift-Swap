import { useChainId } from "wagmi";
import { useGetPools } from "../hooks/poolFactory";
import poolFactoryAddresses from "../abi/LiquidityPoolFactoryAddresses.json";
import PoolItem from "../components/PoolItem";
import MyPositions from "../components/MyPositions";
import {
  useGetLiquidityTokenOfUser,
  useGetLiquidityTokenTotalSupply,
} from "../hooks/pool";

const ExplorePoolsPage = () => {
  const chainId = useChainId();
  console.log("chainId:", chainId);

  const poolFactoryAddress = poolFactoryAddresses[chainId];

  const { pools, isLoading, isError } = useGetPools(poolFactoryAddress);

  // const userLiquidityBalance = useGetLiquidityTokenOfUser()

  if (!poolFactoryAddress)
    return <div>Factory not deployed on this network</div>;

  if (isLoading)
    return (
      <div className="p-[80px]">
        <p className="text-3xl">Loading pools...</p>
      </div>
    );

  if (isError)
    return (
      <div className="p-[80px]">
        <p className="text-3xl">Error fetching pools</p>
      </div>
    );

  if (!pools?.length)
    return (
      <div className="p-[80px]">
        <p className="text-3xl">No pools found.....</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-[30px] p-[80px]">
      <h1 className="text-5xl">Pools</h1>

      <div className="flex flex-col bg-black p-[24px] rounded-xl gap-[20px]">
        <p>Your Positions</p>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center justify-between">
          <p>Pool</p>
          <p>token-1</p>
          <p>token-2</p>
          <p>total</p>
          <p>close</p>
          <p>Pool liquidity</p>
        </div>
        <div>
          {pools.map((address) => (
            <div>
              <MyPositions key={address} poolAddress={address} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col max-w-[800px] bg-black p-[24px] rounded-xl gap-[20px]">
        <div className="grid grid-cols-[50%_25%_25%] items-center justify-between">
          <p>Pool</p>
          <p>Fee</p>
          <p>TVL</p>
        </div>
        {pools.map((address) => (
          <div>
            <PoolItem key={address} address={address} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExplorePoolsPage;
