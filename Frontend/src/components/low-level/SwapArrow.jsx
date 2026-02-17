import arrow from "../../assets/arrow.svg";

const SwapArrow = ({action}) => {
  return (
    <div onClick={()=>action()} className="absolute cursor-pointer right-[46%] top-[43%] flex w-fit justify-between items-center p-[10px] bg-gray-600 backdrop-blur-sm border-[5px] border-[#121212] rounded-[15px]">
      <img src={arrow} alt="" className="w-[20px]" />
    </div>
  );
};

export default SwapArrow;
