import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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
    <GumroadModal open={open} onClose={onClose} title={t('navExtra.search')} variant="center" maxWidth="520px">
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
            placeholder={t('search.placeholder')}
            aria-label={t('search.inputLabel')}
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
            {t('search.minChars', { count: MIN_QUERY_LENGTH })}
          </Text>
        )}

        {hasQuery && loading && (
          <Text as="p" style={{ ...applyTypography('body-sm'), color: colors['ink-muted'], padding: '8px 12px' }}>
            {t('search.loading')}
          </Text>
        )}

        {hasQuery && !loading && error && (
          <Text as="p" role="alert" style={{ ...applyTypography('body-sm'), color: colors.error, padding: '8px 12px' }}>
            {t('search.error')}
          </Text>
        )}

        {hasQuery && !loading && !error && !hasResults && (
          <Text as="p" style={{ ...applyTypography('body-sm'), color: colors['ink-muted'], padding: '8px 12px' }}>
            {t('search.noResults', { query: trimmedQuery })}
          </Text>
        )}

        {hasQuery && !loading && !error && hasResults && (
          <Flex direction="column" gap="1">
            {results.children.length > 0 && (
              <div>
                <div style={sectionLabelStyle}>{t('search.sections.children')}</div>
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
                <div style={sectionLabelStyle}>{t('search.sections.logs')}</div>
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
                        {log.childName} · {new Date(log.occurredAt).toLocaleDateString(i18n.language)}
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
                <div style={sectionLabelStyle}>{t('search.sections.documents')}</div>
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
