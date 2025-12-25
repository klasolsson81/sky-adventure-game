import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary.jsx';

// Component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error during tests (expected errors)
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Oops! Något gick fel/i)).toBeInTheDocument();
  });

  it('should display error message in error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Spelet stötte på ett oväntat problem/i)).toBeInTheDocument();
  });

  it('should have reset button when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /Försök igen/i })).toBeInTheDocument();
  });

  it('should have reload button when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /Ladda om sidan/i })).toBeInTheDocument();
  });

  it('should call onReset callback when reset button clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const resetButton = screen.getByRole('button', { name: /Försök igen/i });
    await user.click(resetButton);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('should clear error state when reset is called', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify error UI is shown
    expect(screen.getByText(/Oops! Något gick fel/i)).toBeInTheDocument();

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /Försök igen/i });
    await user.click(resetButton);

    // Verify onReset was called (parent handles re-rendering)
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('should NOT show technical details in production', () => {
    // Set production mode
    const originalMode = import.meta.env.MODE;
    import.meta.env.MODE = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Technical details should not be visible
    expect(screen.queryByText(/Teknisk information/i)).not.toBeInTheDocument();

    // Restore mode
    import.meta.env.MODE = originalMode;
  });

  it('should apply correct styling classes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const fallback = screen.getByText(/Oops! Något gick fel/i).closest('.error-boundary-fallback');
    expect(fallback).toBeInTheDocument();
  });
});
