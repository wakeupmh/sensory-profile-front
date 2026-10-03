import type React from 'react';
import {
  HomeIcon,
  FileTextIcon,
  ClipboardIcon,
  PersonIcon,
  ActivityLogIcon,
  PlusCircledIcon,
  HeartIcon,
  BarChartIcon,
  ReaderIcon,
  Share1Icon,
  EnvelopeOpenIcon,
  EyeOpenIcon,
  TargetIcon,
  ArchiveIcon,
  GroupIcon,
  CalendarIcon,
  GearIcon,
  SpeakerLoudIcon,
  BadgeIcon,
} from '@radix-ui/react-icons';

export type NavIcon = React.ComponentType<{ width?: number; height?: number; style?: React.CSSProperties; 'aria-hidden'?: boolean | 'true' | 'false' }>;

export interface NavItem {
  path: string;
  /** Prefixos (por segmento) que marcam o item como ativo */
  match: string[];
  /** Prefixos que, mesmo casando com `match`, pertencem a outro item */
  exclude?: string[];
  /** Ativo só na rota exata */
  exact?: boolean;
  labelKey: string;
  icon: NavIcon;
}

export type NavGroupId = 'daily' | 'health' | 'sharing' | 'account';

export interface NavGroup {
  id: NavGroupId;
  labelKey: string;
  items: NavItem[];
}

const underPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/** Detecta o item ativo por segmento de rota ('/shared' não casa com '/sharedX'). */
export const isNavItemActive = (pathname: string, item: NavItem): boolean => {
  if (item.exact) return pathname === item.path;
  if (item.exclude?.some((p) => underPrefix(pathname, p))) return false;
  return item.match.some((p) => underPrefix(pathname, p));
};

// Núcleo da navegação: igual no desktop e no mobile
export const PRIMARY_ITEMS: NavItem[] = [
  { path: '/dashboard', match: ['/dashboard'], exact: true, labelKey: 'nav.dashboard', icon: HomeIcon },
  { path: '/children', match: ['/children'], labelKey: 'nav.children', icon: PersonIcon },
  { path: '/assessments', match: ['/assessments', '/assessment'], labelKey: 'nav.assessments', icon: FileTextIcon },
  { path: '/logs', match: ['/logs'], labelKey: 'nav.logs', icon: ActivityLogIcon },
];

export const MORE_GROUPS: NavGroup[] = [
  {
    id: 'daily',
    labelKey: 'navExtra.groups.daily',
    items: [
      { path: '/relato-do-dia', match: ['/relato-do-dia'], labelKey: 'nav.dailyReport', icon: SpeakerLoudIcon },
      { path: '/goals', match: ['/goals'], labelKey: 'nav.goals', icon: TargetIcon },
      { path: '/monthly-recap', match: ['/monthly-recap'], labelKey: 'nav.monthlyRecap', icon: CalendarIcon },
    ],
  },
  {
    id: 'health',
    labelKey: 'navExtra.groups.health',
    items: [
      { path: '/anamneses', match: ['/anamneses', '/anamnese'], labelKey: 'nav.anamneses', icon: ClipboardIcon },
      { path: '/medical', match: ['/medical'], labelKey: 'nav.medical', icon: PlusCircledIcon },
      { path: '/therapy', match: ['/therapy'], labelKey: 'nav.therapy', icon: HeartIcon },
      { path: '/development', match: ['/development'], labelKey: 'nav.development', icon: BarChartIcon },
      { path: '/education', match: ['/education'], labelKey: 'nav.education', icon: ReaderIcon },
      { path: '/documents', match: ['/documents'], labelKey: 'nav.documents', icon: ArchiveIcon },
    ],
  },
  {
    id: 'sharing',
    labelKey: 'navExtra.groups.sharing',
    items: [
      { path: '/professionals', match: ['/professionals'], labelKey: 'nav.professionals', icon: Share1Icon },
      {
        path: '/shared',
        match: ['/shared'],
        exclude: ['/shared/children'],
        labelKey: 'nav.sharedWithMe',
        icon: EyeOpenIcon,
      },
      { path: '/shared/children', match: ['/shared/children'], labelKey: 'nav.sharedChildren', icon: GroupIcon },
      { path: '/invite/accept', match: ['/invite'], labelKey: 'nav.acceptInvite', icon: EnvelopeOpenIcon },
    ],
  },
  {
    id: 'account',
    labelKey: 'navExtra.groups.account',
    items: [{ path: '/settings', match: ['/settings'], labelKey: 'nav.settings', icon: GearIcon }],
  },
];

// Só entra na navegação quando a conta tem pelo menos um atendimento — ver useCareTeamCaseload.
export const CARE_TEAM_CASELOAD_ITEM: NavItem = {
  path: '/care-team/children',
  match: ['/care-team/children'],
  labelKey: 'nav.careTeamCaseload',
  icon: BadgeIcon,
};

// Só aparece para quem faz parte de alguma clínica, para uma conta de responsável não ganhar um link morto.
export const CLINICS_ITEM: NavItem = {
  path: '/clinics',
  match: ['/clinics'],
  labelKey: 'nav.clinics',
  icon: GroupIcon,
};

/** Grupos do menu "Mais" com os itens condicionais já encaixados em "Compartilhamento". */
export const buildMoreGroups = (opts: { careTeam: boolean; clinics: boolean }): NavGroup[] =>
  MORE_GROUPS.map((g) =>
    g.id === 'sharing'
      ? {
          ...g,
          items: [
            ...g.items,
            ...(opts.careTeam ? [CARE_TEAM_CASELOAD_ITEM] : []),
            ...(opts.clinics ? [CLINICS_ITEM] : []),
          ],
        }
      : g,
  );
