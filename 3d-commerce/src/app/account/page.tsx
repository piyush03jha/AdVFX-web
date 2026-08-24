import { AccountShell } from "@/components/account/AccountShell";
import { AccountOverview } from "@/components/account/AccountOverview";

export default function AccountPage() {
  return (
    <AccountShell
      title="Welcome back."
      description="Manage your orders, delivery details, wishlist and account preferences."
    >
      <AccountOverview />
    </AccountShell>
  );
}
