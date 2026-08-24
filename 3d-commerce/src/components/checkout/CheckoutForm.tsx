"use client";

import { useMemo, useState } from "react";

import { IconCheck, IconChevronDown, IconMail, IconPhone, IconUser } from "@tabler/icons-react";

import { COUNTRIES, type CountryCode } from "@/config/countries";

interface CheckoutFormProps {
  onCountryChange?: (country: CountryCode) => void;
}

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

const INITIAL_FORM: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  postalCode: "",
  phone: "",
};

export function CheckoutForm({ onCountryChange }: CheckoutFormProps) {
  const [country, setCountry] = useState<CountryCode>("IN");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saved, setSaved] = useState(false);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((item) => item.code === country) ?? COUNTRIES[0],
    [country],
  );

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const handleCountry = (value: CountryCode) => {
    setCountry(value);
    onCountryChange?.(value);
    setSaved(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5 sm:p-7">
        <SectionHeading
          number="01"
          title="Contact information"
          description="We'll use this to send your order confirmation and delivery updates."
        />

        <div className="mt-6 space-y-4">
          <Field
            label="Email address"
            icon={<IconMail size={15} />}
            type="email"
            value={form.email}
            onChange={(value) => update("email", value)}
            placeholder="you@example.com"
            required
          />

          <Field
            label="Phone number"
            icon={<IconPhone size={15} />}
            type="tel"
            value={form.phone}
            onChange={(value) => update("phone", value)}
            placeholder="Your phone number"
            required
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5 sm:p-7">
        <SectionHeading
          number="02"
          title="Delivery address"
          description="Enter the address where you'd like your order delivered."
        />

        <div className="mt-6 space-y-4">
          <SelectField
            label="Country / region"
            value={country}
            onChange={(value) => handleCountry(value as CountryCode)}
            options={COUNTRIES.map((item) => ({
              value: item.code,
              label: item.name,
            }))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              icon={<IconUser size={15} />}
              value={form.firstName}
              onChange={(value) => update("firstName", value)}
              placeholder="First name"
              required
            />
            <Field
              label="Last name"
              value={form.lastName}
              onChange={(value) => update("lastName", value)}
              placeholder="Last name"
              required
            />
          </div>

          <Field
            label="Address"
            value={form.address}
            onChange={(value) => update("address", value)}
            placeholder="Street address"
            required
          />

          <Field
            label="Apartment, suite, etc."
            value={form.apartment}
            onChange={(value) => update("apartment", value)}
            placeholder="Optional"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="City"
              value={form.city}
              onChange={(value) => update("city", value)}
              placeholder="City"
              required
            />
            <Field
              label="State / province"
              value={form.state}
              onChange={(value) => update("state", value)}
              placeholder="State"
              required
            />
            <Field
              label="Postal code"
              value={form.postalCode}
              onChange={(value) => update("postalCode", value)}
              placeholder="Postal code"
              required
            />
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/[0.035] p-4">
          <IconCheck size={15} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-[11px] leading-5 text-muted">
            Delivery country: <span className="text-foreground">{selectedCountry.name}</span> ·
            Currency: <span className="text-foreground">{selectedCountry.currency}</span>
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5 sm:p-7">
        <SectionHeading
          number="03"
          title="Payment"
          description="Payment gateway integration will be connected after the checkout flow is finalized."
        />

        <div className="mt-6 rounded-xl border border-white/[0.07] bg-black/10 p-4 sm:p-5">
          <p className="text-xs font-medium text-foreground">Secure payment</p>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            Your payment details will be handled by the payment provider. No card data is stored in this storefront.
          </p>
        </div>

        <button
          type="submit"
          className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {saved ? <IconCheck size={17} /> : null}
          {saved ? "Details saved" : "Continue to payment"}
        </button>
      </section>
    </form>
  );
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="pt-0.5 font-mono text-[10px] tracking-[0.15em] text-primary">
        {number}
      </span>
      <div>
        <h2 className="text-lg font-medium tracking-[-0.02em] text-foreground sm:text-xl">
          {title}
        </h2>
        <p className="mt-1.5 max-w-xl text-xs leading-5 text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  icon?: React.ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-medium uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className={`h-12 w-full rounded-xl border border-white/[0.09] bg-black/10 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-primary/60 ${icon ? "pl-11" : ""}`}
        />
      </span>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-medium uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl border border-white/[0.09] bg-black/10 px-4 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#111113] text-white">
              {option.label}
            </option>
          ))}
        </select>
        <IconChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
        />
      </span>
    </label>
  );
}
