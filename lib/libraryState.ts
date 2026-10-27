export type LibraryRequestState = "loading" | "success" | "error";

/** Counts are only authoritative after the backing request succeeds. */
export function verifiedItemCount(
  state: LibraryRequestState,
  count: number,
): number | null {
  return state === "success" ? count : null;
}

/** Failed destructive mutations must leave the existing client state intact. */
export function stateAfterClear<T>(items: readonly T[], succeeded: boolean): T[] {
  return succeeded ? [] : [...items];
}

export function stateAfterRemove<T>(
  items: readonly T[],
  matches: (item: T) => boolean,
  succeeded: boolean,
): T[] {
  return succeeded ? items.filter((item) => !matches(item)) : [...items];
}
