"use client";

import BlurScreen from "./BlurScreen";
import Fork from "./Fork";
import UploadIcon from "./icons/UploadIcon";
import ReplyUi from "./ReplyUi";
import { useUtils } from "@/hooks/use-utils";

const Main = () => {
  const {
    currentWord,
    fade,
    isLoading,
    reply,
    files,
    responseContent,
    youtubeLink,
    currentBlurMessage,
    handleFileChange,
    handleButtonClick,
  } = useUtils();

  return reply ? (
    <ReplyUi
      fileSize={files[0]?.size?.toString() || "0"}
      contents={responseContent}
      youtubeLink={youtubeLink}
      fileName={files[0]?.name || ""}
    />
  ) : (
    <div className="text-center mt-[8rem] md:mt-[9.4rem] flex items-center justify-center flex-col gap-6">
      {isLoading && (
        <BlurScreen
          header={currentBlurMessage}
          text="Sit tight, we're working on your recipe!"
        />
      )}

      <Fork />

      <h1 className="font-[800] text-[1.85rem] leading-[2rem] md:text-5xl text-darkblue tracking-[-2.4px] w-[90%] max-w-[600px]">
        What&#39;s For{" "}
        <mark
          className={`bg-transparent text-purple transition-opacity duration-500 inline-block ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          {currentWord}
        </mark>{" "}
        <br className="sm:hidden" />
        Let Our AI Assist In The Prep
      </h1>

      <p className="text-gray w-[88%] md:w-[70%] tracking-[-0.2px] text-[0.9rem] md:text-[0.97rem] max-w-[680px]">
        Share photos of the dish you plan to make or its ingredients, and Tastrees
        would create the perfect recipe for you instantly.
      </p>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-[#fbfbfb] border border-purple mt-1 border-opacity-10 py-1 px-2 flex gap-2 items-center justify-between w-[88%] md:w-[70%] max-w-[600px] rounded-full"
      >
        <label
          htmlFor="upload"
          className="select-none bg-white shadow-sm w-[72%] overflow-hidden text-left tracking-[0px] font-[300] py-2 md:py-4 px-5 rounded-full flex items-center justify-start text-gray text-[0.7rem] gap-2 cursor-pointer"
        >
          {files.length > 0 ? (
            <span className="flex items-center justify-center gap-2">
              <span className="text-[1.2rem] font-thin">&times;</span>
              {files.map((file, index) => (
                <span
                  key={index}
                  className="inline text-purple w-[60%] md:max-w-[250px]"
                >
                  {file.name.length > 8
                    ? `${file.name.slice(0, 10)}...`
                    : file.name}
                </span>
              ))}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <UploadIcon />
              <span>Upload Image(s) | 5MB max</span>
            </span>
          )}
        </label>

        <input
          id="upload"
          type="file"
          accept=".png,.jpeg,.jpg,.heic,.webp,.heif"
          multiple
          hidden
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={handleButtonClick}
          className={`bg-purple text-[0.77rem] border-4 border-double text-white px-8 py-2 rounded-full ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Generate Recipe"}
        </button>
      </form>
    </div>
  );
}
export default Main;
