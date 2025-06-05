import { CacheService } from "../../../util/cacheService/cacheService";

export const availableCollections = async (cacheService: CacheService):Promise<string> =>  {
    // Method 1
    // let allCollectionsArr = await cacheService.getAllCollections();
    // if (allCollectionsArr.length > 50) {
    //     allCollectionsArr = allCollectionsArr.slice(0,50);
    // }
    // return  allCollectionsArr.join(", ");

    // Method 2
    return await cacheService.getAllCollectionsSerialized();
};