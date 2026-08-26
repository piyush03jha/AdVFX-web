"use client";

import Link from "next/link";
import { useState } from "react";

import {
  IconHeart,
  IconSearch,
  IconShoppingCart,
  IconUserCircle,
} from "@tabler/icons-react";

import {
  Navbar as NavbarRoot,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

import { useCart } from "@/context/CartContext";

const navItems = [
  {
    name: "Shop",
    link: "/shop",
  },
  {
    name: "Custom",
    link: "/custom",
  },
  {
    name: "Gaming",
    link: "/shop/gaming",
  },
  {
    name: "Anime",
    link: "/shop/anime",
  },
  {
    name: "Mobile/Tv",
    link: "/shop/mobileTv",
  },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const { itemCount, isLoaded } = useCart();

  return (
    <NavbarRoot>
      {/* =================================================
          DESKTOP NAVIGATION
      ================================================= */}

      <NavBody>
        <NavbarLogo />

        <NavItems items={navItems} />

        {/* Desktop actions */}

        <div
          className="
            relative
            z-50
            flex
            shrink-0
            items-center
            gap-0.5
            pointer-events-auto
          "
        >
          {/* Search */}

          <Link
            href="/search"
            aria-label="Search"
            className="
              relative
              z-50
              flex
              h-9
              w-9
              cursor-pointer
              items-center
              justify-center
              rounded-full
              text-muted
              pointer-events-auto
              transition-all
              duration-300
              hover:bg-surface-elevated
              hover:text-foreground
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
            "
          >
            <IconSearch
              size={18}
              stroke={1.7}
            />
          </Link>

          {/* Wishlist */}

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="
              relative
              z-50
              flex
              h-9
              w-9
              cursor-pointer
              items-center
              justify-center
              rounded-full
              text-muted
              pointer-events-auto
              transition-all
              duration-300
              hover:bg-surface-elevated
              hover:text-foreground
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
            "
          >
            <IconHeart
              size={18}
              stroke={1.7}
            />
          </Link>

          {/* Account */}

          <Link
            href="/account"
            aria-label="My account"
            className="
              relative
              z-50
              flex
              h-9
              w-9
              cursor-pointer
              items-center
              justify-center
              rounded-full
              text-muted
              pointer-events-auto
              transition-all
              duration-300
              hover:bg-surface-elevated
              hover:text-foreground
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
            "
          >
            <IconUserCircle
              size={19}
              stroke={1.7}
            />
          </Link>

          {/* Cart */}

          <CartLink
            itemCount={itemCount}
            isLoaded={isLoaded}
          />
        </div>
      </NavBody>

      {/* =================================================
          MOBILE NAVIGATION
      ================================================= */}

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />

          <div className="flex items-center gap-1">
            <Link
              href="/account"
              aria-label="My account"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-muted
                transition-all
                duration-300
                hover:bg-surface-elevated
                hover:text-foreground
                focus-visible:ring-2
                focus-visible:ring-primary
              "
            >
              <IconUserCircle
                size={19}
                stroke={1.7}
              />
            </Link>

            <CartLink
              itemCount={itemCount}
              isLoaded={isLoaded}
            />

            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() =>
                setIsMobileMenuOpen(
                  (previous) => !previous,
                )
              }
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() =>
            setIsMobileMenuOpen(false)
          }
        >
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.link}
                onClick={() =>
                  setIsMobileMenuOpen(false)
                }
                className="
                  rounded-xl
                  border
                  border-transparent
                  px-4
                  py-3
                  text-base
                  text-muted
                  transition-all
                  duration-300
                  hover:border-border
                  hover:bg-surface-elevated
                  hover:text-foreground
                "
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Link
              href="/search"
              onClick={() =>
                setIsMobileMenuOpen(false)
              }
              className="
                flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-full
                border
                border-border
                bg-surface
                text-sm
                text-muted
                transition-all
                duration-300
                hover:border-primary
                hover:bg-surface-elevated
                hover:text-foreground
              "
            >
              <IconSearch
                size={17}
                stroke={1.7}
              />

              <span className="hidden sm:inline">
                Search
              </span>
            </Link>

            <Link
              href="/wishlist"
              onClick={() =>
                setIsMobileMenuOpen(false)
              }
              className="
                flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-full
                border
                border-border
                bg-surface
                text-sm
                text-muted
                transition-all
                duration-300
                hover:border-primary
                hover:bg-surface-elevated
                hover:text-foreground
              "
            >
              <IconHeart
                size={17}
                stroke={1.7}
              />

              <span className="hidden sm:inline">
                Wishlist
              </span>
            </Link>

            <Link
              href="/account"
              onClick={() =>
                setIsMobileMenuOpen(false)
              }
              className="
                flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-full
                border
                border-border
                bg-surface
                text-sm
                text-muted
                transition-all
                duration-300
                hover:border-primary
                hover:bg-surface-elevated
                hover:text-foreground
              "
            >
              <IconUserCircle
                size={17}
                stroke={1.7}
              />

              <span className="hidden sm:inline">
                Account
              </span>
            </Link>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </NavbarRoot>
  );
}

function CartLink({
  itemCount,
  isLoaded,
}: {
  itemCount: number;
  isLoaded: boolean;
}) {
  return (
    <Link
      href="/cart"
      aria-label={
        itemCount > 0
          ? `Shopping cart, ${itemCount} items`
          : "Shopping cart"
      }
      className="
        relative
        z-50
        flex
        h-9
        w-9
        shrink-0
        cursor-pointer
        items-center
        justify-center
        rounded-full
        text-muted
        pointer-events-auto
        transition-all
        duration-300
        hover:bg-surface-elevated
        hover:text-foreground
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
      "
    >
      <IconShoppingCart
        size={18}
        stroke={1.7}
      />

      <span
        className={`
          pointer-events-none
          absolute
          -right-0.5
          -top-0.5
          flex
          h-4
          min-w-4
          items-center
          justify-center
          rounded-full
          bg-primary
          px-1
          text-[9px]
          font-semibold
          text-white
          shadow-[0_0_12px_var(--glow-primary)]
          transition-all
          duration-200
          ${
            !isLoaded || itemCount === 0
              ? "scale-90 opacity-0"
              : "scale-100 opacity-100"
          }
        `}
      >
        {itemCount}
      </span>
    </Link>
  );
}