import { useParams } from "react-router-dom";
import SelectSwap from "../components/SelectSwap";
import PoolSwap from "../components/PoolSwap";

const SwapPage = () => {
  const { address } = useParams();
  if (address == "all") {
    return (
      <div>
        <SelectSwap address={address} />
      </div>
    );
  }
  return (
    <div>
      <PoolSwap address={address} />
    </div>
  );
};

export default SwapPage;
