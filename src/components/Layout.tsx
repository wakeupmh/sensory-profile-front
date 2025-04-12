import { Outlet } from 'react-router-dom';
import { Box, Container } from '@radix-ui/themes';
import Menu from './Menu';

const Layout = () => {
  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--gray-2)' }}>
      <Menu />
      <Container py="6" px={{ sm: '6', md: '8' }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;
