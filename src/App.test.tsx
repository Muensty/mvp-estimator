import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('main workflow', () => {
  it('opens the sample, shows calculated pricing, and exposes unresolved terms', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Grandview Website Estimate' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Scope & pricing/i }));
    expect(screen.getAllByText('$18,375').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('105 hours')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Terms$/i }));
    expect(screen.getByText('No universal terms master was verified')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Preview & export/i }));
    expect(screen.getByLabelText('SOW preview')).toBeInTheDocument();
    expect(screen.getByText('Professional fees')).toBeInTheDocument();
  });
});
