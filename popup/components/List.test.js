import React from 'react';
import {mount} from 'enzyme';
import List from './List';

test('insert new value to list', () => {
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
});
