"use client";

import Image from "next/image";

const BlurScreen = ({ header = "Lorem ipsum dolo sit amen", text = "This will only take a few seconds.." }) => {
  return (
    <div className="flex flex-col items-center justify-center fixed inset-0 z-50 bg-transparent bg-opacity-70 backdrop-filter backdrop-blur-md">
      <div className="flex flex-col items-center justify-center text-center gap-9">
        <Image
          alt="dish"
          src="/images/dish.svg"
          width={200}
          height={200}
          className="animate-expand" // Apply expanding animation to the image
        />
        <div className="flex flex-col gap-2 text-gray">
          <h3 className="font-semibold text-[1.2rem] animate-expand">
            {header}
          </h3>
          <p className="text">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default BlurScreen;
