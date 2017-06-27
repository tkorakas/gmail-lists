/**
 * Replace special characters and remove spaces from remove spaces.
 *
 * @param string
 *  String to change.
 *
 * @returns string
 *  Normalized string.
 */
export default function transformToKey(string) {
  string = string.replace(/ /g, '')
  return string.replace(/[^a-zA-Z1-9]/g, '').toLowerCase();
}
