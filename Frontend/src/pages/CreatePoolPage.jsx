import { useCreatePool } from "../hooks/poolFactory";
import PoolFactoryAddress from "../abi/LiquidityPoolFactoryAddresses.json";
import { useChainId } from "wagmi";
import { useState } from "react";
import TokenDropDown from "../components/low-level/TokenDropDown";
import PoolCard from "../components/low-level/PoolCard";
import TokenName from "../abi/tokenAddressToName.json";
import { formatEther } from "viem";

const CreatePoolPage = () => {
  const cardano = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  const matic = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  // const solana;
  // const usdc;
  const chainId = useChainId();
  const factoryAddress = PoolFactoryAddress[chainId];

  const Tokens = Object.fromEntries(
    Object.entries(TokenName).map(([name, addr]) => [addr, name]),
  );

  const { createPool } = useCreatePool(factoryAddress);

  const [token0, setToken0] = useState("cardano");
  const [token1, setToken1] = useState("matic");
  const [fee, setFee] = useState(0n);

  const [token0IsOpen, setToken0IsOpen] = useState(false);
  const [token1IsOpen, setToken1IsOpen] = useState(false);

  const [showError, setShowError] = useState(false);

  return (
    <div className="flex flex-col gap-[50px] p-[80px]">
      <div>
        <p className="text-5xl">Create pool</p>
      </div>
      <div className="flex gap-[100px] bg-black p-[30px] rounded-xl">
        <div className="flex flex-col gap-[30px] min-w-[500px] min-h-[300px]">
          <p className="text-3xl">Select Token Pair</p>
          <div className="flex flex-col gap-[50px]">
            <div className="flex gap-[20px]">
              <TokenDropDown
                token={token0}
                otherToken={token1}
                setToken={setToken0}
                isOpen={token0IsOpen}
                setOpen={setToken0IsOpen}
                setShowError={setShowError}
              />
              <TokenDropDown
                token={token1}
                otherToken={token0}
                setToken={setToken1}
                isOpen={token1IsOpen}
                setOpen={setToken1IsOpen}
                setShowError={setShowError}
              />
              {showError && (
                <p className="text-red-800">
                  *Tokens in the liquidity pool cannot be the same
                </p>
              )}
            </div>
            <div className="flex gap-[20px] items-center">
              <p className="text-[20px] font-semibold">Fee :</p>
              <input
                type="number"
                inputMode="decimal"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="bg-gray-800 px-[24px] py-[10px] rounded-[10px]"
              />
            </div>
            {fee > 0 && (
              <div>
                <PoolCard tokens={[token0, token1]} fee={fee} />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-[60px]">
          <div className="flex flex-col gap-[10px]">
            <p className="text-xl">Pool Summary</p>
            <div className="font-light text-gray-400">
              <p>token 1 : {token0}</p>
              <p>token 2 : {token1}</p>
              <p>fee : {fee}</p>
            </div>
          </div>
          <div>
            <button
              onClick={() =>
                createPool(TokenName[token0], TokenName[token1], fee)
              }
              className="bg-blue-700 px-[15px] py-[5px] cursor-pointer rounded-xl"
            >
              create pool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePoolPage;
