import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
  return (
    <div className="flex text-gray-400 justify-between py-[12px] px-[30px] ">
      <div className="flex items-center gap-[20px]">
        <img src={logo} alt="" className="w-[60px] " />
      </div>
      <div className="flex gap-[40px] items-center">
        <Link to="/">Home</Link>
        <Link to="/Dashboard">Dashboard</Link>
        <Link to="/Swap/all">Swap</Link>
        <Link to="/ExplorePools">Explore Pools</Link>
        <Link to="/CreatePool">create pool</Link>
      </div>
      <div className="h-[60px] w-fit flex items-center">
        <ConnectButton />
      </div>
    </div>
  );
};

export default Navbar;
