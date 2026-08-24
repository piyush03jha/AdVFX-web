import { AccountNav } from "./AccountNav";

interface AccountShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AccountShell({
  children,
  title = "My Account",
  description,
}: AccountShellProps) {
  return (
    <main className="min-h-screen bg-background">
      <div
        className="
          mx-auto
          w-full
          max-w-[1440px]
          px-4
          py-6
          sm:px-6
          sm:py-8
          lg:px-8
          lg:py-12
        "
      >
        <header className="mb-6 sm:mb-8">
          <p
            className="
              text-[9px]
              font-medium
              uppercase
              tracking-[0.22em]
              text-primary
            "
          >
            FORMA / ACCOUNT
          </p>

          <h1
            className="
              mt-1.5
              text-2xl
              font-medium
              tracking-tight
              text-foreground
              sm:text-3xl
            "
          >
            {title}
          </h1>

          {description && (
            <p
              className="
                mt-1
                max-w-xl
                text-xs
                leading-5
                text-muted
                sm:text-sm
              "
            >
              {description}
            </p>
          )}
        </header>

        <div
          className="
            grid
            gap-6
            lg:grid-cols-[210px_minmax(0,1fr)]
            lg:gap-10
          "
        >
          <AccountNav />

          <section className="min-w-0">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}