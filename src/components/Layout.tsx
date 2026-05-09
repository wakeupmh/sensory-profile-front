import { Outlet } from 'react-router-dom';
import { Box, Container } from '@radix-ui/themes';
import Menu from './Menu';
import BottomNav from './BottomNav';
import { colors } from '../theme/tokens';

const Layout = () => {
  return (
    <Box style={{ minHeight: '100vh', backgroundColor: colors.canvas }}>
      <Menu />
      <Container
        size="4"
        py="8"
        px={{ initial: '4', sm: '6', md: '8' }}
        style={{
          maxWidth: '1200px',
        }}
      >
        <div style={{ paddingBottom: '80px' }}>
          <Outlet />
        </div>
      </Container>
      <BottomNav />
    </Box>
  );
};

export default Layout;
