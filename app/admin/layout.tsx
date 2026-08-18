import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#F7F4EC] text-[#1B2126]">
      {/* Dark side rail — distinct from the customer app on purpose */}
      <div className="w-52 bg-[#101820] text-[#CBD4D6] p-5 flex flex-col gap-1 shrink-0">
        <div className="text-white text-sm font-extrabold tracking-wide mb-1">
          HOMETOWN <span className="text-[#DE9A34]">OPS</span>
        </div>
        <div className="text-[10px] text-[#7C8A8E] mb-6 font-mono">admin console · v1</div>

        <Link
          href="/admin"
          className="px-2.5 py-2 rounded-lg text-sm font-semibold text-[#B8C2C4] hover:bg-[#1A242B]"
        >
          Hotels
        </Link>
      </div>

      <div className="flex-1 p-8 max-w-4xl">{children}</div>
    </div>
  );
}
