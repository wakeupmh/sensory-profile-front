import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Text } from '@radix-ui/themes';
import { MagnifyingGlassIcon, PersonIcon, ActivityLogIcon, ArchiveIcon } from '@radix-ui/react-icons';
import GumroadModal from './design-system/GumroadModal';
import { useAuthContext } from '../context/AuthContext';
import { searchApi } from '../services/api';
import { colors, radii, applyTypography } from '../theme/tokens';
import type { SearchResults } from '../types/search';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

const EMPTY_RESULTS: SearchResults = { children: [], logs: [], documents: [] };

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

const resultRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  textAlign: 'left',
  padding: '10px 12px',
  border: 'none',
  background: 'transparent',
  borderRadius: radii.sm,
  cursor: 'pointer',
  color: colors.ink,
};

const sectionLabelStyle: React.CSSProperties = {
  ...applyTypography('caption-uppercase'),
  color: colors['ink-muted'],
  padding: '4px 12px',
};

const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults(EMPTY_RESULTS);
      setError(false);
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    abortRef.current?.abort();

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      setError(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(false);

    const timeoutId = window.setTimeout(async () => {
      try {
        const token = await getToken();
        const data = await searchApi.search(token, trimmed, controller.signal);
        if (!controller.signal.aborted) {
          setResults(data);
          setLoading(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(true);
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, getToken]);

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const hasResults = results.children.length > 0 || results.logs.length > 0 || results.documents.length > 0;

  return (
    <GumroadModal open={open} onClose={onClose} title="Buscar" variant="center" maxWidth="520px">
      <div style={{ marginBottom: '16px' }}>
        <Flex
          align="center"
          gap="2"
          style={{
            border: `2px solid ${colors.ink}`,
            borderRadius: radii.md,
            padding: '10px 14px',
            background: colors.canvas,
          }}
        >
          <MagnifyingGlassIcon width={18} height={18} color={colors['ink-muted']} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar crianças, registros, documentos…"
            aria-label="Buscar crianças, registros, documentos"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              ...applyTypography('body-md'),
              color: colors.ink,
            }}
          />
        </Flex>
      </div>

      <div role="status" aria-live="polite" style={{ minHeight: '80px' }}>
        {!hasQuery && (
          <Text as="p" style={{ ...applyTypography('body-sm'), color: colors['ink-muted'], padding: '8px 12px' }}>
            Digite pelo menos {MIN_QUERY_LENGTH} caracteres para buscar.
          </Text>
        )}

        {hasQuery && loading && (
          <Text as="p" style={{ ...applyTypography('body-sm'), color: colors['ink-muted'], padding: '8px 12px' }}>
            Buscando…
          </Text>
        )}

        {hasQuery && !loading && error && (
          <Text as="p" role="alert" style={{ ...applyTypography('body-sm'), color: colors.error, padding: '8px 12px' }}>
            Não foi possível buscar agora. Tente novamente.
          </Text>
        )}

        {hasQuery && !loading && !error && !hasResults && (
          <Text as="p" style={{ ...applyTypography('body-sm'), color: colors['ink-muted'], padding: '8px 12px' }}>
            Nenhum resultado para "{trimmedQuery}".
          </Text>
        )}

        {hasQuery && !loading && !error && hasResults && (
          <Flex direction="column" gap="1">
            {results.children.length > 0 && (
              <div>
                <div style={sectionLabelStyle}>Crianças</div>
                {results.children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    style={resultRowStyle}
                    className="press-in search-result-row"
                    onClick={() => goTo(`/children/${child.id}`)}
                  >
                    <PersonIcon width={18} height={18} color={colors['ink-muted']} />
                    <Text style={applyTypography('body-md')}>{child.name}</Text>
                  </button>
                ))}
              </div>
            )}

            {results.logs.length > 0 && (
              <div>
                <div style={sectionLabelStyle}>Registros</div>
                {results.logs.map((log) => (
                  <button
                    key={log.id}
                    type="button"
                    style={resultRowStyle}
                    className="press-in search-result-row"
                    onClick={() => goTo(`/logs?childId=${log.childId}`)}
                  >
                    <ActivityLogIcon width={18} height={18} color={colors['ink-muted']} />
                    <Flex direction="column" align="start" style={{ minWidth: 0 }}>
                      <Text style={applyTypography('body-md')}>
                        {log.childName} · {new Date(log.occurredAt).toLocaleDateString('pt-BR')}
                      </Text>
                      <Text
                        style={{
                          ...applyTypography('body-sm'),
                          color: colors['ink-muted'],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '380px',
                        }}
                      >
                        {log.notesSnippet}
                      </Text>
                    </Flex>
                  </button>
                ))}
              </div>
            )}

            {results.documents.length > 0 && (
              <div>
                <div style={sectionLabelStyle}>Documentos</div>
                {results.documents.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    style={resultRowStyle}
                    className="press-in search-result-row"
                    onClick={() => goTo(`/documents?childId=${doc.childId}`)}
                  >
                    <ArchiveIcon width={18} height={18} color={colors['ink-muted']} />
                    <Flex direction="column" align="start">
                      <Text style={applyTypography('body-md')}>{doc.title}</Text>
                      <Text style={{ ...applyTypography('body-sm'), color: colors['ink-muted'] }}>{doc.childName}</Text>
                    </Flex>
                  </button>
                ))}
              </div>
            )}
          </Flex>
        )}
      </div>
    </GumroadModal>
  );
};

export default GlobalSearch;
