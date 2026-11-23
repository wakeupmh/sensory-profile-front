import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const reportError = vi.fn();
vi.mock('../lib/errorTracking', () => ({ reportError: (...args: unknown[]) => reportError(...args) }));

function Boom(): never {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  it('reports the caught error to error tracking', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><Boom /></ErrorBoundary>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(reportError).toHaveBeenCalledWith(expect.objectContaining({ message: 'kaboom' }), expect.any(String));
  });
});
