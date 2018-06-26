import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });
import renderer from 'react-test-renderer';
import chrome from '../../utils/ChromeMock';
import App from './App';


describe('App component', () => {
  beforeEach(() => {
    window.chrome = chrome;
  });

  test('snapshot test', () => {
    const tree = renderer
    .create(<App />)
    .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('change page', () => {
    // const app = mount(
    //   <App />
    // );
  });
});
