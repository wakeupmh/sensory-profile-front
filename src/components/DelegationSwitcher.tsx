import { useDelegation } from '../context/DelegationContext';
import { colors, radii, shadows, fonts } from '../theme/tokens';

const DelegationSwitcher: React.FC = () => {
  const { delegateChild, caregiverChildren, startDelegating, stopDelegating } = useDelegation();

  if (caregiverChildren.length === 0) return null;

  return (
    <select
      value={delegateChild?.id ?? ''}
      onChange={(e) => {
        const id = e.target.value;
        if (!id) {
          stopDelegating();
          return;
        }
        const child = caregiverChildren.find((c) => c.id === id);
        if (child) startDelegating(child);
      }}
      aria-label="Visualizando"
      style={{
        height: '36px',
        padding: '0 10px',
        border: `2px solid ${colors.ink}`,
        borderRadius: radii.pill,
        backgroundColor: delegateChild ? colors['brand-peach'] : colors.canvas,
        fontFamily: fonts.display,
        fontSize: '13px',
        fontWeight: 700,
        color: colors.ink,
        cursor: 'pointer',
        boxShadow: shadows['card-sm'],
        maxWidth: '220px',
      }}
    >
      <option value="">Visualizando: Minhas crianças</option>
      {caregiverChildren.map((c) => (
        <option key={c.id} value={c.id}>
          Visualizando: {c.name} (cuidador)
        </option>
      ))}
    </select>
  );
};

export default DelegationSwitcher;
