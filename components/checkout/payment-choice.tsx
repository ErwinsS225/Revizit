"use client";

export type Payment = "CASH_ON_DELIVERY" | "MOBILE_MONEY";

// components/checkout/payment-choice.tsx — choix espèces / Mobile Money.
export function PaymentChoice({ payment, setPayment }: { payment: Payment; setPayment: (p: Payment) => void }) {
  const options: { value: Payment; title: string; desc: string }[] = [
    { value: "CASH_ON_DELIVERY", title: "Espèces à la livraison", desc: "Payez en espèces à la réception." },
    { value: "MOBILE_MONEY", title: "Mobile Money", desc: "Wave, Orange ou MTN à la livraison." },
  ];
  return (
    <fieldset className="rounded-lg border p-4 sm:p-6">
      <legend className="px-2 font-serif text-lg font-bold sm:text-xl">Paiement</legend>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer flex-col justify-between rounded-lg border p-4 transition-all active:scale-[0.99] ${
              payment === o.value
                ? "border-terracotta bg-terracotta/5 ring-2 ring-terracotta/30"
                : "border-border hover:bg-muted"
            }`}
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="payment"
                value={o.value}
                checked={payment === o.value}
                onChange={() => setPayment(o.value)}
                className="h-4 w-4 accent-terracotta"
              />
              <span className="text-sm font-semibold">{o.title}</span>
            </span>
            <span className="mt-2 block pl-7 text-xs text-muted-foreground">{o.desc}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
