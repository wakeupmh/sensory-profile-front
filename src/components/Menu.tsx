import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { 
  Box, 
  Flex, 
  Text, 
  Heading, 
  DropdownMenu,
} from '@radix-ui/themes';
import {
  HomeIcon,
  FileTextIcon,
  ChevronDownIcon,
  ClipboardIcon
} from '@radix-ui/react-icons';

const Menu: React.FC = () => {
  const location = useLocation();

  return (
    <Box 
      position="sticky" 
      top="0" 
      style={{ zIndex: 1000, backgroundColor: 'var(--gray-2)', boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)' }}
    >
      <Flex 
        justify="between" 
        align="center" 
        py="3" 
        px="6"
        style={{ maxWidth: '1200px', margin: '0 auto' }}
      >
        <Flex align="center" gap="6">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Heading size="5" weight="medium" style={{ color: 'var(--violet-9)' }}>
              Perfil Sensorial
            </Heading>
          </Link>
          
          <Flex gap="6" align="center">
            <Link 
              to="/" 
              style={{ 
                textDecoration: 'none',
                color: location.pathname === '/' ? 'var(--violet-9)' : 'var(--gray-11)'
              }}
            >
              <Flex gap="2" align="center">
                <HomeIcon />
                <Text size="2" weight="medium">Início</Text>
              </Flex>
            </Link>
            
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Flex gap="2" align="center" style={{
                  cursor: 'pointer',
                  color: location.pathname.startsWith('/assessment') ? 'var(--violet-9)' : 'var(--gray-11)'
                }}>
                  <FileTextIcon />
                  <Text size="2" weight="medium">Avaliações</Text>
                  <ChevronDownIcon />
                </Flex>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item>
                  <Link to="/assessment/new?instrument=crianca-3-14" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%' }}>
                    Nova avaliação — Criança (3–14 anos)
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/assessment/new?instrument=crianca-pequena" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%' }}>
                    Nova avaliação — Criança Pequena (7–36 meses)
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item>
                  <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%' }}>
                    Listar Avaliações
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Flex gap="2" align="center" style={{
                  cursor: 'pointer',
                  color: location.pathname.startsWith('/anamnese') ? 'var(--violet-9)' : 'var(--gray-11)'
                }}>
                  <ClipboardIcon />
                  <Text size="2" weight="medium">Anamneses</Text>
                  <ChevronDownIcon />
                </Flex>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item>
                  <Link to="/anamnese/new" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%' }}>
                    Nova Anamnese
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/anamneses" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%' }}>
                    Listar Anamneses
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>
        </Flex>
        
        <Flex align="center">
          <UserButton />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Menu;
