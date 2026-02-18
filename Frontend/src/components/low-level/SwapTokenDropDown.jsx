import arrow from "../../assets/arrow.svg";

const SwapTokenDropDown = ({
  tokens,
  token,
  setToken,
  isOpen,
  setIsOpen
}) => {
  return (
    <div>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-[200px] h-[50px] justify-between gap-[12px] items-center cursor-pointer rounded-[8px] border-[2px] border-gray-500 px-[24px] py-[10px] ${isOpen ? "border-b-0 rounded-b-none" : ""} ${token?"":"bg-pink-500"}`}
      >
        <div className="flex items-center gap-[6px]">
          <img
            src={`../public/tokens/${token}.svg`}
            alt=""
            className="w-[20px]"
          />
          <p className="text-[20px]">{token?token:"select"}</p>
        </div>
        <img
          src={arrow}
          alt=""
          className={`w-[15px] transition duration-150 ${isOpen ? "rotate-90" : ""}`}
        />
      </div>
      {isOpen && (
        <div className="absolute border-[2px] w-[200px] border-t-0 border-gray-500 transition duration-150">
          {tokens?.map((Token) => (
            <div
              onClick={() => setToken(Token)}
              className="flex bg-gray-800 border-[2px] border-gray-900 gap-[12px] items-center cursor-pointer px-[24px] py-[10px]"
            >
              <img
                src={`../public/tokens/${Token}.svg`}
                alt=""
                className="w-[20px]"
              />
              <p>{Token}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SwapTokenDropDown;
