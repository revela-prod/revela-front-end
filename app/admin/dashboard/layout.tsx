
"use client";

import Sidebar from "./_components/layout/Sidebar";
import MainContent from "./_components/layout/MainContent";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen  bg-[#FAF8F5] font-cabinet">
      <Sidebar />
      <MainContent>{children}</MainContent>
    </div>
  );
}