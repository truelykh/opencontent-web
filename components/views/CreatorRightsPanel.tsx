"use client";

import React from "react";
import { BalanceRounded as Scale, InfoRounded as Info } from "@mui/icons-material";
import { EmptyState } from "../common/EmptyState";

/** The rights service has no authenticated creator-case contract yet. */
export default function CreatorRightsPanel() {
  return (
    <section className="space-y-4" aria-labelledby="rights-heading">
      <header className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-slate-900">
          <Scale className="h-5 w-5" aria-hidden="true" />
          <h2 id="rights-heading" className="text-lg font-semibold">Copyright and reports</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Case data and rights actions are shown only when they are supplied by the rights service.
        </p>
      </header>
      <div className="rounded-xl border border-slate-200 bg-white">
        <EmptyState
          icon={Info}
          title="Rights case management is unavailable"
          description="This installation does not have an authenticated rights-case API. No claim, takedown, complaint, or legal status is being inferred."
        />
      </div>
    </section>
  );
}
