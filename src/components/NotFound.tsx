import { Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';

interface NotFoundProps {
  title?: string;
  message?: string;
  buttonText?: string;
  redirectTo?: string;
}

const NotFound: React.FC<NotFoundProps> = ({
  title = 'Não Encontrado',
  message = 'O recurso que você está procurando não foi encontrado.',
  buttonText = 'Voltar para a página inicial',
  redirectTo = '/',
}) => {
  const navigate = useNavigate();

  return (
    <Card size="3">
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap="5"
        py="9"
        px="6"
      >
        <Heading size="8" color="gray">
          404
        </Heading>
        <Heading size="6" color="violet">
          {title}
        </Heading>
        <Text align="center" size="3" color="gray">
          {message}
        </Text>
        <Button
          size="3"
          color="violet"
          onClick={() => navigate(redirectTo)}
        >
          {buttonText}
        </Button>
      </Flex>
    </Card>
  );
};

export default NotFound;
