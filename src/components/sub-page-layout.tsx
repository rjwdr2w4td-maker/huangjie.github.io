import DashboardLayout from "@/components/dashboard-layout";

export default function SubPageLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
