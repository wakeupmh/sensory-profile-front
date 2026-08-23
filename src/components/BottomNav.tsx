import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuthContext } from '../context/AuthContext';
import { Box } from '@radix-ui/themes';
import {
  HomeIcon,
  PersonIcon,
  ExitIcon,
  ActivityLogIcon,
  HeartIcon,
  PlusCircledIcon,
  BarChartIcon,
  ReaderIcon,
  ClipboardIcon,
  PlusIcon,
  DotsHorizontalIcon,
  Cross2Icon,
  TargetIcon,
  ArchiveIcon,
  CalendarIcon,
  GearIcon,
  MagnifyingGlassIcon,
  SpeakerLoudIcon,
} from '@radix-ui/react-icons';
import { colors, zIndex, typography, shadows } from '../theme/tokens';
import GlobalSearch from './GlobalSearch';

const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, session } = useAuthContext();
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const primaryTabs = [
    { path: '/dashboard', labelKey: 'nav.dashboard', icon: HomeIcon },
    { path: '/children', labelKey: 'nav.children', icon: PersonIcon },
    { path: '/logs', labelKey: 'nav.logs', icon: ActivityLogIcon },
    { path: '/medical', labelKey: 'nav.medical', icon: PlusCircledIcon },
  ];

  const moreTabs = [
    { path: '/relato-do-dia', labelKey: 'nav.dailyReport', icon: SpeakerLoudIcon },
    { path: '/therapy', labelKey: 'nav.therapy', icon: HeartIcon },
    { path: '/development', labelKey: 'nav.development', icon: BarChartIcon },
    { path: '/education', labelKey: 'nav.education', icon: ReaderIcon },
    { path: '/goals', labelKey: 'nav.goals', icon: TargetIcon },
    { path: '/documents', labelKey: 'nav.documents', icon: ArchiveIcon },
    { path: '/monthly-recap', labelKey: 'nav.monthlyRecap', icon: CalendarIcon },
    { path: '/assessment/new', labelKey: 'nav.newAssessment', icon: PlusIcon },
    { path: '/anamneses', labelKey: 'nav.anamneses', icon: ClipboardIcon },
    { path: '/settings', labelKey: 'nav.settings', icon: GearIcon },
  ];

  const handleSignOut = () => signOut().then(() => navigate('/sign-in', { replace: true }));

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    textDecoration: 'none',
    color: colors.ink,
    padding: '8px 12px',
    borderRadius: '12px',
    background: active ? colors['brand-cyan'] : 'transparent',
    transition: 'background 0.15s ease',
    minWidth: '56px',
    minHeight: '52px',
    fontFamily: typography.caption.font,
    fontSize: '11px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  });

  const moreItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    textDecoration: 'none',
    color: colors.ink,
    fontFamily: typography.caption.font,
    fontSize: '0.95rem',
    fontWeight: 600,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    width: '100%',
    borderRadius: '10px',
  };

  const isMoreActive = moreTabs.some((tab) => isActive(tab.path.split('?')[0]));

  return (
    <>
      <Dialog.Root open={moreOpen} onOpenChange={setMoreOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: zIndex.bottomNav + 1,
              background: 'rgba(0,0,0,0.3)',
            }}
          />
          <Dialog.Content
            aria-describedby={undefined}
            style={{
              position: 'fixed',
              bottom: '72px',
              left: '8px',
              right: '8px',
              zIndex: zIndex.bottomNav + 2,
              maxWidth: '400px',
              margin: '0 auto',
              background: colors.surface,
              border: `2px solid ${colors.ink}`,
              borderRadius: '16px',
              boxShadow: shadows.card,
              padding: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 12px 8px' }}>
              <Dialog.Title asChild>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('nav.moreOptions')}</span>
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  aria-label={t('nav.close')}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
                >
                  <Cross2Icon width={18} height={18} />
                </button>
              </Dialog.Close>
            </div>
            <button
              onClick={() => {
                setMoreOpen(false);
                setSearchOpen(true);
              }}
              style={moreItemStyle}
            >
              <MagnifyingGlassIcon width={20} height={20} />
              <span>Buscar</span>
            </button>
            {moreTabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path.split('?')[0]);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  style={{ ...moreItemStyle, background: active ? colors['brand-cyan'] : 'transparent' }}
                  onClick={() => setMoreOpen(false)}
                >
                  <Icon width={20} height={20} />
                  <span>{t(tab.labelKey)}</span>
                </Link>
              );
            })}
            {session && (
              <button
                onClick={() => { setMoreOpen(false); handleSignOut(); }}
                style={{ ...moreItemStyle, color: colors['brand-salmon'] }}
              >
                <ExitIcon width={20} height={20} />
                <span>{t('nav.signOut')}</span>
              </button>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Box
        asChild
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        style={{
          zIndex: zIndex.bottomNav,
          backgroundColor: colors.canvas,
          borderTop: `2px solid ${colors.ink}`,
          display: 'block',
        }}
        className="bottom-nav"
      >
        <nav aria-label={t('nav.bottomNavLabel')}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              height: '64px',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              paddingLeft: '16px',
              paddingRight: '16px',
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            {primaryTabs.map((tab) => {
              const active = isActive(tab.path.split('?')[0]);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  style={tabStyle(active)}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon width={22} height={22} style={{ flexShrink: 0 }} />
                  <span>{t(tab.labelKey)}</span>
                </Link>
              );
            })}

            <button
              onClick={() => setMoreOpen((v) => !v)}
              style={tabStyle(isMoreActive || moreOpen)}
              aria-expanded={moreOpen}
            >
              <DotsHorizontalIcon width={22} height={22} style={{ flexShrink: 0 }} />
              <span>{t('nav.more')}</span>
            </button>
          </div>
        </nav>
      </Box>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default BottomNav;
