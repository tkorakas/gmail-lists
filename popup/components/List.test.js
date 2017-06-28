import React from 'react';
import {mount} from 'enzyme';
import List from './List';
import chrome from '../../helpers/ChromeStorageMock';

test('insert new value to list', () => {
  window.chrome = chrome;
  // chrome.storage.sync.set({key: 'v', key2: 'v2'}, () => {console.log('done')});
  // chrome.storage.sync.get(['key', 'key2'], (d) => {
  //     console.log(d);
  // });
  // return;
  const list = mount(
    <List changePage={jest.fn()} />
  );

  const input = list.find('input');
  input.getDOMNode().value = 'List 1';
  input.simulate('change', input);
  input.simulate('keypress', {key: 'Enter'});
  expect(list.state().items.length).toBe(1);
  expect(list.state().items[0]).toBe('List 1');
  expect(input.getDOMNode().value).toBe('');
  chrome.storage.sync.get((data) => console.log(data));
});
