import React from 'react';

const InstructionsSection: React.FC = () => {
  return (
    <div className="instructions-section">
      <h2 className="section-title">Instruções</h2>
      <p>
        Por favor, responda as questões abaixo considerando o comportamento da criança. Indique a frequência com que a criança apresenta cada comportamento.
      </p>
      <div className="frequency-legend">
        <div className="frequency-item">
          <span className="frequency-label">Sempre (5):</span>
          <span className="frequency-description">Quando apresentado, a resposta é sempre dessa maneira (100% do tempo).</span>
        </div>
        <div className="frequency-item">
          <span className="frequency-label">Frequentemente (4):</span>
          <span className="frequency-description">Quando apresentado, a resposta é frequentemente dessa maneira (75% do tempo).</span>
        </div>
        <div className="frequency-item">
          <span className="frequency-label">Ocasionalmente (3):</span>
          <span className="frequency-description">Quando apresentado, a resposta é ocasionalmente dessa maneira (50% do tempo).</span>
        </div>
        <div className="frequency-item">
          <span className="frequency-label">Raramente (2):</span>
          <span className="frequency-description">Quando apresentado, a resposta é raramente dessa maneira (25% do tempo).</span>
        </div>
        <div className="frequency-item">
          <span className="frequency-label">Nunca (1):</span>
          <span className="frequency-description">Quando apresentado, a resposta nunca é dessa maneira (0% do tempo).</span>
        </div>
      </div>
    </div>
  );
};

export default InstructionsSection;
