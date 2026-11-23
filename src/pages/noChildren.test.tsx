import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentType } from 'react';
import LogsPage from './LogsPage';
import GoalsPage from './GoalsPage';
import MedicalPage from './MedicalPage';
import MonthlyRecapPage from './MonthlyRecapPage';
import TherapyPage from './TherapyPage';
import DevelopmentPage from './DevelopmentPage';
import EducationPage from './EducationPage';
import DocumentsPage from './DocumentsPage';
import DailyReportPage from './DailyReportPage';
import Home from './Home';
import { ToastProvider } from '../context/ToastContext';

// Um responsável que acabou de criar a conta, sem nenhuma criança.
const session = { user: { id: 'u1' } };
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ getToken: async () => 't', isLoaded: true, session }),
}));
vi.mock('../context/DelegationContext', () => ({
  useDelegation: () => ({ delegateChildId: null, isDelegating: false, delegateChildren: [] }),
}));
vi.mock('../hooks/useDomainPage', () => ({
  useDomainPage: () => ({
    children: [],
    childrenLoaded: true,
    childrenError: null,
    reloadChildren: () => {},
    selectedChildId: '',
    setSelectedChildId: () => {},
    effectiveChildId: '',
    getTokenRef: { current: async () => 't' },
  }),
}));
vi.mock('../services/api', async (importOriginal) => {
  const real = await importOriginal<Record<string, unknown>>();
  const empty = async () => [];
  const anyApi = new Proxy({}, { get: () => empty });
  return {
    ...Object.fromEntries(Object.keys(real).map((k) => [k, anyApi])),
    assessmentApi: { getAllAssessments: async () => ({ data: [] }) },
    childApi: { list: async () => [] },
    draftApi: { getDraft: async () => null },
  };
});

const domainPages: [string, ComponentType][] = [
  ['Logs', LogsPage], ['Goals', GoalsPage], ['Medical', MedicalPage], ['Monthly recap', MonthlyRecapPage],
  ['Therapy', TherapyPage], ['Development', DevelopmentPage], ['Education', EducationPage],
  ['Documents', DocumentsPage], ['Daily report', DailyReportPage],
];

function renderAt(Page: ComponentType, path = '/') {
  return render(<ToastProvider><MemoryRouter initialEntries={[path]}><Page /></MemoryRouter></ToastProvider>);
}

describe('a page with no child shows only the add-a-child card', () => {
  it.each(domainPages)('%s', async (_name, Page) => {
    renderAt(Page);
    expect(await screen.findByRole('heading', { name: 'Nenhuma criança cadastrada' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
    expect(screen.queryAllByRole('button')).toEqual([]);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link').map((l) => l.textContent)).toEqual(['Adicionar Criança']);
  });

  it.each([['/dashboard'], ['/assessments']])('Home at %s leads with adding a child, not a new assessment', async (path) => {
    renderAt(Home, path);
    expect(await screen.findByRole('link', { name: 'Adicionar Criança' })).toHaveAttribute('href', '/children');
    expect(screen.queryByRole('link', { name: /Nova Avaliação/ })).not.toBeInTheDocument();
  });
});
