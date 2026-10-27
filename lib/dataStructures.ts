/**
 * High-Performance Core Data Structures & Algorithmic Utilities
 * Optimized for O(1) lookups, O(log N) binary searches, and O(N log K) top-K selections.
 */

// ============================================================================
// 1. MinHeap / Priority Queue: O(log K) insertion & deletion, O(1) peek
// ============================================================================
export class MinHeap<T> {
  private data: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this.compare = compare;
  }

  get size(): number {
    return this.data.length;
  }

  peek(): T | undefined {
    return this.data[0];
  }

  push(val: T): void {
    this.data.push(val);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const bottom = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  private bubbleUp(idx: number): void {
    let curr = idx;
    while (curr > 0) {
      const parent = (curr - 1) >> 1;
      if (this.compare(this.data[curr], this.data[parent]) < 0) {
        this.swap(curr, parent);
        curr = parent;
      } else {
        break;
      }
    }
  }

  private bubbleDown(idx: number): void {
    let curr = idx;
    const len = this.data.length;
    while (true) {
      let smallest = curr;
      const left = (curr << 1) + 1;
      const right = left + 1;

      if (left < len && this.compare(this.data[left], this.data[smallest]) < 0) {
        smallest = left;
      }
      if (right < len && this.compare(this.data[right], this.data[smallest]) < 0) {
        smallest = right;
      }

      if (smallest !== curr) {
        this.swap(curr, smallest);
        curr = smallest;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const tmp = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = tmp;
  }

  toArraySorted(): T[] {
    const copy = [...this.data];
    return copy.sort(this.compare);
  }
}

/**
 * Top-K element extraction using a MinHeap:
 * Time Complexity: O(N log K) - where K is small constant (e.g. 4), effectively O(N)
 * Space Complexity: O(K) - strictly constant memory O(1) for fixed K
 */
export function findTopK<T>(
  items: readonly T[],
  k: number,
  scoreFn: (item: T) => number
): T[] {
  if (items.length <= k) {
    return [...items].sort((a, b) => scoreFn(b) - scoreFn(a));
  }

  // MinHeap keeps track of the K largest elements.
  // The root is the SMALLEST of the top K elements.
  const heap = new MinHeap<T>((a, b) => scoreFn(a) - scoreFn(b));

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (heap.size < k) {
      heap.push(item);
    } else {
      const minTop = heap.peek()!;
      if (scoreFn(item) > scoreFn(minTop)) {
        heap.pop();
        heap.push(item);
      }
    }
  }

  const result: T[] = [];
  while (heap.size > 0) {
    result.push(heap.pop()!);
  }
  // Reverse to get descending order
  return result.reverse();
}

// ============================================================================
// 2. Binary Search Utilities: O(log N) Time, O(1) Auxiliary Space
// ============================================================================

/**
 * Finds index of exact match using Binary Search in a sorted array.
 * Time: O(log N)
 * Space: O(1)
 */
export function binarySearchExact<T, K>(
  sortedList: readonly T[],
  target: K,
  keySelector: (item: T) => K
): number {
  let low = 0;
  let high = sortedList.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const midVal = keySelector(sortedList[mid]);

    if (midVal === target) {
      return mid;
    } else if (midVal < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}

/**
 * Finds the first element with key >= target (Lower Bound).
 * Time: O(log N)
 * Space: O(1)
 */
export function lowerBound<T>(
  sortedList: readonly T[],
  target: number,
  keySelector: (item: T) => number
): number {
  let low = 0;
  let high = sortedList.length;

  while (low < high) {
    const mid = (low + high) >> 1;
    if (keySelector(sortedList[mid]) >= target) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return low;
}

/**
 * Finds the first element with key > target (Upper Bound).
 * Time: O(log N)
 * Space: O(1)
 */
export function upperBound<T>(
  sortedList: readonly T[],
  target: number,
  keySelector: (item: T) => number
): number {
  let low = 0;
  let high = sortedList.length;

  while (low < high) {
    const mid = (low + high) >> 1;
    if (keySelector(sortedList[mid]) > target) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return low;
}

/**
 * Finds all elements within [minVal, maxVal] in a sorted array.
 * Time: O(log N + M) where M is number of matching items
 * Space: O(1) auxiliary
 */
export function rangeQuery<T>(
  sortedList: readonly T[],
  minVal: number,
  maxVal: number,
  keySelector: (item: T) => number
): T[] {
  const startIdx = lowerBound(sortedList, minVal, keySelector);
  const endIdx = upperBound(sortedList, maxVal, keySelector);
  return sortedList.slice(startIdx, endIdx);
}

// ============================================================================
// 3. LRU Cache: O(1) Get, O(1) Put using Hash Map + Doubly Linked List
// ============================================================================

interface DNode<K, V> {
  key: K;
  value: V;
  prev: DNode<K, V> | null;
  next: DNode<K, V> | null;
}

export class LRUCache<K, V> {
  private capacity: number;
  private map: Map<K, DNode<K, V>>;
  private head: DNode<K, V>;
  private tail: DNode<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    // Sentinel nodes for O(1) insertion/deletion
    this.head = { key: null as unknown as K, value: null as unknown as V, prev: null, next: null };
    this.tail = { key: null as unknown as K, value: null as unknown as V, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    // Move accessed node to head (most recently used)
    this.detach(node);
    this.attachToHead(node);
    return node.value;
  }

  put(key: K, value: V): void {
    let node = this.map.get(key);
    if (node) {
      node.value = value;
      this.detach(node);
      this.attachToHead(node);
    } else {
      if (this.map.size >= this.capacity) {
        // Evict least recently used (node before tail)
        const lru = this.tail.prev!;
        this.detach(lru);
        this.map.delete(lru.key);
      }
      node = { key, value, prev: null, next: null };
      this.attachToHead(node);
      this.map.set(key, node);
    }
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  clear(): void {
    this.map.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private detach(node: DNode<K, V>): void {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
  }

  private attachToHead(node: DNode<K, V>): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }
}

// ============================================================================
// 4. Inverted Token Index: O(1) Token Lookup & O(K) Multi-word Set Intersection
// ============================================================================

export class InvertedIndex {
  // Map of normalized token -> Set of item IDs
  private tokenMap: Map<string, Set<string>> = new Map();
  // Map of ID -> Search haystack for exact substring verification
  private docHaystack: Map<string, string> = new Map();

  addDocument(id: string, text: string): void {
    const normalized = text.toLowerCase();
    this.docHaystack.set(id, normalized);

    // Split words with regex
    const tokens = normalized.split(/[\s,._\-:;#/\\|()[\]{}]+/);
    for (const token of tokens) {
      if (token.length < 2) continue;
      let set = this.tokenMap.get(token);
      if (!set) {
        set = new Set<string>();
        this.tokenMap.set(token, set);
      }
      set.add(id);
    }
  }

  /**
   * Search query tokens using Set intersection:
   * Returns Set of matching document IDs.
   */
  search(query: string): Set<string> | null {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return null;

    const queryTokens = cleanQuery
      .split(/[\s,._\-:;#/\\|()[\]{}]+/)
      .filter((t) => t.length > 0);

    if (queryTokens.length === 0) return null;

    // Collect candidate sets for each token
    const candidateSets: Set<string>[] = [];

    for (const token of queryTokens) {
      const matchSet = new Set<string>();
      // Direct O(1) match
      const exactSet = this.tokenMap.get(token);
      if (exactSet) {
        exactSet.forEach((id) => matchSet.add(id));
      }

      // Prefix match on tokens for live typing search (up to 30 keys)
      let prefixCount = 0;
      for (const [key, idSet] of this.tokenMap.entries()) {
        if (key !== token && key.startsWith(token)) {
          idSet.forEach((id) => matchSet.add(id));
          prefixCount++;
          if (prefixCount > 25) break;
        }
      }

      // Also verify direct substring match in haystacks
      for (const [id, haystack] of this.docHaystack.entries()) {
        if (haystack.includes(token)) {
          matchSet.add(id);
        }
      }

      candidateSets.push(matchSet);
    }

    // Intersect smallest set first for minimal comparisons: O(K * minSize)
    candidateSets.sort((a, b) => a.size - b.size);
    const result = new Set<string>(candidateSets[0]);

    for (let i = 1; i < candidateSets.length; i++) {
      const currentSet = candidateSets[i];
      for (const id of result) {
        if (!currentSet.has(id)) {
          result.delete(id);
        }
      }
      if (result.size === 0) break;
    }

    return result;
  }
}
