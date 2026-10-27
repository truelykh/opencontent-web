import assert from "node:assert/strict";
import test from "node:test";
import {
  EXPLORE_GROUPS,
  HOME_DISCOVERY_GROUP_IDS,
  LIBRARY_NAVIGATION,
  LEGACY_CATEGORY_IDS,
  PRIMARY_NAVIGATION,
  SIDEBAR_PRODUCT_NAVIGATION,
  SIDEBAR_SECONDARY_NAVIGATION,
} from "../lib/navigation";

const group = (id: string) => {
  const match = EXPLORE_GROUPS.find((entry) => entry.id === id);
  assert.ok(match, `expected Explore group ${id}`);
  return match;
};

const categoryTarget = (id: string, label: string) => {
  const destination = group(id).destinations.find((item) => item.label === label);
  assert.ok(destination, `expected ${label} in ${id}`);
  const target = destination.target;
  if (!target || target.type !== "category") {
    assert.fail(`${label} in ${id} is not a category destination`);
  }
  return target.category;
};

test("Home discovery shortcuts resolve to groups, not first categories", () => {
  assert.deepEqual(HOME_DISCOVERY_GROUP_IDS, {
    watch: "watch",
    listen: "listen",
    read: "read",
    learn: "learn",
    live: "live",
    shop: "commerce",
    create: "create",
  });
  assert.equal(group(HOME_DISCOVERY_GROUP_IDS.watch).title, "Watch");
  assert.equal(group(HOME_DISCOVERY_GROUP_IDS.listen).title, "Listen");
  assert.notEqual(HOME_DISCOVERY_GROUP_IDS.watch, "Movies");
  assert.notEqual(HOME_DISCOVERY_GROUP_IDS.listen, "Music");
});

test("universal sidebar keeps the approved hierarchy", () => {
  assert.deepEqual(PRIMARY_NAVIGATION.map((item) => item.label), ["Home", "Explore", "Trending", "Live"]);
  assert.deepEqual(LIBRARY_NAVIGATION.map((item) => item.label), ["Subscriptions", "Favourites", "Watch History"]);
  assert.deepEqual(SIDEBAR_PRODUCT_NAVIGATION.map((item) => item.label), ["Shop", "Studio", "Adcentre"]);
  assert.deepEqual(SIDEBAR_SECONDARY_NAVIGATION.map((item) => item.label), ["Profile", "Settings", "Help"]);
  assert.equal(SIDEBAR_PRODUCT_NAVIGATION.find((item) => item.id === "studio")?.external, true);
  assert.equal(SIDEBAR_PRODUCT_NAVIGATION.find((item) => item.id === "adcenter")?.external, true);
});

test("Explore groups preserve direct child destination mappings", () => {
  assert.deepEqual(group("watch").destinations.map((item) => item.label), [
    "Videos",
    "Movies",
    "Web Series",
    "Short Drama",
    "Shorts",
    "Vertical AI Series",
    "Documentaries",
    "Sports",
    "Gaming",
    "Anime",
    "Cartoons",
    "Kids",
  ]);
  assert.deepEqual(group("listen").destinations.map((item) => item.label), [
    "Music", "Podcasts", "Audiobooks", "Radio", "Audio Stories", "Interviews", "Lectures", "Live Audio",
  ]);
  assert.deepEqual(group("read").destinations.map((item) => item.label), [
    "Articles", "Books", "E-Books", "Newspapers", "Magazines", "Manga", "Comics", "Research Papers", "Presentations", "Reports", "Journals", "Guides", "Digital Newspaper",
  ]);
  assert.deepEqual(group("learn").destinations.map((item) => item.label), [
    "Courses", "Tutorials", "Educational Videos", "Books", "Research Papers", "PDFs", "Presentations (PPT)", "Video Lessons", "Study Materials", "Exam Preparation", "Skill Development", "Language Learning", "Coding & Technology", "Science", "Workshops", "Education",
  ]);
  assert.deepEqual(group("live").destinations.map((item) => item.label), [
    "TV Channels", "Internet Channels", "Live Events", "Live Sports", "Live News", "Creator Livestreams", "Live Gaming", "Concerts", "Conferences", "Webinars",
  ]);
  assert.deepEqual(group("commerce").destinations.map((item) => item.label), [
    "Marketplace", "Physical Products", "Digital Products", "Books & Media", "Electronics", "Fashion", "Home & Living", "Creator Merchandise", "My Orders", "Order Tracking", "Returns", "Refunds", "Product Categories", "Wishlist", "Shopping Cart", "Checkout", "Addresses", "Payment Methods", "Order Support",
  ]);
  assert.deepEqual(group("create").destinations.map((item) => item.label), [
    "Creator Studio", "Upload Content", "My Channel", "My Content", "Analytics", "Collaborations", "Monetization",
  ]);
  assert.deepEqual(group("public-information").destinations.map((item) => item.label), ["Government", "Health", "Public Notices", "Public Services"]);
  assert.deepEqual(group("advertise").destinations.map((item) => item.label), ["Adcentre", "Campaigns", "Creative Assets", "Performance Reports"]);
  assert.equal(categoryTarget("watch", "Anime"), "Anime");
  assert.equal(categoryTarget("listen", "Radio"), "Radio");
  assert.equal(categoryTarget("watch", "Vertical AI Series"), "Vertical AI Series");
  assert.equal(group("watch").destinations.find((item) => item.label === "Vertical AI Series")?.availability, "filter-backed");
  assert.equal(group("create").title, "Studio");
});

