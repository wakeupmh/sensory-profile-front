import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flex } from '@radix-ui/themes';
import GumroadCard from './design-system/GumroadCard';
import GumroadButton from './design-system/GumroadButton';
import GumroadHeading, { GumroadText } from './design-system/GumroadHeading';

interface NotFoundProps {
  title?: string;
  message?: string;
  buttonText?: string;
  redirectTo?: string;
}

const NotFound: React.FC<NotFoundProps> = ({
  title,
  message,
  buttonText,
  redirectTo = '/dashboard',
}) => {
  const { t } = useTranslation();

  return (
    <GumroadCard color="cream" shadow="md" padding="xl">
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap="5"
        py="9"
        px="6"
      >
        <GumroadHeading level="display-xl" as="h1" style={{ opacity: 0.3 }}>
          404
        </GumroadHeading>
        <GumroadHeading level="display-md" as="h2">
          {title ?? t('notFound.title')}
        </GumroadHeading>
        <GumroadText level="body-md" as="p" style={{ textAlign: 'center', maxWidth: '400px', opacity: 0.8 }}>
          {message ?? t('notFound.message')}
        </GumroadText>
        <GumroadButton variant="primary" size="md" asChild>
          <Link to={redirectTo} style={{ textDecoration: 'none' }}>
            {buttonText ?? t('notFound.back')}
          </Link>
        </GumroadButton>
      </Flex>
    </GumroadCard>
  );
};

export default NotFound;
