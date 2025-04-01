import React from 'react';
import { render, screen } from '@testing-library/react'
import Home from './page'

beforeAll(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            { id: 1, task: "Test Task", completed: false },
          ]),
      })
    ) as typeof fetch;
  });

test('renders heading and todo', async () => {
render(<Home />);
// This waits for the async fetch to finish and DOM to update
expect(await screen.findByText("📝 Todo List")).toBeInTheDocument();
expect(await screen.findByText("Test Task")).toBeInTheDocument();
});