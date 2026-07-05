import { Outlet } from 'react-router-dom';
import { Box, Container } from '@radix-ui/themes';
import Menu from './Menu';
import BottomNav from './BottomNav';
import DelegationBanner from './DelegationBanner';
import { colors } from '../theme/tokens';

const Layout = () => {
  return (
    <Box style={{ minHeight: '100vh', backgroundColor: colors.canvas }}>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <DelegationBanner />
      <Menu />
      <Container
        size="4"
        py="8"
        px={{ initial: '4', sm: '6', md: '8' }}
        style={{
          maxWidth: '1200px',
        }}
      >
        {/* outline suprimido: o alvo do skip link recebe foco programático,
            não precisa de anel em volta do conteúdo inteiro */}
        <main id="main-content" tabIndex={-1} style={{ paddingBottom: '80px', outline: 'none' }}>
          <Outlet />
        </main>
      </Container>
      <BottomNav />
    </Box>
  );
};

export default Layout;
