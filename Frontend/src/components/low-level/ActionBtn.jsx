const ActionBtn = ({ text, action }) => {
  return (
    <div
      onClick={() => action()}
      className="flex gap-[10px] w-[100px] justify-center items-center cursor-pointer bg-pink-500 px-[18px] py-[5px] rounded-full"
    >
      <p>{text}</p>
    </div>
  );
};

export default ActionBtn;
