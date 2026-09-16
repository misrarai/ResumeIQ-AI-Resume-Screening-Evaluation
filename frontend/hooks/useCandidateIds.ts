"use client";

import { useEffect, useState } from "react";

/** Reads the candidate id list stashed in sessionStorage by the new-screening
 * form so the progress grid can render all N queued chips up front. Falls
 * back to an empty list on a page refresh / direct link, where the grid
 * degrades to showing only candidates as they get scored. */
export function useCandidateIds(runId: string): string[] {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    // Reading sessionStorage must happen post-hydration (SSR has no
    // `window`), so this genuinely needs an effect rather than a lazy
    // useState initializer.
    try {
      const raw = sessionStorage.getItem(`run:${runId}:candidates`);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setIds(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [runId]);

  return ids;
}
