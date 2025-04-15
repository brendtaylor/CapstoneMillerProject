import React from "react";
import { useIsMobile } from "../hooks/use-mobile";

const Footer: React.FC = () => {
  const isMobile = useIsMobile();

  // If mobile, do not render the footer
  if (isMobile) {
    return null;
  }

  return (
    <div className="w-full bg-gray-800 border-t border-gray-300 min-h-[50px] max-h-[50px]">
      <footer className="flex justify-between items-center px-5 py-2 w-[70%] mx-auto mt-1">
        {/* Left Section */}
        <div className="flex flex-col justify-center items-center text-sm text-white">
          MiHub v2.0.1
        </div>
      </footer>
    </div>
  );
};

export default Footer;
