import React from 'react';
import { Heading, Text } from '@radix-ui/themes';
import { typography } from '../../theme/tokens';

type HeadingLevel = 'display-xl' | 'display-lg' | 'display-md' | 'display-sm' | 'title-lg' | 'title-md' | 'title-sm';
type BodyLevel = 'body-lg' | 'body-md' | 'body-sm' | 'caption' | 'caption-uppercase' | 'button' | 'nav-link';
type HeadingAs = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type TextAs = 'span' | 'p' | 'div' | 'label';

interface GumroadHeadingProps {
  children: React.ReactNode;
  level: HeadingLevel;
  as?: HeadingAs;
  style?: React.CSSProperties;
  className?: string;
  color?: string;
}

interface GumroadTextProps {
  children: React.ReactNode;
  level: BodyLevel;
  as?: TextAs;
  style?: React.CSSProperties;
  className?: string;
  color?: string;
}

const GumroadHeading: React.FC<GumroadHeadingProps> = ({ children, level, as, style, className, color }) => {
  const t = typography[level];
  return (
    <Heading
      as={as}
      className={className}
      style={{
        fontFamily: t.font,
        fontSize: t.size,
        fontWeight: t.weight,
        lineHeight: t.lh,
        letterSpacing: t.ls,
        color: color || 'inherit',
        ...style,
      }}
    >
      {children}
    </Heading>
  );
};

export const GumroadText: React.FC<GumroadTextProps> = ({ children, level, as = 'span', style, className, color }) => {
  const t = typography[level];
  return (
    <Text
      as={as}
      className={className}
      style={{
        fontFamily: t.font,
        fontSize: t.size,
        fontWeight: t.weight,
        lineHeight: t.lh,
        letterSpacing: t.ls,
        color: color || 'inherit',
        ...style,
      }}
    >
      {children}
    </Text>
  );
};

export default GumroadHeading;
