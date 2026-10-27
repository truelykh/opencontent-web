"use client";

import React from "react";
import { InfoRounded as Info } from "@mui/icons-material";
import { EmptyState } from "../common/EmptyState";

/** Infrastructure topology is not a public viewer feature. */
export default function MicroserviceArchitectureView() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white" aria-label="System information">
      <EmptyState
        icon={Info}
        title="System details are not available here"
        description="Service names, databases, ports, and deployment topology are kept out of the viewer interface."
      />
    </section>
  );
}
