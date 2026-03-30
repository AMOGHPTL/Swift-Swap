const Taskcard = ({ img, taskTitle, taskDescription }) => {
  return (
    <div className="flex flex-col h-full gap-[20px] rounded-3xl items-center justify-center bg-pink-300 w-[300px] p-[30px] cursor-default transition duration-150 hover:scale-110 hover:bg-pink-500">
      <div className="flex flex-col items-center justify-center">
        <img src={img} alt="" className="w-[60px]" />
      </div>
      <div className="flex flex-col text-gray-900 font-semibold gap-[5px] items-center justify-center">
        <p className="text-[30px]">{taskTitle}</p>
        <p className="text-[15px]">{taskDescription}</p>
      </div>
    </div>
  );
};

export default Taskcard;
