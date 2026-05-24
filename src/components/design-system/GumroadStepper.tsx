import * as React from 'react';
import { colors, fonts, borders, shadows } from '../../theme/tokens';

export interface StepItem {
  key: string;
  label: string;
}

interface GumroadStepperProps {
  steps: StepItem[];
  current: number;
  completed: Set<number>;
  onStepClick?: (index: number) => void;
}

const CONDENSED_THRESHOLD = 7;

const GumroadStepper: React.FC<GumroadStepperProps> = ({
  steps,
  current,
  completed,
  onStepClick,
}) => {
  const isCondensed = steps.length > CONDENSED_THRESHOLD;

  return (
    <>
      {/* Mobile: compact pill label */}
      <div
        style={{
          display: 'none',
          fontFamily: fonts.display,
          fontSize: '14px',
          fontWeight: 600,
          color: colors.ink,
          padding: '8px 16px',
          background: colors['brand-cyan'],
          border: borders.default,
          borderRadius: '9999px',
          boxShadow: shadows.button,
          marginBottom: '20px',
        }}
        className="stepper-mobile"
      >
        Etapa {current + 1} de {steps.length}: {steps[current]?.label}
      </div>

      {/* Desktop: full stepper (≤7 steps) */}
      {!isCondensed && (
        <div
          className="stepper-desktop"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            position: 'relative',
            marginBottom: '28px',
            padding: '20px 16px 16px',
            background: colors.surface,
            border: borders.default,
            borderRadius: '16px',
            boxShadow: shadows.card,
          }}
        >
          {/* Background connector line */}
          <div
            style={{
              position: 'absolute',
              top: '36px',
              left: '48px',
              right: '48px',
              height: '2px',
              background: colors.ink,
              zIndex: 0,
            }}
          />

          {steps.map((step, i) => {
            const isCompleted = completed.has(i);
            const isCurrent = i === current;
            const isClickable = onStepClick && (isCompleted || isCurrent);

            let circleStyle: React.CSSProperties = {
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: borders.default,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.display,
              fontSize: '13px',
              fontWeight: 700,
              position: 'relative',
              zIndex: 1,
              cursor: isClickable ? 'pointer' : 'default',
              transition: 'transform 0.1s, box-shadow 0.1s',
            };

            if (isCompleted) {
              circleStyle = {
                ...circleStyle,
                background: colors['brand-cyan'],
                color: colors.surface,
                boxShadow: shadows['card-sm'],
              };
            } else if (isCurrent) {
              circleStyle = {
                ...circleStyle,
                background: colors['brand-cyan'],
                color: colors.surface,
                boxShadow: `0 0 0 4px ${colors.surface}, 0 0 0 6px ${colors.ink}`,
              };
            } else {
              circleStyle = {
                ...circleStyle,
                background: colors.surface,
                color: colors.ink,
              };
            }

            return (
              <div
                key={step.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1,
                }}
              >
                <div
                  style={circleStyle}
                  onClick={isClickable ? () => onStepClick!(i) : undefined}
                  title={step.label}
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="white"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: fonts.display,
                    fontSize: '12px',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? colors['brand-cyan'] : isCompleted ? colors.ink : '#888',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    maxWidth: '80px',
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop: condensed dot stepper (>7 steps) */}
      {isCondensed && (
        <div
          className="stepper-desktop"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '28px',
            padding: '16px 20px',
            background: colors.surface,
            border: borders.default,
            borderRadius: '16px',
            boxShadow: shadows.card,
          }}
        >
          {/* Dot row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: '100%',
            }}
          >
            {/* Connector line behind dots */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '16px',
                right: '16px',
                height: '2px',
                background: colors.ink,
                transform: 'translateY(-50%)',
                zIndex: 0,
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {steps.map((step, i) => {
                const isCompleted = completed.has(i);
                const isCurrent = i === current;
                const isClickable = onStepClick && (isCompleted || isCurrent);

                let dotStyle: React.CSSProperties = {
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: borders.default,
                  flexShrink: 0,
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'transform 0.1s',
                  boxSizing: 'border-box',
                };

                if (isCompleted) {
                  dotStyle = {
                    ...dotStyle,
                    background: colors['brand-cyan'],
                  };
                } else if (isCurrent) {
                  // Cyan fill + 2px white inner ring effect via box-shadow
                  dotStyle = {
                    ...dotStyle,
                    background: colors['brand-cyan'],
                    boxShadow: `0 0 0 2px ${colors['brand-cyan']}, 0 0 0 4px #FFFFFF, 0 0 0 6px ${colors.ink}`,
                    border: `2px solid ${colors.ink}`,
                  };
                } else {
                  dotStyle = {
                    ...dotStyle,
                    background: colors.canvas,
                  };
                }

                return (
                  <div
                    key={step.key}
                    style={dotStyle}
                    onClick={isClickable ? () => onStepClick!(i) : undefined}
                    title={`${i + 1}. ${step.label}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Current step label */}
          <div style={{ textAlign: 'center', fontFamily: fonts.display }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#888', marginBottom: '2px' }}>
              Etapa {current + 1} de {steps.length}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: colors['brand-cyan'] }}>
              {steps[current]?.label}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .stepper-mobile { display: flex !important; align-items: center; gap: 8px; }
          .stepper-desktop { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default GumroadStepper;
