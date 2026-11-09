import { Footer } from "@/components/site/Footer";
import { Masthead } from "@/components/site/Masthead";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <Masthead />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
