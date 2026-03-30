import Taskcard from "./Taskcard";
import swap from "../assets/swap.svg";
import pool from "../assets/pool.svg";
import liquidity from "../assets/liquidity.svg";

const Taskbar = () => {
  return (
    <div className="flex justify-around">
      <div className="animate-shift-1">
        <Taskcard
          img={swap}
          taskTitle="Swap"
          taskDescription="swap tokens with ease with low fees"
        />
      </div>
      <div className="animate-shift-2">
        <Taskcard
          img={pool}
          taskTitle="Create Pool"
          taskDescription="Create a Pool for a Pair of tokens"
        />
      </div>
      <div className="animate-shift-3">
        <Taskcard
          img={liquidity}
          taskTitle="Liquidity"
          taskDescription="Add liquidity to liquidity pools and earn intrest"
        />
      </div>
    </div>
  );
};

export default Taskbar;
