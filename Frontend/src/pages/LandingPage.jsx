import Header from "../components/Header";
import Taskbar from "../components/Taskbar";
import logo from "../assets/symbol.svg";

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center gap-[120px] px-[80px] py-[60px]">
      <div className="max-w-3xl">
        <Header
        logo={logo}
          heading="Swift-Swap"
          subheading="Decentralized Exchanges made Simple - create pools, add liquidity and swap tokens all at one place"
        />
      </div>
      <div className="w-full">
        <Taskbar />
      </div>
    </div>
  );
};

export default LandingPage;
