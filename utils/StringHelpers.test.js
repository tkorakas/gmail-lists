import transformToKey from './StringHelpers';

describe('transformToKey functionality', () => {
  test('removes special characters from strings', () => {
    const stringWithSpecialChars = 'he#llo$wor%ld';
    const cleanString = transformToKey(stringWithSpecialChars);
    expect(cleanString).toBe('helloworld');
  });

  test('removes spaces from strings', () => {
    const stringWithSpecialChars = 'hello world';
    const cleanString = transformToKey(stringWithSpecialChars);
    expect(cleanString).toBe('helloworld');
  });

  test('transforms all characters to lower', () => {
    const stringWithSpecialChars = 'HelloworlD';
    const cleanString = transformToKey(stringWithSpecialChars);
    expect(cleanString).toBe('helloworld');
  });
});
