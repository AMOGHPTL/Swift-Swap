const Header = ({ heading, subheading, logo}) => {
  return (
    <div className="flex flex-col w-full items-center justify-items-center gap-[10px] text-white">
      <div className="flex items-center gap-[16px]">
        <img src={logo} alt="" className="w-[44px] animate-spin-180"/>
        <p className="text-[45px] font-semibold text-center">{heading}</p>
      </div>
      <p className="text-[20px] text-center">{subheading}</p>
    </div>
  );
};

export default Header;
