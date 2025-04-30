import { CacheService } from "../../../util/cacheService/cacheService";

export const availableCollections = async (cacheService: CacheService):Promise<string> =>  {
    let allCollectionsArr = await cacheService.getAllCollections();
    if (allCollectionsArr.length > 50) {
        allCollectionsArr = allCollectionsArr.slice(0,50);
    }
    return  allCollectionsArr.join(", ");
};