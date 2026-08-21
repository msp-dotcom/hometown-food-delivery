export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#141C22] flex items-start justify-center p-0 sm:p-6">
      <div className="w-full max-w-sm bg-[#F7F4EC] min-h-screen sm:min-h-0 sm:rounded-2xl sm:shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
