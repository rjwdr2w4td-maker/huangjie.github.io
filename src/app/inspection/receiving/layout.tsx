import SubPageLayout from "@/components/sub-page-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SubPageLayout>{children}</SubPageLayout>;
}
