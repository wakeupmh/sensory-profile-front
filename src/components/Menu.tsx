import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Box, Flex } from '@radix-ui/themes';
import { HomeIcon, FileTextIcon, ClipboardIcon, PersonIcon, ExitIcon } from '@radix-ui/react-icons';
import { colors, typography, zIndex } from '../theme/tokens';
import GumroadButton from './design-system/GumroadButton';

const Menu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, session } = useAuthContext();

  const handleSignOut = () => signOut().then(() => navigate('/sign-in', { replace: true }));

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: typography['nav-link'].font,
    fontSize: typography['nav-link'].size,
    fontWeight: typography['nav-link'].weight,
    lineHeight: typography['nav-link'].lh,
    color: colors.ink,
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'background 0.15s ease',
    background: active ? colors['brand-cyan'] : 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  });

  return (
    <Box
      position="sticky"
      top="0"
      style={{
        zIndex: zIndex.menu,
        backgroundColor: colors.canvas,
        borderBottom: `2px solid ${colors.ink}`,
      }}
    >
      <Flex
        justify="between"
        align="center"
        py="3"
        px={{ initial: '4', sm: '6' }}
        style={{ maxWidth: '1200px', margin: '0 auto' }}
      >
        <Flex align="center" gap="6">
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontFamily: typography['display-sm'].font,
                fontSize: '20px',
                fontWeight: 700,
                color: colors.ink,
                letterSpacing: '-0.02em',
              }}
            >
              Perfil Sensorial
            </span>
          </Link>

          {/* Desktop nav links */}
          <Flex gap="2" align="center" display={{ initial: 'none', md: 'flex' }}>
            <Link to="/dashboard" style={navLinkStyle(isActive('/dashboard'))}>
              <HomeIcon width={16} height={16} />
              Início
            </Link>
            <Link
              to="/assessment/new"
              style={navLinkStyle(isActive('/assessment'))}
            >
              <FileTextIcon width={16} height={16} />
              Avaliações
            </Link>
            <Link to="/anamneses" style={navLinkStyle(isActive('/anamnese'))}>
              <ClipboardIcon width={16} height={16} />
              Anamneses
            </Link>
            <Link to="/children" style={navLinkStyle(isActive('/children'))}>
              <PersonIcon width={16} height={16} />
              Crianças
            </Link>
          </Flex>
        </Flex>

        <Flex align="center" display={{ initial: 'none', md: 'flex' }}>
          {session ? (
            <GumroadButton variant="secondary" size="sm" onClick={handleSignOut}>
              <ExitIcon />
              Sair
            </GumroadButton>
          ) : (
            <GumroadButton
              variant="primary"
              size="sm"
              onClick={() => navigate('/sign-in')}
            >
              Entrar
            </GumroadButton>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Menu;
