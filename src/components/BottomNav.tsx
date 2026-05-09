import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Box } from '@radix-ui/themes';
import { HomeIcon, PlusIcon, ClipboardIcon, ExitIcon } from '@radix-ui/react-icons';
import { colors, zIndex, typography } from '../theme/tokens';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, session } = useAuthContext();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const tabs = [
    { path: '/dashboard', label: 'Início', icon: HomeIcon },
    { path: '/assessment/new?instrument=crianca-3-14', label: 'Nova', icon: PlusIcon },
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
    padding: '8px 16px',
    borderRadius: '12px',
    background: active ? colors['brand-cyan'] : 'transparent',
    transition: 'background 0.15s ease',
    minWidth: '64px',
    minHeight: '52px',
    fontFamily: typography.caption.font,
    fontSize: '11px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  });

  return (
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
        {tabs.map((tab) => {
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

        {session && (
          <button
            onClick={handleSignOut}
            style={tabStyle(false)}
          >
            <ExitIcon width={22} height={22} style={{ flexShrink: 0 }} />
            <span>Sair</span>
          </button>
        )}
      </div>
    </Box>
  );
};

export default BottomNav;
