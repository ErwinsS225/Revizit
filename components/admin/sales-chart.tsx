"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";

// components/admin/sales-chart.tsx — graphique des ventes 14 derniers jours
// (Recharts = client component ; le Server Component page l'alimente).
export interface SalesPoint {
  date: string; // "26/09"
  sales: number; // en F CFA
}

const axisFormatter = new Intl.NumberFormat("fr-FR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function SalesChart({ data }: { data: SalesPoint[] }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Ventes des 14 derniers jours">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            width={44}
            tickFormatter={(value: number) => axisFormatter.format(value)}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))" }}
            formatter={(value) => [formatPrice(Number(value)), "Ventes"]}
            labelFormatter={(label) => `Le ${label}`}
          />
          <Bar dataKey="sales" fill="hsl(var(--terracotta))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
