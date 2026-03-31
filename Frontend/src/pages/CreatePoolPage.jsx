import { useCreatePool } from "../hooks/poolFactory";
import PoolFactoryAddress from "../abi/LiquidityPoolFactoryAddresses.json";
import { useChainId } from "wagmi";
import { useEffect, useRef, useState } from "react";
import TokenDropDown from "../components/low-level/TokenDropDown";
import PoolCard from "../components/low-level/PoolCard";
import TokenName from "../abi/tokenAddressToName.json";
import lock from "../assets/lock.svg";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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

  const { createPool, isPending, isSuccess } = useCreatePool(factoryAddress);

  const [token0, setToken0] = useState("usdc");
  const [token1, setToken1] = useState("usdt");
  const [fee, setFee] = useState(0n);

  const [token0IsOpen, setToken0IsOpen] = useState(false);
  const [token1IsOpen, setToken1IsOpen] = useState(false);

  const [showError, setShowError] = useState(false);

  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isSuccess) {
      toast.success(`Pool ${token0}/${token1} created`);
      navigate("/ExplorePools");
    }
  }, [isSuccess]);

  useEffect(() => {
    setShowError(false);
  }, [token0IsOpen, token1IsOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setToken0IsOpen(false);
        setToken1IsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-[50px] p-[80px]">
      <div>
        <p className="text-5xl">Create pool</p>
      </div>
      <div className="grid grid-cols-[1fr_1fr] bg-white/5 p-[30px] rounded-xl">
        <div className="flex flex-col gap-[30px]">
          <p className="text-3xl">Select Token Pair</p>
          <div className="flex flex-col gap-[30px]">
            <div ref={dropdownRef} className="flex flex-col gap-[20px]">
              {showError && (
                <p className="text-red-800">
                  *Tokens in the liquidity pool cannot be the same
                </p>
              )}
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
              </div>
            </div>
            <div className="flex gap-[20px] items-center">
              <p className="text-[20px] font-semibold">Fee percent % :</p>
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
            <p className="text-3xl">Pool Summary</p>
            <div className="font-light text-gray-400">
              <p className="text-[20px]">token 1 : {token0}</p>
              <p className="text-[20px]">token 2 : {token1}</p>
              <p className="text-[20px]">fee : {fee ? `${fee}%` : ""}</p>
            </div>
          </div>
          <div>
            <button
              disabled={isPending || fee == 0n}
              onClick={() =>
                createPool(TokenName[token0], TokenName[token1], fee)
              }
              className={`bg-pink-500 h-[48px] w-[80%] flex items-center justify-center cursor-pointer rounded-xl disabled:bg-gray-600 disabled:cursor-not-allowed`}
            >
              {isPending ? (
                <img src={lock} alt="" className="w-[16px]" />
              ) : (
                "create pool"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePoolPage;
