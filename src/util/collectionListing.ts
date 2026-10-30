import { Constants } from "./constants";
import { Global } from "./util";

export const COLLECTION_PAGE_SIZE = 10;

export interface VisibleCollections {
  // Collections the user picked from search, shown on top until the tree is collapsed
  searched: string[];
  // Current page of the normal listing: favorites first, then the rest in server order
  paged: string[];
  hasMore: boolean;
}

/**
 * Decides which collections the Collections directory should render, so that a scope
 * with thousands of collections never builds (or counts) more nodes than needed.
 */
export const getVisibleCollections = (
  allNames: string[],
  favorites: Set<string>,
  searchedNames: string[],
  limit: number
): VisibleCollections => {
  const existing = new Set(allNames);
  const searched = [...new Set(searchedNames)].filter((name) => existing.has(name));
  const searchedSet = new Set(searched);

  const ordered = [
    ...allNames.filter((name) => favorites.has(name)),
    ...allNames.filter((name) => !favorites.has(name)),
  ];
  const page = ordered.slice(0, limit);

  return {
    searched,
    paged: page.filter((name) => !searchedSet.has(name)),
    hasMore: ordered.length > limit,
  };
};

const favoriteCollectionsKey = (connectionId: string, bucketName: string, scopeName: string): string =>
  `${connectionId}/${bucketName}/${scopeName}`;

export const getFavoriteCollections = (
  connectionId: string,
  bucketName: string,
  scopeName: string
): Set<string> => {
  const favorites = Global.state.get<Record<string, string[]>>(Constants.FAVORITE_COLLECTIONS) ?? {};
  return new Set(favorites[favoriteCollectionsKey(connectionId, bucketName, scopeName)] ?? []);
};

export const setCollectionFavorite = async (
  connectionId: string,
  bucketName: string,
  scopeName: string,
  collectionName: string,
  isFavorite: boolean
): Promise<void> => {
  const favorites = { ...(Global.state.get<Record<string, string[]>>(Constants.FAVORITE_COLLECTIONS) ?? {}) };
  const key = favoriteCollectionsKey(connectionId, bucketName, scopeName);
  const scopeFavorites = new Set(favorites[key] ?? []);
  if (isFavorite) {
    scopeFavorites.add(collectionName);
  } else {
    scopeFavorites.delete(collectionName);
  }
  if (scopeFavorites.size > 0) {
    favorites[key] = [...scopeFavorites];
  } else {
    delete favorites[key];
  }
  await Global.state.update(Constants.FAVORITE_COLLECTIONS, favorites);
};
