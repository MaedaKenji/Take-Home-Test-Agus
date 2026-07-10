import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import LoginPage from './LoginPage';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

vi.mock('../services/api', () => ({
  default: { post: vi.fn() },
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

function LocationDisplay() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <LoginPage />
        <LocationDisplay />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows a validation message when required credentials are missing', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(toast.error).toHaveBeenCalledWith('Username dan password wajib diisi');
    expect(api.post).not.toHaveBeenCalled();
  });

  test('stores authentication data and redirects after a successful login', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({
      data: { data: { token: 'test-token', user: { username: 'pharmacist', displayName: 'Farmasi' } } },
    });
    renderLogin();

    await user.type(screen.getByLabelText('Username'), 'pharmacist');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/'));
    expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'pharmacist', password: 'secret' });
    expect(localStorage.getItem('auth_token')).toBe('test-token');
    expect(JSON.parse(localStorage.getItem('auth_user'))).toEqual({ username: 'pharmacist', displayName: 'Farmasi' });
    expect(toast.success).toHaveBeenCalledWith('Selamat datang, Farmasi!');
  });
});
