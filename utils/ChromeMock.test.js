import ChromeMock from './ChromeMock';

describe('Background mock', () => {
  let chrome = ChromeMock.storage.sync;
  beforeEach(() => {
    const values = {
      listOne: [1, 2, 3],
      listTwo: [1, 2, 3],
      listThree: [1, 2, 3]
    };
    chrome.clear();
    chrome.set(values)
  });
  test('get single item', () => {
    chrome.get('listOne', (item) => {
      expect(item).toEqual({listOne: [1, 2, 3]})
    });
  });

  test('get multiple items', () => {
    chrome.get(['listOne', 'listTwo'], (items) => {
      expect(items).toEqual({listOne: [1, 2, 3], listTwo: [1, 2, 3]})
    });
  });

  test('get all items', () => {
    chrome.get((items) => {
      expect(items).toEqual({
        listOne: [1, 2, 3],
        listTwo: [1, 2, 3],
        listThree: [1, 2, 3]
      });
    });
  });

  test('set item', () => {
    chrome.set({listFour: [1, 2, 3]}, () => {
      chrome.get('listFour', (item) => {
        expect(item).toEqual({listFour: [1, 2, 3]});
      });
    });
  });

  test('set without callback', () => {
    chrome.set({listFour: [1, 2, 3]});
    chrome.get('listFour', (item) => {
      expect(item).toEqual({listFour: [1, 2, 3]});
    });
  });

  test('set multiple items', () => {
    chrome.set({
        listFour: [1, 2, 3],
        listFive: [1, 2, 3]
      });
    chrome.get(['listFour', 'listFive'], (item) => {
      expect(item).toEqual({listFour: [1, 2, 3], listFive: [1, 2, 3]});
    });
  });

  test('remove item', () => {
    chrome.remove('listOne', () => {
      chrome.get('listOne', (item) => {
        expect(item).toEqual({});
      });
    });
  });

  test('remove without callback', () => {
    chrome.remove('listOne');

    chrome.get('listOne', (item) => {
      expect(item).toEqual({});
    });
  });


  test('remove multiple items', () => {
    chrome.remove(['listOne', 'listTwo'], () => {
      chrome.get(['listOne', 'listTwo'], (items) => {
        expect(items).toEqual({});
      });
    });
  });

  test('clear', () => {
    chrome.clear(() => {
      chrome.get((items) => expect(items).toEqual({}));
    })
  });

  test('clear without callback', () => {
    chrome.clear();
    chrome.get((items) => expect(items).toEqual({}));
  });
});
