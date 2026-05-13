"use client";

import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import ProfileCard from "./_components/ProfileCard";

export default function InspectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthGuard();

  return (
    <div className="fixed inset-0 flex justify-center bg-[#E7E1D8]">
      {/* Phone frame */}
      <div className="relative flex h-[100dvh] w-full max-w-[448px] flex-col bg-[#FAF8F5] shadow-2xl sm:my-auto sm:h-[95dvh] sm:rounded-[2.5rem] sm:border-[8px] sm:border-[#171D17] overflow-hidden">
        
        {/* Header */}
        <div className="shrink-0 bg-white pt-safe-top">
          <div className="flex items-center justify-between border-b border-[#E7E1D8] px-5 py-4">
            <div className="flex items-center gap-2">
              <img
                src="/icons/primary-logo.svg"
                alt="Revela"
                className="h-7 w-auto"
              />
              <span className="rounded bg-[#E8A020] px-1.5 py-0.5 text-[8px] font-bold text-white">
                INSPECTOR
              </span>
            </div>

            <img
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.id}`}
              alt="avatar"
              className="h-10 w-10 rounded-full bg-[#FFF7E4] p-1"
            />
          </div>
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto overscroll-none px-5">
          {children}
        </main>

        {/* Bottom section */}
        <div className="shrink-0 bg-white pb-safe-bottom">
          <ProfileCard />
          <p className="py-3 text-center text-[10px] text-[#BFC9C3]">
            © {new Date().getFullYear()} Revela. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}