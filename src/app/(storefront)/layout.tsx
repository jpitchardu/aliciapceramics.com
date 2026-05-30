import { TopNav } from "@/ui/storefront/TopNav";
import { DesktopNav } from "@/ui/storefront/DesktopNav";
import { StorefrontFooter } from "@/ui/storefront/StorefrontFooter";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="lg:hidden">
        <TopNav />
      </header>
      <header className="hidden lg:block">
        <DesktopNav />
      </header>
      <main>{children}</main>
      <StorefrontFooter pad={28} topGap={80} />
    </>
  );
}
