import { useState } from "react";
import LiquidityPool from "../abi/LiquidityPool.json";
import {
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi } from "viem";
import { useAccount } from "wagmi";

export function useGetPoolLiquidity(poolAddress, watch = true) {
  const result = useReadContract({
    address: poolAddress,
    abi: LiquidityPool,
    functionName: "getPoolLiquidity",
    query: {
      enabled: !!poolAddress,
      refetchInterval: watch ? 3000 : false,
    },
  });

  return {
    liquidity: result.data ?? null,
    isLoadingLiquidity: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}

export function useGetTokenReserve(poolAddress, tokenAddress, watch = true) {
  const result = useReadContract({
    address: poolAddress,
    abi: LiquidityPool,
    functionName: "getReserveOfToken",
    args: [tokenAddress],
    query: {
      enabled: !!poolAddress,
      refetchInterval: watch ? 3000 : false,
    },
  });

  return {
    reserve: result.data ?? null,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}

export function useAddLiquidity(poolAddress, token0Address, token1Address) {
  const [hash, setHash] = useState(null);

  const { address: user } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const addLiquidity = async (amount0, amount1) => {
    if (!user || !token0Address || !token1Address) return;

    // ✅ Read allowance properly
    const allowance0 = await publicClient.readContract({
      address: token0Address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [user, poolAddress],
    });

    if (allowance0 < amount0) {
      await writeContractAsync({
        address: token0Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [poolAddress, amount0],
      });
    }

    const allowance1 = await publicClient.readContract({
      address: token1Address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [user, poolAddress],
    });

    if (allowance1 < amount1) {
      await writeContractAsync({
        address: token1Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [poolAddress, amount1],
      });
    }

    const txHash = await writeContractAsync({
      address: poolAddress,
      abi: LiquidityPool,
      functionName: "addLiquidity",
      args: [amount0, amount1],
    });

    setHash(txHash);
  };

  return {
    addLiquidity,
    isPending,
    isConfirming,
    isSuccess,
  };
}

export function useGetLiquidityTokenTotalSupply(poolAddress, watch = true) {
  const result = useReadContract({
    address: poolAddress,
    abi: LiquidityPool,
    functionName: "totalSupply",
    args: [],
    query: {
      enabled: !!poolAddress,
      refetchInterval: watch ? 3000 : false,
    },
  });

  return {
    supply: result.data ?? null,
    isLoadingSupply: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}

import { isAddress } from "viem";

export function useGetLiquidityTokenOfUser(poolAddress, userAddress) {
  const enabled =
    Boolean(poolAddress && userAddress) &&
    isAddress(poolAddress) &&
    isAddress(userAddress);

  const result = useReadContract({
    address: poolAddress,
    abi: LiquidityPool,
    functionName: "balanceOf",
    args: [userAddress],
    query: {
      enabled,
    },
  });

  return {
    balance: result.data ?? null,
    isLoadingBalance: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}

export function useRemoveLiquidity(poolAddress) {
  const [hash, setHash] = useState(null);

  const { address: user } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const removeLiquidity = async (userLPTokens) => {
    if (!user) return;

    const txHash = await writeContractAsync({
      address: poolAddress,
      abi: LiquidityPool,
      functionName: "removeLiquidity",
      args: [userLPTokens],
    });

    setHash(txHash);
  };

  return {
    removeLiquidity,
    isConfirming,
    isSuccess,
  };
}

export function useSwap(poolAddress) {
  const [hash, setHash] = useState(null);

  const { address: user } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const swap = async (tokenIn, amountIn) => {
    if (!tokenIn || !amountIn) return;

    const allowance0 = await publicClient.readContract({
      address: tokenIn,
      abi: erc20Abi,
      functionName: "allowance",
      args: [user, poolAddress],
    });

    if (allowance0 < amountIn) {
      await writeContractAsync({
        address: tokenIn,
        abi: erc20Abi,
        functionName: "approve",
        args: [poolAddress, amountIn],
      });
    }

    const txHash = await writeContractAsync({
      address: poolAddress,
      abi: LiquidityPool,
      functionName: "swap",
      args: [tokenIn, amountIn],
    });

    setHash(txHash);
  };

  return {
    swap,
    isConfirming,
    isSuccess,
  };
}
