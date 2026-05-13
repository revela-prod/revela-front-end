"use client";

import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import { Home, User, CarFront, ClipboardCheck } from "lucide-react";
import { BottomNav } from "./components/navigation/BottomNav";
import Link from "next/link";
import { useNetworkStatus } from "@/shared/hooks/useNetworkStatus";

const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Intake", href: "/intake", icon: ClipboardCheck },
  { label: "Inventory", href: "/inventory", icon: CarFront },
  { label: "Profile", href: "/profile", icon: User },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useNetworkStatus();
  const { user, isLoading, isAuthenticated } = useAuthGuard();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAF8F5]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E8A020] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="fixed inset-0 flex justify-center bg-[#E7E1D8]">
      {/* Phone frame */}
      <div className="relative flex h-[100dvh] w-full max-w-[448px] flex-col bg-[#FAF8F5] shadow-2xl sm:h-[95dvh] sm:my-auto sm:rounded-[2.5rem] sm:border-[8px] sm:border-[#171D17] overflow-hidden">
        {/* Status bar area */}
        <div className="shrink-0 bg-[#FAF8F5] pt-safe-top">
          <nav className="flex items-center justify-between px-5 py-3">
            <Link href="/home">
              <img
                src="/icons/primary-logo.svg"
                alt="Revela"
                className="h-7 w-auto"
              />
            </Link>

            <Link href="/profile">
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.id}`}
                alt="avatar"
                className="h-10 w-10 rounded-full bg-[#FFF7E4] p-1"
              />
            </Link>
          </nav>
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto overscroll-none px-5 pb-safe-bottom">
          {children}
        </main>

        {/* Bottom nav */}
        <div className="shrink-0 bg-white pb-safe-bottom">
          <BottomNav items={NAV_ITEMS} />
        </div>
      </div>
    </div>
  );
}
