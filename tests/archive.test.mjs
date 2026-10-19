import { test } from "node:test";
import assert from "node:assert/strict";
import { seed, isArchive } from "../lib/archive.ts";
import { films, matches, fromTMDB } from "../lib/catalog.ts";
test("The initial archive survives an export and import", () => {
  assert.ok(isArchive(JSON.parse(JSON.stringify(seed))));
});
test("Import rejects incomplete memories and remote tracking photographs", () => {
  const broken = structuredClone(seed);
  broken.memories = [
    {
      id: "test",
      film: "interstellar",
      title: "Recuerdo",
      text: "Una historia.",
      date: "2026-10-18",
      emotion: "Asombro",
      people: "",
      rating: 9,
      photo: "https://untrusted.example/track",
    },
  ];
  assert.equal(isArchive(broken), false);
  delete broken.memories[0].photo;
  assert.ok(isArchive(broken));
  delete broken.memories[0].date;
  assert.equal(isArchive(broken), false);
});
test("Rankings cannot import duplicated titles or more than ten entries", () => {
  const a = structuredClone(seed);
  a.top = ["interstellar", "interstellar"];
  assert.equal(isArchive(a), false);
  a.top = Array.from({ length: 11 }, (_, i) => `movie-${i}`);
  assert.equal(isArchive(a), false);
});
test("Catalog identity is unique across movie and TV categories", () => {
  assert.equal(
    new Set(films.map((f) => `${f.type}-${f.tmdb}`)).size,
    films.length,
  );
  assert.equal(films.find((f) => f.id === "your-name").type, "movie");
  assert.equal(films.find((f) => f.id === "attack-on-titan").type, "tv");
});
test("Universal search understands accents, actors and directors", () => {
  assert.ok(
    matches(
      films.find((f) => f.id === "dune-2"),
      "timothee",
    ),
  );
  assert.ok(matches(films[0], "nolan"));
  assert.ok(
    matches(
      films.find((f) => f.id === "past-lives"),
      "past lives",
    ),
  );
});
test("TMDB normalization preserves identity and classifies anime correctly", () => {
  const film = fromTMDB({
    id: 372058,
    title: "Your Name",
    media_type: "movie",
    genre_ids: [16],
    original_language: "ja",
    release_date: "2016-08-26",
    vote_average: 8.5,
  });
  assert.equal(film.id, "your-name");
  assert.equal(film.type, "movie");
  assert.equal(film.category, "Anime");
  const tv = fromTMDB({
    id: 94796,
    name: "Crash Landing on You",
    media_type: "tv",
    original_language: "ko",
    first_air_date: "2019-12-14",
  });
  assert.equal(tv.category, "K-dramas");
  assert.equal(tv.id, "crash-landing");
});
test("Trailer selection uses official YouTube trailers", () => {
  const f = fromTMDB({
    id: 777,
    title: "Test",
    videos: {
      results: [
        { site: "YouTube", type: "Teaser", key: "teaser", official: true },
        {
          site: "YouTube",
          type: "Trailer",
          key: "unofficial",
          official: false,
        },
        {
          site: "YouTube",
          type: "Trailer",
          key: "official-es",
          official: true,
          iso_639_1: "es",
        },
      ],
    },
  });
  assert.equal(f.trailer, "official-es");
});
