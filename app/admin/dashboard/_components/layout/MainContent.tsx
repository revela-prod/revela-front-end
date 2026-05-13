
import { Bell, Download, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const MainContent = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const breadcrumb = pathname
    .split("/")
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" / ");

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#FAF8F5]">
      <header className="flex shrink-0 items-center justify-between border-b border-[#E7E1D8] bg-white px-6 py-4">
        <p className="text-sm text-[#6A6A6A]">{breadcrumb}</p>

        {/* Search */}
        <div className="mx-6 hidden max-w-sm flex-1 md:block">
          <div className="flex items-center gap-2 rounded-xl bg-[#F7F2EB] px-3 py-2">
            <Search size={14} className="text-[#BFC9C3]" />
            <input
              type="text"
              placeholder="Search vehicles, parts..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#BFC9C3]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-sm text-[#6A6A6A] hover:text-[#171D17]">
            <Bell size={16} />
            <span className="text-xs font-bold text-[#E8A020]">Alerts</span>
          </button>
          <button className="flex items-center gap-1.5 whitespace-nowrap text-sm text-[#6A6A6A] hover:text-[#171D17]">
            <Download size={16} />
            <span>Export</span>
          </button>
          <Link
            href="/admin/vehicles/new"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#E8A020] px-3 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <Plus size={14} />
            New Intake
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
};

export default MainContent;
