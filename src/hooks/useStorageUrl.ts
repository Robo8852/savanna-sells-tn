import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Resolve a Convex storage ID to a usable image URL.
 * Returns the URL string when ready, or undefined while loading.
 */
export function useStorageUrl(storageId: Id<"_storage"> | undefined) {
  return useQuery(
    api.files.getImageUrl,
    storageId ? { storageId } : "skip"
  );
}
