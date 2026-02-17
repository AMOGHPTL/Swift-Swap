import { useAccount, useChainId } from "wagmi";
import {
  useGetLiquidityTokenOfUser,
  useGetLiquidityTokenTotalSupply,
  useGetPoolLiquidity,
  useGetTokenReserve,
  useRemoveLiquidity,
} from "../hooks/pool";
import { getReverseTokens } from "../utils/utils";
import TokenName from "../abi/tokenAddressToName.json";
import { useGetPoolInfoWithPoolAddress } from "../hooks/poolFactory";
import FactoryAddresses from "../abi/LiquidityPoolFactoryAddresses.json";
import { formatEther, isAddress } from "viem";
import ActionBtn from "./low-level/ActionBtn";

const MyPositions = ({ poolAddress }) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const factoryAddress = FactoryAddresses[chainId];

  const enabled = Boolean(factoryAddress && address && isAddress(address));

  const Tokens = getReverseTokens(TokenName);

  const closePosition = () => {};

  const { removeLiquidity } = useRemoveLiquidity(poolAddress);

  // -----------------------
  // LP Balance
  // -----------------------
  const { balance, isLoading: isLoadingBalance } = useGetLiquidityTokenOfUser(
    poolAddress,
    address,
  );

  // -----------------------
  // Total Supply
  // -----------------------
  const { supply, isLoading: isLoadingSupply } =
    useGetLiquidityTokenTotalSupply(poolAddress);

  const { liquidity, isLoadingLiquidity } = useGetPoolLiquidity(poolAddress);

  // -----------------------
  // Pool Info
  // -----------------------
  const { data, isLoading, isError } = useGetPoolInfoWithPoolAddress(
    factoryAddress,
    poolAddress,
    enabled,
  );

  // -----------------------
  // Reserves
  // -----------------------
  const { reserve: reserveToken0 } = useGetTokenReserve(
    poolAddress,
    data?.token0,
  );

  const { reserve: reserveToken1 } = useGetTokenReserve(
    poolAddress,
    data?.token1,
  );

  // -----------------------
  // 🔒 SAFE BIGINT NORMALIZATION
  // -----------------------
  const safeBalance =
    typeof balance === "bigint" ? balance : BigInt(balance ?? 0);

  const safeSupply = typeof supply === "bigint" ? supply : BigInt(supply ?? 0);

  const safeReserve0 =
    typeof reserveToken0 === "bigint"
      ? reserveToken0
      : BigInt(reserveToken0 ?? 0);

  const safeReserve1 =
    typeof reserveToken1 === "bigint"
      ? reserveToken1
      : BigInt(reserveToken1 ?? 0);

  const safeLiquidity =
    typeof liquidity === "bigint" ? liquidity : BigInt(liquidity ?? 0);

  // -----------------------
  // User Share Calculation
  // -----------------------
  let userShare0 = 0n;
  let userShare1 = 0n;
  let userShareTotal = 0n;

  if (safeSupply > 0n && safeBalance > 0n) {
    userShare0 = (safeBalance * safeReserve0) / safeSupply;
    userShare1 = (safeBalance * safeReserve1) / safeSupply;
    userShareTotal = (safeBalance * safeLiquidity) / safeSupply;
  }

  // -----------------------
  // Loading Guards
  // -----------------------
  if (
    isLoadingBalance ||
    isLoadingSupply ||
    isLoading ||
    isLoadingLiquidity ||
    isError ||
    safeBalance === 0n ||
    !data
  ) {
    return null;
  }

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] mb-[10px] items-center cursor-pointer bg-gray-900 px-[12px] py-[6px] rounded-xl">
      {/* Token Pair */}
      <div className="flex items-center gap-[10px]">
        <div className="flex items-center gap-[10px] text-[24px]">
          <img
            src={`/tokens/${Tokens[data.token0]}.svg`}
            alt=""
            className="w-[24px]"
          />
          <p>{Tokens[data.token0]}</p>
        </div>

        <p className="text-[24px]">/</p>

        <div className="flex items-center gap-[10px] text-[24px]">
          <img
            src={`/tokens/${Tokens[data.token1]}.svg`}
            alt=""
            className="w-[24px]"
          />
          <p>{Tokens[data.token1]}</p>
        </div>
      </div>

      {/* User Share Token0 */}
      <div>${Number(formatEther(userShare0)).toFixed(2)}</div>

      {/* User Share Token1 */}
      <div>${Number(formatEther(userShare1)).toFixed(2)}</div>

      <div>${Number(formatEther(userShareTotal)).toFixed(2)}</div>
      <div>${Number(formatEther(liquidity)).toFixed(2)}</div>
      <div className="w-fit items-end">
        <ActionBtn text="close" action={() => removeLiquidity(balance)} />
      </div>
    </div>
  );
};

export default MyPositions;
