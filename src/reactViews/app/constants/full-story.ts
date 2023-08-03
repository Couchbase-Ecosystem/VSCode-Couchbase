/** FS_EXCLUDE is a class used by Full Story to prevent capturing
 * an area of the DOM when recording user session. If we have potentially
 * sensitive information, we should wrap that information using this class.
 *
 * Details can be found in the [Full Story Documentation](https://help.fullstory.com/hc/en-us/articles/360020623574-How-do-I-protect-my-users-privacy-in-FullStory-#code-first)
 * */
export const FS_EXCLUDE = 'fs-exclude';
