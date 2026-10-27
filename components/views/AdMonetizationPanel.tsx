"use client";

import React from "react";
import { BarChartRounded as BarChart, InfoRounded as Info } from "@mui/icons-material";
import { EmptyState } from "../common/EmptyState";

/** Public catalogue rows cannot produce creator-scoped revenue or compliance data. */
export default function AdMonetizationPanel() {
  return (
    <section className="space-y-4" aria-labelledby="monetization-heading">
      <header className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-slate-900">
          <BarChart className="h-5 w-5" aria-hidden="true" />
          <h2 id="monetization-heading" className="text-[16px] font-medium">Monetization</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Creator revenue and advertising reports are available only from verified, creator-scoped reporting data.
        </p>
      </header>
      <div className="border-b border-slate-200">
        <EmptyState
          icon={Info}
          title="Monetization reporting is unavailable"
          description="No creator-scoped reporting endpoint is configured, so this page does not estimate revenue, CPM, fill rate, compliance, or campaign results."
        />
      </div>
    </section>
  );
}
