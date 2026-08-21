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

  return (
    <NavbarRoot>
      {/* =================================================
          DESKTOP NAVIGATION
      ================================================= */}

      <NavBody>
        {/* Logo */}
        <NavbarLogo />

        {/* Navigation */}
        <NavItems items={navItems} />

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <Link
            href="/search"
            aria-label="Search"
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
            <IconHeart
              size={18}
              stroke={1.7}
            />
          </Link>

          {/* Profile */}
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
              hover:text-primary-hover
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
          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="
              relative
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
            <IconShoppingCart
              size={18}
              stroke={1.7}
            />

            {/* Cart Count */}
            <span
              className="
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
              "
            >
              0
            </span>
          </Link>
        </div>
      </NavBody>

      {/* =================================================
          MOBILE NAVIGATION
      ================================================= */}

      <MobileNav>
        <MobileNavHeader>
          {/* Logo */}
          <NavbarLogo />

          <div className="flex items-center gap-1">
            {/* Mobile Profile */}
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

            {/* Mobile Cart */}
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="
                relative
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
              <IconShoppingCart
                size={18}
                stroke={1.7}
              />

              <span
                className="
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
                "
              >
                0
              </span>
            </Link>

            {/* Mobile Menu */}
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

        {/* =================================================
            MOBILE MENU
        ================================================= */}

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() =>
            setIsMobileMenuOpen(false)
          }
        >
          {/* Mobile Links */}
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

          {/* Mobile Actions */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {/* Search */}
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

            {/* Wishlist */}
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

            {/* Account */}
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