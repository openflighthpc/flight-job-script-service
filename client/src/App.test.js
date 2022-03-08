import { render, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

async function renderApp() {
  const utils = render(<App />);
  // eslint-disable-next-line testing-library/prefer-screen-queries
  expect(utils.getByText('Loading...')).toBeInTheDocument();
  await waitFor(
    // eslint-disable-next-line testing-library/prefer-screen-queries
    () => expect(utils.queryByText('Loading...')).toBeNull()
  );
  return utils;
}

test('renders without crashing', async () => {
  const { queryByText } = await renderApp();
  // eslint-disable-next-line testing-library/prefer-screen-queries
  expect(queryByText('An error has occurred')).toBeNull();
});



test('can sign in', async () => {
  const {
    getAllByText, getByRole, getByLabelText, queryAllByText,
    queryByText,
  } = await renderApp();

  // eslint-disable-next-line testing-library/prefer-screen-queries
  const getFirstByText = (...args) => getAllByText(...args)[0];
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const queryFirstByText = (...args) => queryAllByText(...args)[0] || null;

  // eslint-disable-next-line testing-library/prefer-screen-queries
  expect(queryByText(/test-user/)).toBeNull();
  // eslint-disable-next-line testing-library/prefer-screen-queries
  expect(queryByText(/Test user/)).toBeNull();

  const loginButton = getFirstByText(/Log in/);
  expect(loginButton).toBeInTheDocument();
  fireEvent.click(loginButton)

  // eslint-disable-next-line testing-library/prefer-screen-queries
  const nameInput = getByLabelText('Enter your username');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const passwordInput = getByLabelText('Enter your password');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const button = getByRole('button', { name: 'Sign in' });
  fireEvent.change(nameInput, { target: { value: 'test-user' } });
  fireEvent.change(passwordInput, { target: { value: 'test-password' } });
  fireEvent.click(button);
  await waitFor(
    () => expect(queryFirstByText(/Log in/)).toBeNull()
  )
  expect(getFirstByText('test-user')).toBeInTheDocument();
  expect(getFirstByText('Test user')).toBeInTheDocument();
});
