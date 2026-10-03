import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { Box, Flex } from '@radix-ui/themes';
import { ExitIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { colors, typography, zIndex, shadows } from '../theme/tokens';
import GumroadButton from './design-system/GumroadButton';
import DelegationSwitcher from './DelegationSwitcher';
import GlobalSearch from './GlobalSearch';
import { useCareTeamCaseload } from '../hooks/useCareTeamCaseload';
import { useClinicMembership } from '../hooks/useClinicMembership';
import { PRIMARY_ITEMS, buildMoreGroups, isNavItemActive } from './navConfig';
import type { NavItem } from './navConfig';

const Menu: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, session } = useAuthContext();
  const hasCareTeamCaseload = useCareTeamCaseload();
  const belongsToClinic = useClinicMembership();
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreGroups = buildMoreGroups({ careTeam: hasCareTeamCaseload, clinics: belongsToClinic });

  const handleSignOut = () => signOut().then(() => navigate('/sign-in', { replace: true }));

  const isActive = (item: NavItem) => isNavItemActive(location.pathname, item);

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

  const isSecondaryActive = moreGroups.some((g) => g.items.some(isActive));

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
              <nav aria-label={t('nav.mainNavLabel')}>
                {PRIMARY_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={navLinkStyle(isActive(item))}
                    aria-current={isActive(item) ? 'page' : undefined}
                  >
                    <item.icon width={16} height={16} />
                    {t(item.labelKey)}
                  </Link>
                ))}

                {/* "Mais" — padrão de navegação com disclosure (WAI), sem roles de menu */}
                <div
                  ref={moreRef}
                  style={{ position: 'relative' }}
                  onBlur={(e) => {
                    // Foco saiu do disclosure (Tab para fora): fecha
                    if (moreOpen && !e.currentTarget.contains(e.relatedTarget as Node | null)) setMoreOpen(false);
                  }}
                >
                  <button
                    type="button"
                    ref={moreButtonRef}
                    onClick={() => setMoreOpen((v) => !v)}
                    style={navLinkStyle(isSecondaryActive || moreOpen)}
                    aria-expanded={moreOpen}
                    aria-controls={moreOpen ? 'menu-mais' : undefined}
                  >
                    {t('nav.more')}
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
                        minWidth: '240px',
                        maxHeight: 'calc(100vh - 100px)',
                        overflowY: 'auto',
                        background: colors.surface,
                        border: `2px solid ${colors.ink}`,
                        borderRadius: '14px',
                        boxShadow: shadows.card,
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      {moreGroups.map((group) => (
                        <div key={group.id} role="group" aria-labelledby={`menu-mais-${group.id}`}>
                          <div
                            id={`menu-mais-${group.id}`}
                            style={{
                              fontFamily: typography.caption.font,
                              fontSize: '11px',
                              fontWeight: 700,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: colors['ink-muted'],
                              padding: '8px 14px 4px',
                            }}
                          >
                            {t(group.labelKey)}
                          </div>
                          {group.items.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              style={moreItemStyle(isActive(item))}
                              aria-current={isActive(item) ? 'page' : undefined}
                            >
                              <item.icon width={18} height={18} />
                              {t(item.labelKey)}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </nav>
            </Flex>
          </Flex>

          <DelegationSwitcher />

          <Flex align="center" gap="3" display={{ initial: 'none', md: 'flex' }}>
            {session && (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={t('navExtra.search')}
                style={{
                  ...navLinkStyle(false),
                  padding: '8px',
                }}
              >
                <MagnifyingGlassIcon width={18} height={18} />
              </button>
            )}
            {session ? (
              <GumroadButton variant="secondary" size="sm" onClick={handleSignOut}>
                <ExitIcon />
                {t('nav.signOut')}
              </GumroadButton>
            ) : (
              <GumroadButton variant="primary" size="sm" onClick={() => navigate('/sign-in')}>
                {t('nav.signIn')}
              </GumroadButton>
            )}
          </Flex>
        </Flex>
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </header>
    </Box>
  );
};

export default Menu;
