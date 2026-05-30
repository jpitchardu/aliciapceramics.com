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
      <div className="lg:hidden">
        <TopNav />
      </div>
      <div className="hidden lg:block">
        <DesktopNav />
      </div>
      <main>{children}</main>
      <StorefrontFooter pad={28} topGap={80} />
    </>
  );
}
