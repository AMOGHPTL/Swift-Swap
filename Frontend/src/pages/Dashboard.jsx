import { useState } from "react";
import { useChainId } from "wagmi";
import poolFactoryAddresses from "../abi/LiquidityPoolFactoryAddresses.json";
import { useGetPools } from "../hooks/poolFactory";
import MyPositions from "../components/MyPositions";

const DashBoard = () => {
  const [hasAnyPostions, setHasAnyPosition] = useState(false);
  const chainId = useChainId();
  console.log("chainId:", chainId);

  const poolFactoryAddress = poolFactoryAddresses[chainId];
  const { pools, isLoading, isError } = useGetPools(poolFactoryAddress);

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
    <div className="flex flex-col p-[24px] rounded-xl gap-[20px]">
      <p className="text-[36px]">Positions</p>
      {hasAnyPostions ? (
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center justify-between">
          <p>Pool</p>
          <p>token-1</p>
          <p>token-2</p>
          <p>total</p>
          <p>Pool liquidity</p>
          <p>close</p>
        </div>
      ) : (
        <p className="text-[28px]">No positions found...</p>
      )}
      <div>
        {pools.map((address) => (
          <div>
            <MyPositions
              key={address}
              poolAddress={address}
              onHasPosition={(hasPosition) => {
                if (hasPosition) setHasAnyPosition(true);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashBoard;
