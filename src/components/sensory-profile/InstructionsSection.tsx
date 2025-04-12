import React from 'react';
import { Text, Box, Flex, Card } from '@radix-ui/themes';

const InstructionsSection: React.FC = () => {
  return (
    <Box mb="6">
      <Text size="5" weight="bold" mb="3">Instruções</Text>
      <Card size="2">
        <Text as="p" mb="3">
          Por favor, responda as questões abaixo considerando o comportamento da criança. Indique a frequência com que a criança apresenta cada comportamento.
        </Text>
        <Flex direction="column" gap="2">
          <Flex gap="2">
            <Text weight="bold">Sempre (5):</Text>
            <Text>Quando apresentado, a resposta é sempre dessa maneira (100% do tempo).</Text>
          </Flex>
          <Flex gap="2">
            <Text weight="bold">Frequentemente (4):</Text>
            <Text>Quando apresentado, a resposta é frequentemente dessa maneira (75% do tempo).</Text>
          </Flex>
          <Flex gap="2">
            <Text weight="bold">Ocasionalmente (3):</Text>
            <Text>Quando apresentado, a resposta é ocasionalmente dessa maneira (50% do tempo).</Text>
          </Flex>
          <Flex gap="2">
            <Text weight="bold">Raramente (2):</Text>
            <Text>Quando apresentado, a resposta é raramente dessa maneira (25% do tempo).</Text>
          </Flex>
          <Flex gap="2">
            <Text weight="bold">Nunca (1):</Text>
            <Text>Quando apresentado, a resposta nunca é dessa maneira (0% do tempo).</Text>
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
};

export default InstructionsSection;
