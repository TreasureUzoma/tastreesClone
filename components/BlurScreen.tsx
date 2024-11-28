"use client";

import Image from "next/image";

const BlurScreen = ({ header = "Lorem ipsum dolo sit amen", text = "This will only take a few seconds.." }) => {
  return (
    <div className="flex flex-col items-center justify-center fixed inset-0 z-50 bg-transparent bg-opacity-70 backdrop-filter backdrop-blur-md">
      <div className="flex flex-col items-center justify-center text-center gap-9">
        <Image
          alt="dish"
          src="/images/dish.svg"
          width={255}
          height={255}
          className="animate-expand" // Apply expanding animation to the image
        />
        <div className="flex flex-col gap-2 text-gray text-center items-center justify-center">
          <h3 className="w-[91%] md:w-[90%] max-w-[680px] font-semibold text-[0.93rem]">
            {header}
          </h3>
          <p className="w-[91%] md:w-[90%] max-w-[680px] text-[0.74rem]">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default BlurScreen;
