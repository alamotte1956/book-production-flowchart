/**
 * Genre-Based Step Filtering
 *
 * Maps genre categories to the step IDs that are NOT relevant for that genre.
 * Steps not listed here are considered universally applicable.
 *
 * Design rationale:
 * - "indexing"       → only relevant for Academic/Textbook and Narrative Nonfiction
 * - "digital" (Ebook & Audio Production) → not relevant for Academic/Textbook (handled separately)
 * - "rights"         → less relevant for Children's / Middle Grade (usually handled by agent)
 * - "proposal/query" → self-publishing genres skip traditional acquisitions entirely
 * - "review/contract"→ same as above for self-publishing paths
 *
 * Genre categories are grouped into broader "tracks" to keep the map manageable:
 *   FICTION        → Literary Fiction, Commercial Fiction, Mystery/Thriller, Sci-Fi, Fantasy,
 *                    Romance, Historical Fiction, Horror, Young Adult, Middle Grade, Children's,
 *                    Short Story Collection, Graphic Novel, Poetry
 *   NONFICTION     → Narrative Nonfiction, Memoir/Autobiography, Self-Help/Personal Development,
 *                    Business/Finance
 *   ACADEMIC       → Academic/Textbook
 *   OTHER          → Other
 */

/** All genres that belong to the Fiction track */
export const FICTION_GENRES = new Set([
  "Literary Fiction",
  "Commercial Fiction",
  "Mystery / Thriller",
  "Science Fiction",
  "Fantasy",
  "Romance",
  "Historical Fiction",
  "Horror",
  "Young Adult",
  "Middle Grade",
  "Children's",
  "Short Story Collection",
  "Graphic Novel",
  "Poetry",
]);

/** All genres that belong to the Nonfiction track */
export const NONFICTION_GENRES = new Set([
  "Narrative Nonfiction",
  "Memoir / Autobiography",
  "Self-Help / Personal Development",
  "Business / Finance",
  "Bible / Scripture",
]);

/** All genres that belong to the Academic track */
export const ACADEMIC_GENRES = new Set([
  "Academic / Textbook",
]);

/**
 * Returns the set of step IDs that should be hidden for a given genre.
 * Returns an empty set when genre is blank or "Other".
 */
export function getIrrelevantStepIds(genre: string | null | undefined): Set<string> {
  if (!genre || genre === "Other") return new Set();

  const hidden = new Set<string>();

  if (FICTION_GENRES.has(genre)) {
    // Fiction books don't need an index
    hidden.add("indexing");

    // Children's and Middle Grade rarely deal with subsidiary rights directly
    if (genre === "Children's" || genre === "Middle Grade") {
      hidden.add("rights");
    }

    // Poetry and Graphic Novel have very different production pipelines;
    // standard ebook/audio production step is less applicable
    if (genre === "Poetry" || genre === "Graphic Novel") {
      hidden.add("digital");
    }
  }

  if (NONFICTION_GENRES.has(genre)) {
    // Nonfiction books generally don't need an index unless they are reference works,
    // but Narrative Nonfiction and Memoir rarely have one
    if (genre === "Narrative Nonfiction" || genre === "Memoir / Autobiography") {
      hidden.add("indexing");
    }

    // Bible / Scripture: the acquisitions path is typically direct-to-publisher or self-published;
    // agent query and standard audio production are not typical
    if (genre === "Bible / Scripture") {
      hidden.add("proposal");
      hidden.add("review");
    }
  }

  if (ACADEMIC_GENRES.has(genre)) {
    // Academic books go through a very different acquisitions path (peer review, not agent query)
    hidden.add("proposal");
    hidden.add("review");

    // Academic titles rarely have a commercial audio production
    hidden.add("digital");
  }

  return hidden;
}

/**
 * Returns a human-readable label explaining why a step is hidden for a genre.
 */
export function getFilterReason(stepId: string, genre: string): string {
  const reasons: Record<string, Partial<Record<string, string>>> = {
    indexing: {
      default: `Indexes are not typically produced for ${genre} books.`,
    },
    rights: {
      "Children's": "Rights for Children's books are usually managed by the author's agent.",
      "Middle Grade": "Rights for Middle Grade books are usually managed by the author's agent.",
    },
    digital: {
      "Poetry": "Standard ebook/audio production workflows differ significantly for Poetry.",
      "Graphic Novel": "Graphic Novel ebook production uses a different pipeline (fixed-layout EPUB).",
      "Academic / Textbook": "Academic titles rarely include commercial audio production.",
    },
    proposal: {
      "Academic / Textbook": "Academic publishers use peer review submissions, not agent queries.",
      "Bible / Scripture": "Bible and Scripture titles are typically published directly or through religious publishers, not via agent queries.",
    },
    review: {
      "Academic / Textbook": "Academic publishers use peer review submissions, not agent queries.",
      "Bible / Scripture": "Bible and Scripture titles are typically published directly or through religious publishers, not via agent review.",
    },
  };

  const stepReasons = reasons[stepId];
  if (!stepReasons) return `This step is not typically required for ${genre} books.`;
  return stepReasons[genre] ?? stepReasons["default"] ?? `This step is not typically required for ${genre} books.`;
}
