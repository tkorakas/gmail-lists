import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });
import renderer from 'react-test-renderer';
import List from './List';
import chrome from '../../utils/ChromeMock';
import deleteFunctionality from '../../utils/BackgroundMock';

describe('List component', () => {
  beforeEach(() => {
    window.chrome = chrome;
  });

  test('snapshot test', () => {
    const tree = renderer
    .create(<List changePage={jest.fn()}/>)
    .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('insert new value to list', () => {
    const list = mount(
      <List changePage={jest.fn()} />
    );

    // Find input field.
    const input = list.find('input');
    // Type on field and enter value.
    input.getDOMNode().value = 'List 1';
    input.simulate('change', input);
    input.simulate('keypress', {key: 'Enter'});

    // There is one item on the list.
    expect(list.state().items.length).toBe(1);
    expect(list.state().items[0]).toBe('List 1');

    // Input field has no value.
    expect(input.getDOMNode().value).toBe('');

    // Item saved on storage.
    chrome.storage.sync.get((data) => {
      expect(data).toEqual({gmail_lists: ["List 1"]});
    });
  });

  test('insert empty to list', () => {
    const list = mount(
      <List changePage={jest.fn()} />
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
      expect(data).toEqual({gmail_lists: ["List 1"]});
    });

    input.getDOMNode().value = ' ';
    input.simulate('change', input);
    input.simulate('keypress', {key: 'Enter'});

    // There is one item on the list.
    expect(list.state().items.length).toBe(1);

    // Item saved on storage.
    chrome.storage.sync.get((data) => {
      expect(data).toEqual({gmail_lists: ["List 1"]});
    });
  });

  test('load lists', () => {
    chrome.storage.sync.get((data) => {
      expect(data).toEqual({gmail_lists: ["List 1"]})
    });

    const list = mount(
      <List changePage={jest.fn()} />
    );

    expect(list.find('ListItemText').length).toBe(1);
  });

  test('undo deleted value', () =>{
    let list = mount(
      <List changePage={jest.fn()} />
    );

    // Click delete button.
    const deleteButton = list.find('.delete-button').first();
    deleteButton.simulate('click', {target: {name: 'List 1'}});

    // Simulate background script.
    const undoButton = list.find('.undo-button').first();
    undoButton.simulate('click');
    deleteFunctionality();

    // Item saved on storage.
    chrome.storage.sync.get('gmail_lists', (data) => {
      expect(data).toEqual({gmail_lists: ['List 1']});
    });
    expect(list.state().items.length).toBe(1);

    list = mount(
      <List changePage={jest.fn()} />
    );
    expect(list.find('ListItem').length).toBe(1);
  });

  test('delete value from list', () =>{
    let list = mount(
      <List changePage={jest.fn()} />
    );

    // Click delete button.
    const deleteButton = list.find('.delete-button').first();
    deleteButton.simulate('click', {targe: {name: 'List 1'}});

    // Item saved on storage.
    chrome.storage.sync.get('gmail_lists', (data) => {
      expect(data).toEqual({gmail_lists: []});
    });
    expect(list.state().items.length).toBe(0);

    list = mount(
      <List changePage={jest.fn()} />
    );
    expect(list.find('li').length).toBe(0);
  });
});
