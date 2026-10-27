import { VideoItem, AgeProfile } from "../types";
import {
  findTopK,
  LRUCache,
  InvertedIndex,
} from "./dataStructures";

export interface VideoCatalogIndex {
  videoMap: Map<string, VideoItem>;
  categoryBuckets: Map<string, VideoItem[]>;
  safeVideos: VideoItem[];
  topLikedMusic: VideoItem[];
  invertedIndex: InvertedIndex;
  searchCache: LRUCache<string, VideoItem[]>;
}

/**
 * Builds high-performance indexes in a single O(N) pass.
 * Space Complexity: O(N)
 * Time Complexity: O(N log K) where K is small constant (e.g. 4 for top trending)
 */
export function buildVideoCatalogIndex(
  videos: readonly VideoItem[],
  selectedAgeProfile: AgeProfile = "all"
): VideoCatalogIndex {
  const videoMap = new Map<string, VideoItem>();
  const categoryBuckets = new Map<string, VideoItem[]>();
  const safeVideos: VideoItem[] = [];
  const invertedIndex = new InvertedIndex();
  const searchCache = new LRUCache<string, VideoItem[]>(50);

  // Single O(N) pass across all videos
  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];

    // O(1) ID Map insertion
    videoMap.set(v.id, v);

    // Strictly exclude Adult content from public safe feeds
    if (v.category.toLowerCase() === "adult") {
      continue;
    }

    // Filter by age profile in O(1)
    if (selectedAgeProfile !== "all" && v.ageProfile !== selectedAgeProfile) {
      continue;
    }

    safeVideos.push(v);

    // O(1) Category bucket grouping
    let bucket = categoryBuckets.get(v.category);
    if (!bucket) {
      bucket = [];
      categoryBuckets.set(v.category, bucket);
    }
    bucket.push(v);

    // Cross-index "News" and "News Video" synonymously
    if (v.category === "News" || v.category === "News Video") {
      const aliasKey = v.category === "News" ? "News Video" : "News";
      let aliasBucket = categoryBuckets.get(aliasKey);
      if (!aliasBucket) {
        aliasBucket = [];
        categoryBuckets.set(aliasKey, aliasBucket);
      }
      aliasBucket.push(v);
    }

    // Index document for fast token search
    const docText = `${v.title} ${v.description} ${v.uploader.name} ${v.tags.join(
      " "
    )} ${v.category}`;
    invertedIndex.addDocument(v.id, docText);
  }

  // Top liked music using MinHeap in O(M log K) time
  const musicList = categoryBuckets.get("Music") || [];
  const topLikedMusic = findTopK(musicList, 4, (v) => v.likes || 0);

  return {
    videoMap,
    categoryBuckets,
    safeVideos,
    topLikedMusic,
    invertedIndex,
    searchCache,
  };
}

/**
 * Fast search executor using Inverted Index + LRU Cache
 * Worst-case time: O(M) where M is matched docs count
 * Best-case time: O(1) from LRU Cache
 */
export function queryIndexedVideos(
  catalog: VideoCatalogIndex,
  query: string,
  selectedCategory: string = "all"
): VideoItem[] {
  // A trend requires an explicit recent-activity window from the backend.
  // The current catalogue response only has aggregate counters, so do not
  // present an all-time sort as a real-time trend.
  if (selectedCategory === "trending") return [];

  const cacheKey = `${selectedCategory}:${query.trim().toLowerCase()}`;

  // O(1) LRU Cache lookup
  const cached = catalog.searchCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let matchedItems: VideoItem[];

  if (!query.trim()) {
    if (selectedCategory === "all") {
      matchedItems = catalog.safeVideos;
    } else {
      matchedItems = catalog.categoryBuckets.get(selectedCategory) || [];
    }
  } else {
    // Inverted index token set intersection
    const matchingIds = catalog.invertedIndex.search(query);
    if (!matchingIds || matchingIds.size === 0) {
      matchedItems = [];
    } else {
      matchedItems = [];
      for (const id of matchingIds) {
        const item = catalog.videoMap.get(id);
        if (
          item &&
          item.category.toLowerCase() !== "adult" &&
          (selectedCategory === "all" ||
            item.category === selectedCategory ||
            ((selectedCategory === "News Video" || selectedCategory === "News") &&
              (item.category === "News Video" || item.category === "News")))
        ) {
          matchedItems.push(item);
        }
      }
    }
  }

  // Store in LRU cache in O(1)
  catalog.searchCache.put(cacheKey, matchedItems);
  return matchedItems;
}
