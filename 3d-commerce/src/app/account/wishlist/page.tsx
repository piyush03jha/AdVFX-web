import { AccountShell } from "@/components/account/AccountShell";
import { Navbar } from "@/components/layout/SiteNavbar";

export default function WishlistPage() {
  return (
    <>
    <Navbar />
    <AccountShell
      title="Wishlist"
      description="Save products you want to revisit later."
    >
      <div className="rounded-2xl border border-border bg-surface/50 p-6 text-sm text-muted">
        Your wishlist is ready for products you save from the catalog.
      </div>
    </AccountShell>
    </>
  );
}
