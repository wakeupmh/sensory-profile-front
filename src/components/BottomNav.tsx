import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
} from '@radix-ui/react-icons';
import { colors, zIndex, typography, shadows } from '../theme/tokens';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, session } = useAuthContext();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const primaryTabs = [
    { path: '/dashboard', label: 'Início', icon: HomeIcon },
    { path: '/children', label: 'Crianças', icon: PersonIcon },
    { path: '/logs', label: 'Registros', icon: ActivityLogIcon },
    { path: '/medical', label: 'Saúde', icon: PlusCircledIcon },
  ];

  const moreTabs = [
    { path: '/therapy', label: 'Terapia', icon: HeartIcon },
    { path: '/development', label: 'Desenvolvimento', icon: BarChartIcon },
    { path: '/education', label: 'Educação', icon: ReaderIcon },
    { path: '/assessment/new', label: 'Nova Avaliação', icon: PlusIcon },
    { path: '/anamneses', label: 'Anamneses', icon: ClipboardIcon },
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

  const isMoreActive = moreTabs.some((t) => isActive(t.path.split('?')[0]));

  return (
    <>
      {moreOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: zIndex.bottomNav + 1,
            background: 'rgba(0,0,0,0.3)',
          }}
          onClick={() => setMoreOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '72px',
              left: '8px',
              right: '8px',
              maxWidth: '400px',
              margin: '0 auto',
              background: '#fff',
              border: `2px solid ${colors.ink}`,
              borderRadius: '16px',
              boxShadow: shadows.card,
              padding: '8px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 12px 8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Mais opções</span>
              <button
                onClick={() => setMoreOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
              >
                <Cross2Icon width={18} height={18} />
              </button>
            </div>
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
                  <span>{tab.label}</span>
                </Link>
              );
            })}
            {session && (
              <button
                onClick={() => { setMoreOpen(false); handleSignOut(); }}
                style={{ ...moreItemStyle, color: colors['brand-salmon'] }}
              >
                <ExitIcon width={20} height={20} />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>
      )}

      <Box
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
              >
                <Icon width={22} height={22} style={{ flexShrink: 0 }} />
                <span>{tab.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setMoreOpen((v) => !v)}
            style={tabStyle(isMoreActive || moreOpen)}
          >
            <DotsHorizontalIcon width={22} height={22} style={{ flexShrink: 0 }} />
            <span>Mais</span>
          </button>
        </div>
      </Box>
    </>
  );
};

export default BottomNav;
