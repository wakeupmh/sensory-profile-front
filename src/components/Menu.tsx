import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Box, Flex } from '@radix-ui/themes';
import {
  HomeIcon,
  FileTextIcon,
  ClipboardIcon,
  PersonIcon,
  ExitIcon,
  ActivityLogIcon,
  PlusCircledIcon,
  HeartIcon,
  BarChartIcon,
  ReaderIcon,
  ChevronDownIcon,
  Share1Icon,
  EnvelopeOpenIcon,
  EyeOpenIcon,
  TargetIcon,
  ArchiveIcon,
  GroupIcon,
  CalendarIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import { colors, typography, zIndex, shadows } from '../theme/tokens';
import GumroadButton from './design-system/GumroadButton';
import DelegationSwitcher from './DelegationSwitcher';

type NavItem = { path: string; match: string; label: string; icon: React.ComponentType<{ width?: number; height?: number }> };

// Links mais usados ficam inline; o resto vai para o menu "Mais" (espelha a navegação mobile)
const PRIMARY: NavItem[] = [
  { path: '/dashboard', match: '/dashboard', label: 'Início', icon: HomeIcon },
  { path: '/assessment/new', match: '/assessment', label: 'Avaliações', icon: FileTextIcon },
  { path: '/anamneses', match: '/anamnese', label: 'Anamneses', icon: ClipboardIcon },
  { path: '/children', match: '/children', label: 'Crianças', icon: PersonIcon },
];

const SECONDARY: NavItem[] = [
  { path: '/logs', match: '/logs', label: 'Registros', icon: ActivityLogIcon },
  { path: '/medical', match: '/medical', label: 'Saúde', icon: PlusCircledIcon },
  { path: '/therapy', match: '/therapy', label: 'Terapia', icon: HeartIcon },
  { path: '/development', match: '/development', label: 'Desenvolvimento', icon: BarChartIcon },
  { path: '/education', match: '/education', label: 'Educação', icon: ReaderIcon },
  { path: '/goals', match: '/goals', label: 'Metas', icon: TargetIcon },
  { path: '/documents', match: '/documents', label: 'Documentos', icon: ArchiveIcon },
  { path: '/monthly-recap', match: '/monthly-recap', label: 'Resumo do mês', icon: CalendarIcon },
  { path: '/professionals', match: '/professionals', label: 'Profissionais', icon: Share1Icon },
  { path: '/shared', match: '/shared', label: 'Compartilhados comigo', icon: EyeOpenIcon },
  { path: '/shared/children', match: '/shared/children', label: 'Crianças compartilhadas', icon: GroupIcon },
  { path: '/invite/accept', match: '/invite', label: 'Aceitar convite', icon: EnvelopeOpenIcon },
  { path: '/settings', match: '/settings', label: 'Configurações', icon: GearIcon },
];

const Menu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, session } = useAuthContext();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const handleSignOut = () => signOut().then(() => navigate('/sign-in', { replace: true }));

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  // Fecha o dropdown ao navegar
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [moreOpen]);

  // Escape fecha o dropdown e devolve o foco ao botão "Mais"
  useEffect(() => {
    if (!moreOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [moreOpen]);

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
    whiteSpace: 'nowrap',
    border: 'none',
    cursor: 'pointer',
  });

  const moreItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    textDecoration: 'none',
    color: colors.ink,
    fontFamily: typography['nav-link'].font,
    fontSize: typography['nav-link'].size,
    fontWeight: typography['nav-link'].weight,
    borderRadius: '10px',
    whiteSpace: 'nowrap',
    background: active ? colors['brand-cyan'] : 'transparent',
    transition: 'background 0.12s ease',
  });

  const isSecondaryActive = SECONDARY.some((t) => isActive(t.match));

  return (
    <Box
      asChild
      position="sticky"
      top="0"
      style={{
        zIndex: zIndex.menu,
        backgroundColor: colors.canvas,
        borderBottom: `2px solid ${colors.ink}`,
      }}
    >
      <header>
        <Flex
          justify="between"
          align="center"
          py="3"
          px={{ initial: '4', sm: '6' }}
          style={{ maxWidth: '1200px', margin: '0 auto' }}
        >
          <Flex align="center" gap="5">
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontFamily: typography['display-sm'].font,
                  fontSize: '20px',
                  fontWeight: 700,
                  color: colors.ink,
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                Perfil Sensorial
              </span>
            </Link>

            {/* Desktop nav links */}
            <Flex asChild gap="2" align="center" display={{ initial: 'none', md: 'flex' }}>
              <nav aria-label="Navegação principal">
                {PRIMARY.map(({ path, match, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    style={navLinkStyle(isActive(match))}
                    aria-current={isActive(match) ? 'page' : undefined}
                  >
                    <Icon width={16} height={16} />
                    {label}
                  </Link>
                ))}

                {/* "Mais" — padrão de navegação com disclosure (WAI), sem roles de menu */}
                <div ref={moreRef} style={{ position: 'relative' }}>
                  <button
                    ref={moreButtonRef}
                    onClick={() => setMoreOpen((v) => !v)}
                    style={navLinkStyle(isSecondaryActive || moreOpen)}
                    aria-expanded={moreOpen}
                    aria-controls="menu-mais"
                  >
                    Mais
                    <ChevronDownIcon
                      width={16}
                      height={16}
                      style={{ transform: moreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
                    />
                  </button>

                  {moreOpen && (
                    <div
                      id="menu-mais"
                      className="dropdown-menu"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        left: 0,
                        minWidth: '220px',
                        background: '#fff',
                        border: `2px solid ${colors.ink}`,
                        borderRadius: '14px',
                        boxShadow: shadows.card,
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      {SECONDARY.map(({ path, match, label, icon: Icon }) => (
                        <Link
                          key={path}
                          to={path}
                          style={moreItemStyle(isActive(match))}
                          aria-current={isActive(match) ? 'page' : undefined}
                        >
                          <Icon width={18} height={18} />
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </nav>
            </Flex>
          </Flex>

          <DelegationSwitcher />

          <Flex align="center" display={{ initial: 'none', md: 'flex' }}>
            {session ? (
              <GumroadButton variant="secondary" size="sm" onClick={handleSignOut}>
                <ExitIcon />
                Sair
              </GumroadButton>
            ) : (
              <GumroadButton variant="primary" size="sm" onClick={() => navigate('/sign-in')}>
                Entrar
              </GumroadButton>
            )}
          </Flex>
        </Flex>
      </header>
    </Box>
  );
};

export default Menu;
