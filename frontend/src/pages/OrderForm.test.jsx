import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import OrderForm from './OrderForm';
import { getMedicines } from '../services/medicineService';
import { createOrder } from '../services/orderService';

vi.mock('../services/medicineService', () => ({
  getMedicines: vi.fn(),
}));

vi.mock('../services/orderService', () => ({
  createOrder: vi.fn(),
  updateOrder: vi.fn(),
  getOrderById: vi.fn(),
}));

function renderOrderForm() {
  return render(
    <MemoryRouter initialEntries={['/orders/new']}>
      <Routes>
        <Route path="/orders/new" element={<OrderForm />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('OrderForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMedicines.mockResolvedValue({ data: { data: [] } });
  });

  test('prevents submitting an order until a polyclinic and medicine are selected', async () => {
    renderOrderForm();

    fireEvent.submit(screen.getByRole('button', { name: 'Buat Order' }).closest('form'));

    expect(await screen.findByText('Poliklinik wajib dipilih')).toBeInTheDocument();
    expect(screen.getByText('Pilih obat')).toBeInTheDocument();
    expect(createOrder).not.toHaveBeenCalled();
  });
});
