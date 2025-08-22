"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

import logo from "@/assets/images/wsp-logo.png";
import logoDark from "@/assets/images/wsp-logo-dark.png";
import { useTheme } from "next-themes";

export default function Header() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return (
    <div className="bg-background">
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <Image
          src={theme === "dark" ? logoDark : logo }
          alt="logo"
          width={40}
          height={40}
        />
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