test("Explore previews stay compact and do not advertise aggregate coming-soon counts", () => {
  assert.deepEqual(group("watch").previewDestinationIds, ["videos", "Movies", "Web Series", "short-drama", "Sports", "short-videos", "kids"]);
  assert.deepEqual(group("listen").previewDestinationIds, ["Music", "podcasts", "Radio"]);
  assert.deepEqual(group("read").previewDestinationIds, ["Articles", "books", "newspapers", "Manga", "research-papers"]);
  assert.equal(group("watch").destinations.find((item) => item.label === "Short Drama")?.availability, "planned");
  assert.equal(group("watch").destinations.find((item) => item.label === "Kids")?.availability, "policy-restricted");
});

test("selected discovery pages use the approved contextual headings", () => {
  assert.equal(group("watch").selectionTitle, "What would you like to watch?");
  assert.equal(group("listen").selectionTitle, "What would you like to listen to?");
  assert.equal(group("read").selectionTitle, "What would you like to read?");
  assert.equal(group("live").selectionTitle, "What would you like to explore live?");
  assert.equal(group("public-information").selectionTitle, "What information are you looking for?");
});

test("single-destination groups remain explicit discovery steps", () => {
  assert.equal(EXPLORE_GROUPS.some((entry) => entry.id === "other"), false);
  assert.deepEqual(LEGACY_CATEGORY_IDS, ["Others"]);
});

test("taxonomy IDs are unique and planned or restricted entries are non-actionable", () => {
  const destinations = EXPLORE_GROUPS.flatMap((entry) => entry.destinations);
  const ids = destinations.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const item of destinations.filter((entry) => entry.availability === "planned" || entry.availability === "policy-restricted")) {
    assert.equal(item.target, undefined, `${item.label} must not be mapped to an unrelated route`);
  }
  assert.equal(group("watch").destinations.find((item) => item.label === "Kids")?.availability, "policy-restricted");
});

test("supported application destinations preserve existing callbacks", () => {
  const marketplace = group("commerce").destinations.find((item) => item.label === "Marketplace");
  assert.deepEqual(marketplace?.target, { type: "shop", subTab: "store" });
  const studio = group("create").destinations.find((item) => item.label === "Creator Studio");
  assert.deepEqual(studio?.target, { type: "tab", tab: "studio" });
  const adcentre = group("advertise").destinations.find((item) => item.label === "Adcentre");
  assert.deepEqual(adcentre?.target, { type: "tab", tab: "ads" });
  assert.deepEqual(group("public-information").destinations.find((item) => item.label === "Government")?.target, {
    type: "category",
    category: "Gov",
  });
});

test("genres are not top-level Watch taxonomy entries", () => {
  const labels = group("watch").destinations.map((item) => item.label);
  for (const genre of ["Comedy", "Romance", "Horror", "Thriller", "Action", "Sci-Fi"]) {
    assert.equal(labels.includes(genre), false);
  }
});
