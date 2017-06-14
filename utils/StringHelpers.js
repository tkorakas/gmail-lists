/**
 * Replace special characters and remove spaces from remove spaces.
 *
 * @param string
 *  String to change.
 *
 * @returns string
 *  Normalized string.
 */
export default function cleanSpecialCharactersAndRemoveSpaces(string) {
  return string.replace(/[^a-zA-Z]/g, "");
}
