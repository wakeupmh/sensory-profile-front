import React from 'react';
import { Flex } from '@radix-ui/themes';
import GumroadCard from '../design-system/GumroadCard';
import GumroadSkeleton from '../design-system/GumroadSkeleton';

/**
 * Esqueletos de carregamento por página — preservam o layout enquanto os
 * dados chegam, no lugar do spinner centralizado. Cada um anuncia
 * "Carregando…" via role="status" para leitores de tela.
 */

const Status: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div role="status">
    <span className="sr-only">Carregando…</span>
    {children}
  </div>
);

const CardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GumroadCard color="white" shadow="md" padding="lg">
    {children}
  </GumroadCard>
);

export const ChildrenListSkeleton: React.FC = () => (
  <Status>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <CardShell key={i}>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center" gap="2">
              <GumroadSkeleton variant="text" height="20px" width="60%" />
              <GumroadSkeleton variant="text" width="64px" height="24px" />
            </Flex>
            <GumroadSkeleton variant="text" width="45%" />
            <GumroadSkeleton variant="text" width="55%" />
            <Flex gap="2" mt="2">
              <GumroadSkeleton height="36px" style={{ flex: 1 }} />
              <GumroadSkeleton height="36px" style={{ flex: 1 }} />
              <GumroadSkeleton height="36px" style={{ flex: 1 }} />
            </Flex>
          </Flex>
        </CardShell>
      ))}
    </div>
  </Status>
);

export const DashboardSkeleton: React.FC = () => (
  <Status>
    <Flex direction="column" gap="4">
      <GumroadCard color="cyan" shadow="md" padding="lg">
        <Flex direction="column" gap="3">
          <GumroadSkeleton variant="text" height="24px" width="40%" />
          <GumroadSkeleton variant="text" width="65%" />
        </Flex>
      </GumroadCard>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <CardShell key={i}>
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2">
                <GumroadSkeleton variant="circle" width="32px" />
                <GumroadSkeleton variant="text" height="18px" width="50%" />
              </Flex>
              <GumroadSkeleton variant="text" width="80%" />
              <GumroadSkeleton height="36px" width="120px" />
            </Flex>
          </CardShell>
        ))}
      </div>
    </Flex>
  </Status>
);

export const ChildProfileSkeleton: React.FC = () => (
  <Status>
    <Flex direction="column" gap="4">
      <GumroadCard color="cyan" shadow="md" padding="lg">
        <Flex justify="between" align="start" gap="3" wrap="wrap">
          <Flex direction="column" gap="2" style={{ flex: 1, minWidth: '200px' }}>
            <GumroadSkeleton variant="text" height="28px" width="50%" />
            <GumroadSkeleton variant="text" width="35%" />
          </Flex>
          <Flex gap="2">
            <GumroadSkeleton height="36px" width="120px" />
            <GumroadSkeleton height="36px" width="100px" />
          </Flex>
        </Flex>
      </GumroadCard>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '16px',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <GumroadCard key={i} color="white" shadow="sm" padding="md">
            <Flex direction="column" gap="2" align="center">
              <GumroadSkeleton variant="circle" width="36px" />
              <GumroadSkeleton variant="text" width="70%" />
              <GumroadSkeleton variant="text" height="22px" width="40%" />
            </Flex>
          </GumroadCard>
        ))}
      </div>
    </Flex>
  </Status>
);

export const LogsListSkeleton: React.FC = () => (
  <Status>
    <Flex direction="column" gap="4">
      <Flex gap="2" wrap="wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <GumroadSkeleton key={i} height="34px" width="96px" style={{ borderRadius: '9999px' }} />
        ))}
      </Flex>
      <Flex direction="column" gap="3">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardShell key={i}>
            <Flex align="center" gap="3">
              <GumroadSkeleton variant="circle" width="40px" />
              <Flex direction="column" gap="2" style={{ flex: 1 }}>
                <GumroadSkeleton variant="text" height="16px" width="35%" />
                <GumroadSkeleton variant="text" width="60%" />
              </Flex>
              <GumroadSkeleton variant="text" width="72px" />
            </Flex>
          </CardShell>
        ))}
      </Flex>
    </Flex>
  </Status>
);

/**
 * Lista vertical genérica (sessões de terapia, medicamentos/consultas,
 * planos educacionais, marcos do desenvolvimento). Sem barra de pílulas
 * fake: essas páginas já renderizam ChildSelector/FilterPill reais acima
 * da condicional de carregamento.
 */
export const DomainListSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <Status>
    <Flex direction="column" gap="3">
      {Array.from({ length: rows }).map((_, i) => (
        <CardShell key={i}>
          <Flex justify="between" align="center" gap="3">
            <Flex direction="column" gap="2" style={{ flex: 1 }}>
              <GumroadSkeleton variant="text" height="18px" width="40%" />
              <GumroadSkeleton variant="text" width="65%" />
            </Flex>
            <GumroadSkeleton height="32px" width="80px" />
          </Flex>
        </CardShell>
      ))}
    </Flex>
  </Status>
);

/** Grade de cartões compactos (biblioteca de documentos). */
export const DocumentsGridSkeleton: React.FC = () => (
  <Status>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '16px',
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <GumroadCard key={i} color="white" shadow="sm" padding="md">
          <Flex direction="column" gap="2" align="center">
            <GumroadSkeleton variant="circle" width="32px" />
            <GumroadSkeleton variant="text" width="80%" />
            <GumroadSkeleton variant="text" width="50%" />
          </Flex>
        </GumroadCard>
      ))}
    </div>
  </Status>
);

export const GoalsListSkeleton: React.FC = () => (
  <Status>
    <Flex direction="column" gap="4">
      <Flex gap="2" wrap="wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <GumroadSkeleton key={i} height="34px" width="88px" style={{ borderRadius: '9999px' }} />
        ))}
      </Flex>
      <Flex direction="column" gap="3">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardShell key={i}>
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center" gap="2">
                <GumroadSkeleton variant="text" height="20px" width="45%" />
                <GumroadSkeleton variant="text" width="80px" height="24px" />
              </Flex>
              <GumroadSkeleton variant="text" width="70%" />
              <GumroadSkeleton height="18px" style={{ borderRadius: '9999px' }} />
            </Flex>
          </CardShell>
        ))}
      </Flex>
    </Flex>
  </Status>
);
