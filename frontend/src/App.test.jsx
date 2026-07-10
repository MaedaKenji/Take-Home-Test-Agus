import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, test } from 'vitest';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './App';

test('ProtectedRoute redirects unauthenticated users to the login route', async () => {
  render(
    <MemoryRouter initialEntries={['/orders']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<h1>Login page</h1>} />
          <Route path="/orders" element={<ProtectedRoute><h1>Orders</h1></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );

  expect(await screen.findByRole('heading', { name: 'Login page' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Orders' })).not.toBeInTheDocument();
});
