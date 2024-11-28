import Image from "next/image";
import Link from "next/link";

const Nav = () => {
  return (
    <div>
      <nav className="flex items-center justify-center md:justify-between bg-[#f9f9f9] z-40 justify-center p-5 shadow-blue fixed top-0 left-0 right-0 shadow-sm md:shadow-none md:top-7 md:border md:border-purple md:border-opacity-10 md:bg-white md:rounded-full md:px-[1.7rem] md:mx-auto md:w-[70%]">
        <Image
          src="/images/logo.svg"
          alt="logo"
          width={110}
          height={110}
          className="object-contain"
        />
        <Link
          href="#"
          className="hidden md:inline-block bg-purple text-[0.8rem] border-4 border-double text-white px-8 py-2 rounded-full"
        >
          Start for free
        </Link>
      </nav>
    </div>
  );
}

export default Nav