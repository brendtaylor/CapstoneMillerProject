import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { LogOut } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "../components/ui/navigation-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
  SheetDescription,
  SheetHeader,
} from "../components/ui/sheet";
import { useIsMobile } from "../hooks/use-mobile";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";

const Header: React.FC = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const { username, displayName, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const navItems = [
    { label: "Quality", href: "/quality" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-800 p-4 min-h-[75px] max-h-[75px]">
      <div className="flex items-center justify-between mx-auto max-w-[1300px]">
        <img src={process.env.PUBLIC_URL + "/Mi-Hub.png"} alt="MiHub Logo" className="w-[125px]" />

        {isMobile ? (
          <Sheet>
            <SheetTrigger>
              <Menu className="w-10 h-10 text-white" />
            </SheetTrigger>
            <VisuallyHidden>
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Select a page to navigate.</SheetDescription>
              </SheetHeader>
            </VisuallyHidden>
            <SheetContent onOpenAutoFocus={(e) => e.preventDefault()} side="top" className="flex flex-col justify-between h-[60vh] bg-gray-800 text-white">
              <div className="mt-5 space-y-4">
                {navItems.map((item) => (
                  <SheetTrigger asChild key={item.href}>
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`block px-4 py-2 text-lg font-semibold rounded transition ${
                        location.pathname === item.href ? 
                        "text-white hover:text-white hover:bg-gray-700 hover:rounded-md hover:border-0" 
                        : "text-gray-500 hover:text-white hover:bg-gray-700 rounded-md"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </SheetTrigger>
                ))}
              </div>
              {username && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-10 py-2 bg-gray-900 text-white text-lg border border-gray-500 rounded-lg flex items-center justify-center font-semibold cursor-pointer">
                      {username.toUpperCase()}
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent side="top" align="start" className="bg-white min-w-60 shadow-md border rounded-md p-1">
                    <div className="px-2 py-1">
                      <h4 className="text-lg font-semibold">{displayName || ""}</h4>
                      <h5 className="text-sm font-semibold">{userRole || ""}</h5>
                      <h6 className="text-sm text-gray-500">{username+"@millc.com" || ""}</h6>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center justify-between w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100 cursor-pointer"
                      // onClick={() => logout(navigate)}
                    >
                      Logout <LogOut />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SheetContent>
          </Sheet>
        ) : (
          // Desktop Navigation Menu
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-4">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link to={item.href} className={`font-semibold px-3 py-2 transition ${
                      location.pathname === item.href
                        ? "text-white border-b-2 hover:text-white hover:bg-gray-700 hover:rounded-md hover:border-0"
                        : "text-gray-500 hover:text-white hover:bg-gray-700 rounded-md"
                    }`}>
                    {item.label}
                  </Link>
                </NavigationMenuItem>
              ))}

              {username && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-10 h-10 bg-gray-900 text-white text-lg border border-gray-500 rounded-full flex items-center justify-center font-bold cursor-pointer">
                      {username.charAt(0).toUpperCase()}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end" className="bg-white min-w-60 shadow-md border rounded-md p-1">
                    <div className="px-2 py-1">
                      <h4 className="text-lg font-semibold">{displayName || ""}</h4>
                      <h5 className="text-sm text-gray-700 font-semibold">
                        {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : ""}
                      </h5>
                      <h6 className="text-sm text-gray-500 mt-1">{username+"@millc.com" || ""}</h6>
                    </div>
                    <DropdownMenuSeparator />
                    {userRole === "admin" && (
                      <DropdownMenuItem
                        className="flex items-center justify-between w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => navigate("/adminpanel")}
                      >
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center justify-between w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100 cursor-pointer"
                      // onClick={() => logout(navigate)}
                    >
                      Logout <LogOut />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
