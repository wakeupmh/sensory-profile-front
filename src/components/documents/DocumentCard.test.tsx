import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentCard from './DocumentCard';
import type { DocumentRecord } from '../../types/documents';

const DAY_MS = 24 * 60 * 60 * 1000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY_MS).toISOString();

function makeDocument(overrides: Partial<DocumentRecord> = {}): DocumentRecord {
  return {
    id: 'doc-1',
    childId: 'child-1',
    fileName: 'laudo.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('DocumentCard — expiry badge', () => {
  it('shows no expiry badge when the document has no expiresAt', () => {
    render(<DocumentCard document={makeDocument()} onOpen={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText(/Vencido/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Vence em/)).not.toBeInTheDocument();
  });

  it('shows no badge for a document valid far in the future', () => {
    render(<DocumentCard document={makeDocument({ expiresAt: iso(200) })} onOpen={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText(/Vencido/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Vence em/)).not.toBeInTheDocument();
  });

  it('shows a "Vencido" badge for a document that already expired', () => {
    render(<DocumentCard document={makeDocument({ expiresAt: iso(-5) })} onOpen={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Vencido em/)).toBeInTheDocument();
  });

  it('shows a "Vence em" badge for a document expiring within the warning window', () => {
    render(<DocumentCard document={makeDocument({ expiresAt: iso(10) })} onOpen={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Vence em/)).toBeInTheDocument();
  });

  it('shows the resource-type badge when resourceType is set', () => {
    render(<DocumentCard document={makeDocument({ resourceType: 'appointment' })} onOpen={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Consulta médica')).toBeInTheDocument();
  });
});

describe('DocumentCard — interactions', () => {
  it('calls onOpen when the card is clicked', async () => {
    const onOpen = vi.fn();
    const doc = makeDocument();
    render(<DocumentCard document={doc} onOpen={onOpen} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByText('laudo.pdf'));
    expect(onOpen).toHaveBeenCalledWith(doc);
  });

  it('calls onDelete (not onOpen) when the delete button is clicked', async () => {
    const onOpen = vi.fn();
    const onDelete = vi.fn();
    const doc = makeDocument();
    render(<DocumentCard document={doc} onOpen={onOpen} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remover documento' }));
    expect(onDelete).toHaveBeenCalledWith('doc-1');
    expect(onOpen).not.toHaveBeenCalled();
  });
});
