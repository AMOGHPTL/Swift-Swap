import { useNavigate } from "react-router-dom";

const Btn = ({ img, text, to, poolAddress, disabled }) => {
  const navigate = useNavigate();

  return (
    <button
      disabled={disabled}
      onClick={() => navigate(`/${to}/${poolAddress}`)}
      className="flex gap-[10px] items-center cursor-pointer bg-pink-500 px-[18px] py-[8px] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <img src={img} alt="" className="w-[18px]" />
      <p>{text}</p>
    </button>
  );
};

export default Btn;
