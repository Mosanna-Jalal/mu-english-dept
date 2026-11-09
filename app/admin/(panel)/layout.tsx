import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminNav, AdminNavView } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration" },
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[236px_1fr]">
      <Suspense fallback={<AdminNavView pathname="" />}>
        <AdminNav />
      </Suspense>
      <div className="min-w-0 px-4 pb-20 pt-6 sm:px-6 lg:px-10 lg:pt-10">{children}</div>
    </div>
  );
}
