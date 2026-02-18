import LiquidityPoolFactory from "../abi/LiquidityPoolFactory.json";
import {useReadContract} from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";

export function useCreatePool(poolFactoryAddress) {
  console.log("triggered useCreatePool...")
  const [hash, setHash] = useState(null);

  const { writeContractAsync, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const createPool = async (token0, token1, fee) => {
    console.log("creating new pool...")
    const txHash = await writeContractAsync({
      address: poolFactoryAddress,
      abi: LiquidityPoolFactory,
      functionName: "createPool",
      args: [token0, token1, fee],
    });

    setHash(txHash);
  };

  return {
    createPool,
    isPending,
    isConfirming,
    isSuccess,
  };
}


export function useGetPools(poolFactoryAddress, watch=true) {
    console.log("calling useGetPools....")
    const result = useReadContract({
        address: poolFactoryAddress,
        abi: LiquidityPoolFactory,
        functionName: "getAllPools",
        args: [],
        query: {
          enabled: !!poolFactoryAddress,   // don't run if address missing
          refetchInterval: watch ? 3000 : false, // auto refresh every 3s (optional)
        },
    }) 

    const pools = result.data?result.data:null;

    return {
        pools,
        isLoading: result.isLoading,
        error: result.error,
        refetch: result.refetch
    }
}

export function useGetPoolInfoWithPoolAddress(
  poolFactoryAddress,
  poolAddress,
  watch = true
) {
  return useReadContract({
    address: poolFactoryAddress,
    abi: LiquidityPoolFactory,
    functionName: "getPoolWithAddress",
    args: [poolAddress],
    query: {
      enabled: !!poolFactoryAddress && !!poolAddress,
      refetchInterval: watch ? 3000 : false,
    },
  });
}

export function useGetTokenPair(
  poolFactoryAddress,
  tokenAddress,
  watch = true
){
  return useReadContract({
    address: poolFactoryAddress,
    abi: LiquidityPoolFactory,
    functionName: "getTokenPair",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!poolFactoryAddress && !!tokenAddress,
      refetchInterval: watch ? 3000 : false,
    },
  })
}

export function useGetTokenPairKeys(poolFactoryAddress, watch=true){
    return useReadContract({
    address: poolFactoryAddress,
    abi: LiquidityPoolFactory,
    functionName: "getTokenPairKeys",
    args: [],
    query: {
      enabled: !!poolFactoryAddress,
      refetchInterval: watch ? 3000 : false,
    },
  })
}

export function useGetPoolInfo(poolFactoryAddress, token0, token1, watch=true){
   return useReadContract({
    address: poolFactoryAddress,
    abi: LiquidityPoolFactory,
    functionName: "getPoolInfo",
    args: [token0, token1],
    query: {
      enabled: !!poolFactoryAddress && !!token0 && !!token1,
      refetchInterval: watch ? 3000 : false,
    },
  })
}

