import assert from "node:assert/strict";
import test from "node:test";
import {
  stateAfterClear,
  stateAfterRemove,
  verifiedItemCount,
} from "../lib/libraryState";

test("subscription and favourite counts stay unavailable until data succeeds", () => {
  assert.equal(verifiedItemCount("loading", 0), null);
  assert.equal(verifiedItemCount("error", 0), null);
  assert.equal(verifiedItemCount("success", 0), 0);
  assert.equal(verifiedItemCount("success", 3), 3);
});

test("watch history clear only removes items after a successful mutation", () => {
  const items = ["first", "second"];
  assert.deepEqual(stateAfterClear(items, false), items);
  assert.deepEqual(stateAfterClear(items, true), []);
});

test("watch history item removal preserves state when the mutation fails", () => {
  const items = [{ id: "one" }, { id: "two" }];
  assert.deepEqual(stateAfterRemove(items, (item) => item.id === "one", false), items);
  assert.deepEqual(stateAfterRemove(items, (item) => item.id === "one", true), [{ id: "two" }]);
});
