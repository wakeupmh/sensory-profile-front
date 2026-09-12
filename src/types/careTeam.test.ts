import { describe, expect, it } from 'vitest';
import { CARE_TEAM_ROLES, CARE_TEAM_ROLE_LABEL_KEYS, getCareTeamDisplayStatus, type CareTeamMember } from './careTeam';

/**
 * `getCareTeamDisplayStatus` is what the care-team list's four badges
 * (pendente / ativo / expirado / revogado) are built on — the backend only
 * ever says pending/accepted/revoked, so "expirado" is entirely a frontend
 * computation against the invite's `invitationExpiresAt` and the clock. Get
 * the boundary wrong and a member either looks accepted-forever-pending past
 * its 14-day window, or flips to "expirado" a tick before it should.
 */

function member(overrides: Partial<Pick<CareTeamMember, 'status' | 'invitationExpiresAt'>>): Pick<CareTeamMember, 'status' | 'invitationExpiresAt'> {
  return { status: 'pending', invitationExpiresAt: null, ...overrides };
}

describe('getCareTeamDisplayStatus', () => {
  const now = new Date('2026-08-30T12:00:00.000Z');

  it('is "revoked" whenever status is revoked, regardless of invitationExpiresAt', () => {
    expect(getCareTeamDisplayStatus(member({ status: 'revoked', invitationExpiresAt: '2099-01-01T00:00:00.000Z' }), now)).toBe(
      'revoked',
    );
  });

  it('is "active" once accepted', () => {
    expect(getCareTeamDisplayStatus(member({ status: 'accepted', invitationExpiresAt: null }), now)).toBe('active');
  });

  it('is "pending" while the invite is still within its validity window', () => {
    expect(
      getCareTeamDisplayStatus(member({ status: 'pending', invitationExpiresAt: '2026-08-31T00:00:00.000Z' }), now),
    ).toBe('pending');
  });

  it('is "expired" once invitationExpiresAt has passed and no one accepted', () => {
    expect(
      getCareTeamDisplayStatus(member({ status: 'pending', invitationExpiresAt: '2026-08-01T00:00:00.000Z' }), now),
    ).toBe('expired');
  });

  it('treats the exact expiry instant as already expired (boundary is inclusive)', () => {
    expect(
      getCareTeamDisplayStatus(member({ status: 'pending', invitationExpiresAt: now.toISOString() }), now),
    ).toBe('expired');
  });

  it('is "pending" (never "expired") when invitationExpiresAt is null', () => {
    expect(getCareTeamDisplayStatus(member({ status: 'pending', invitationExpiresAt: null }), now)).toBe('pending');
  });
});

describe('CARE_TEAM_ROLE_LABEL_KEYS', () => {
  it('has exactly one label per role — no role silently falls back to undefined', () => {
    for (const role of CARE_TEAM_ROLES) {
      expect(CARE_TEAM_ROLE_LABEL_KEYS[role]).toBeTruthy();
    }
    expect(Object.keys(CARE_TEAM_ROLE_LABEL_KEYS).sort()).toEqual([...CARE_TEAM_ROLES].sort());
  });
});
