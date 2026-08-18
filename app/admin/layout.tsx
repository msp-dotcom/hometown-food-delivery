import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#F7F4EC] text-[#1B2126]">
      <div className="w-56 bg-[#101820] text-[#CBD4D6] p-5 flex flex-col gap-1 shrink-0 print:hidden">
        <div className="text-white text-sm font-extrabold tracking-wide mb-1">
          HOMETOWN <span className="text-[#DE9A34]">OPS</span>
        </div>
        <div className="text-[10px] text-[#7C8A8E] mb-6 font-mono">admin console · v1</div>

        <div className="text-[9px] uppercase tracking-wider text-[#5E6C70] mb-1 mt-1">Overview</div>
        <NavItem href="/admin" label="Dashboard" n="01" />

        <div className="text-[9px] uppercase tracking-wider text-[#5E6C70] mb-1 mt-3">Hotels</div>
        <NavItem href="/admin/hotels" label="All Hotels" n="02" />

        <div className="text-[9px] uppercase tracking-wider text-[#5E6C70] mb-1 mt-3">Operations</div>
        <NavItem href="/admin/delivery" label="Live Delivery" n="03" />
        <NavItem href="/admin/riders" label="Rider Earnings" n="04" />
        <NavItem href="/admin/performance" label="Hotel Performance" n="05" />
        <NavItem href="/admin/settlements" label="Settlements" n="06" />
      </div>

      <div className="flex-1 p-8 max-w-5xl print:p-0 print:max-w-full">{children}</div>
    </div>
  );
}

function NavItem({ href, label, n }: { href: string; label: string; n: string }) {
  return (
    <Link
      href={href}
      className="px-2.5 py-2 rounded-lg text-sm font-semibold text-[#B8C2C4] hover:bg-[#1A242B] flex items-center gap-2"
    >
      <span className="text-[10px] font-mono text-[#5E6C70]">{n}</span>
      {label}
    </Link>
  );
}
