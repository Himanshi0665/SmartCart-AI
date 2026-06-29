import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "hsl(222 47% 5%)" }}>
      <Sidebar />
      <Navbar />
      <main
        className="ml-64 pt-16 min-h-screen"
        style={{ background: "hsl(222 47% 5%)" }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
