import UploadIcon from "./icons/UploadIcon";
import CopySvg from "./icons/CopySvg";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import ReactMarkdown from "react-markdown"
import jsPDF from "jspdf";

// Helper function to format file size
const formatFileSize = (fileSize: string) => {
  const sizeInBytes = parseInt(fileSize, 10); // Convert size to a number
  if (isNaN(sizeInBytes)) return "0 KB"; // If size is invalid, return 0 KB

  if (sizeInBytes < 1024) {
    return `${sizeInBytes} bytes`; // Display bytes if less than 1KB
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`; // Display KB if less than 1MB
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`; // Display MB if greater than 1MB
  }
};
const ReplyUi = ({ fileName = "", fileSize = "", contents = "", youtubeLink = "" }) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contents);
      toast({
        description: "Copied to clipboard.",
      });
    }
    catch {
      toast({
        description: "Failed to copy to clipboard.",
      });
    }
  }

  const handleDownload = () => {
    const doc = new jsPDF();

    doc.text(contents, 10, 10)
    doc.save("recipe.pdf")
  }

  // Format the file size to KB or MB
  const formattedFileSize = formatFileSize(fileSize);

  return (
    <div className="mt-[4rem] py-[2rem] md:mt-[9.4rem] overflow-y-auto flex flex-col items-center justify-center z-30 bg-white gap-10">
      <div className="p-4 rounded-2xl bg-[rgba(96,58,171,0.03)] flex items-center justify-center w-[92%] max-w-[600px]">
        <div className="w-full flex items-start justify-center gap-4">
          <span className="rounded-full p-1 bg-white border border-gray flex items-center justify-center shadow-md">
            <Image
              src="/images/avatar.svg"
              alt="Avatar"
              width={18}
              height={18}
              className="object-contain"
            />
          </span>
          <div className="p-5 rounded-2xl bg-white w-[85%] flex flex-col text-left text-gray">
            <div className="flex justify-end">
              <Image
                src="/images/checkboxbase.svg"
                alt="Checkbox"
                width={17}
                height={17}
                className=""
              />
            </div>
            <p className="font-medium font-onest text-sm">{fileName}</p>
            <p className="text-[0.65rem] font-onest">{formattedFileSize}</p>
          </div>
        </div>
      </div>
      <div className="w-[92%] px-3 rounded-lg py-8 max-w-[600px] shadow-[0_1px_3px_rgba(180,180,180,0.2)] flex flex-col gap-11">
        <ReactMarkdown className="text-[0.9rem] font-onest text-left pre-wrap">
          {contents.replace(/\n/gi, '&nbsp;\n\n')}
        </ReactMarkdown>
        {youtubeLink && (
          <iframe
            width="100%"
            height="100"
            src={youtubeLink}
            title="Youtube Video"
            allowFullScreen
            frameBorder="0"
            className="bg-transparent border-none rounded-xl shadow-sm"
          />
        )}
        <div className="flex items-center justify-between font-medium">
          <button onClick={() => handleDownload()} className="bg-purple text-[0.77rem] border-4 border-double text-white px-[0.96rem] py-[0.47rem] rounded-full flex items-center justify-center gap-2">
            <UploadIcon className="fill-[white] rotate-180 w-[15px] h-[15px]" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={() => handleCopy()}
            className="border bg-transparent border-1 border-gray px-[0.96rem] py-[0.47rem] rounded-full flex items-center justify-center gap-2 text-gray text-[0.77rem]"
          >
            <CopySvg className="fill-gray w-[17px] h-[17px]" />
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyUi;
