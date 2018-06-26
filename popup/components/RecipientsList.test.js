import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });
import RecipientsList from './RecepientsList';
import chrome from '../../utils/ChromeMock';

describe('RecipientsList component', () => {
  beforeEach(() => {
   window.chrome = chrome;
  });


  test('insert new value to list', () => {
    const list = mount(
      <RecipientsList changePage={jest.fn()} item='list' />
    );

    // Find input field.
    const input = list.find('input');
    // Type on field and enter value.
    input.getDOMNode().value = 'email@example.com';
    input.simulate('change', input);
    input.simulate('keypress', {key: 'Enter'});

    // There is one item on the list.
    expect(list.state().items.length).toBe(1);
    expect(list.state().items[0]).toBe('email@example.com');

    // Input field has no value.
    expect(input.getDOMNode().value).toBe('');

    // Item saved on storage.
    chrome.storage.sync.get((data) => {
      expect(data).toEqual({gmail_lists_list: ["email@example.com"]});
    });
  });

  test('insert empty to list', () => {
    const list = mount(
      <RecipientsList changePage={jest.fn()} item='list' />
    );

    // Find input field.
    const input = list.find('input');
    // Type on field and enter value.
    input.getDOMNode().value = '';
    input.simulate('change', input);
    input.simulate('keypress', {key: 'Enter'});

    // There is one item on the list.
    expect(list.state().items.length).toBe(1);

    // Item saved on storage.
    chrome.storage.sync.get((data) => {
      expect(data).toEqual({gmail_lists_list: ["email@example.com"]});
    });

    input.getDOMNode().value = ' ';
    input.simulate('change', input);
    input.simulate('keypress', {key: 'Enter'});

    // There is one item on the list.
    expect(list.state().items.length).toBe(1);

    // Item saved on storage.
    chrome.storage.sync.get((data) => {
      expect(data).toEqual({gmail_lists_list: ["email@example.com"]});
    });
  });

  test('load lists', () => {
    chrome.storage.sync.get((data) => {
      expect(data).toEqual({gmail_lists_list: ["email@example.com"]})
    });

    const list = mount(
      <RecipientsList changePage={jest.fn()} item='list' />
    );

    expect(list.find('li').length).toBe(1);
  });

  test('delete value from list', () =>{
    let list = mount(
      <RecipientsList changePage={jest.fn()} item='list' />
    );

    // Click delete button.
    const deleteButton = list.find('.delete-button').first();
    deleteButton.simulate('click', {targe: {name: 'email@example.com'}});

    // Item saved on storage.
    chrome.storage.sync.get('gmail_lists_list', (data) => {
      expect(data).toEqual({gmail_lists_list: []});
    });
    expect(list.state().items.length).toBe(0);

    list = mount(
      <RecipientsList changePage={jest.fn()} item='list' />
    );
    expect(list.find('li').length).toBe(0);
  });
});
