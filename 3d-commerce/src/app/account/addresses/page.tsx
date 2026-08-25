import { AccountShell } from "@/components/account/AccountShell";
import { Navbar } from "@/components/layout/SiteNavbar";

export default function AddressesPage() {
  return (
    <>
    <Navbar />
    <AccountShell
      title="Addresses"
      description="Manage the addresses used for your physical orders."
    >
      <div className="rounded-2xl border border-border bg-surface/50 p-6 text-sm text-muted">
        Your saved shipping addresses will appear here.
      </div>
    </AccountShell>
    </>
  );
}
