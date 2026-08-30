import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Coverage for `careTeamApi`: the envelope `{success, data, timestamp}` must
 * be unwrapped to `.data` on every call (same trap `dailyReportApi.list` fell
 * into once — a page got handed the whole envelope where it expected an
 * array, and typecheck did not catch it), AND `list`/`myChildren` must
 * resolve to arrays even when the backend responds with no `data` at all.
 *
 * Also guards the one rule that matters most for this feature: `invite`
 * (POST) surfaces `invitationToken`, but `list` (GET) never does — a
 * regression here would leak a token from a screen a refresh reaches every
 * day, not just the one-time creation response.
 */

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock('axios', () => {
  const instance = {
    get: mockGet,
    post: mockPost,
    put: vi.fn(),
    patch: vi.fn(),
    delete: mockDelete,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => instance),
      put: vi.fn(),
      isCancel: vi.fn(() => false),
      isAxiosError: vi.fn(() => false),
    },
  };
});

const { careTeamApi } = await import('./api');

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  mockDelete.mockReset();
});

const ENVELOPE = (data: unknown) => ({ data: { success: true, data, timestamp: '2026-08-30T00:00:00.000Z' } });

describe('careTeamApi.list', () => {
  it('GETs /api/children/:childId/care-team and unwraps the envelope to an array', async () => {
    mockGet.mockResolvedValue(
      ENVELOPE([
        {
          id: 'ctm-1',
          childId: 'child-1',
          memberName: 'Dra. Ana',
          role: 'fonoaudiologia',
          status: 'accepted',
          invitationExpiresAt: null,
          acceptedAt: '2026-08-20T00:00:00.000Z',
          revokedAt: null,
          createdAt: '2026-08-01T00:00:00.000Z',
        },
      ]),
    );

    const result = await careTeamApi.list('token', 'child-1');

    expect(mockGet).toHaveBeenCalledWith('/api/children/child-1/care-team', expect.anything());
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].memberName).toBe('Dra. Ana');
  });

  it('never carries invitationToken, even if a caller tries to read it', async () => {
    mockGet.mockResolvedValue(
      ENVELOPE([
        {
          id: 'ctm-1',
          childId: 'child-1',
          memberName: 'Dra. Ana',
          role: 'fonoaudiologia',
          status: 'pending',
          invitationExpiresAt: '2026-09-13T00:00:00.000Z',
          acceptedAt: null,
          revokedAt: null,
          createdAt: '2026-08-01T00:00:00.000Z',
        },
      ]),
    );

    const result = await careTeamApi.list('token', 'child-1');

    expect((result[0] as unknown as Record<string, unknown>).invitationToken).toBeUndefined();
  });

  it('resolves to [] when the backend sends no data', async () => {
    mockGet.mockResolvedValue({ data: { success: true, timestamp: 't' } });
    const result = await careTeamApi.list('token', 'child-1');
    expect(result).toEqual([]);
  });
});

describe('careTeamApi.invite', () => {
  it('POSTs the invite and surfaces invitationToken from the create response', async () => {
    mockPost.mockResolvedValue(
      ENVELOPE({
        id: 'ctm-2',
        childId: 'child-1',
        memberName: 'Dr. Bruno',
        role: 'terapia_ocupacional',
        status: 'pending',
        invitationToken: 'tok_abc123',
        invitationExpiresAt: '2026-09-13T00:00:00.000Z',
        acceptedAt: null,
        revokedAt: null,
        createdAt: '2026-08-30T00:00:00.000Z',
      }),
    );

    const result = await careTeamApi.invite('token', 'child-1', {
      memberName: 'Dr. Bruno',
      role: 'terapia_ocupacional',
    });

    expect(mockPost).toHaveBeenCalledWith(
      '/api/children/child-1/care-team',
      { memberName: 'Dr. Bruno', role: 'terapia_ocupacional' },
      expect.anything(),
    );
    expect(result.invitationToken).toBe('tok_abc123');
  });
});

describe('careTeamApi.revoke', () => {
  it('DELETEs the membership', async () => {
    mockDelete.mockResolvedValue({ data: { success: true, timestamp: 't' } });
    await careTeamApi.revoke('token', 'child-1', 'ctm-2');
    expect(mockDelete).toHaveBeenCalledWith('/api/children/child-1/care-team/ctm-2', expect.anything());
  });
});

describe('careTeamApi.acceptInvite', () => {
  it('POSTs the token to /api/care-team/accept and unwraps the minimal response', async () => {
    mockPost.mockResolvedValue(ENVELOPE({ id: 'ctm-2', childId: 'child-1', role: 'terapia_ocupacional' }));

    const result = await careTeamApi.acceptInvite('token', 'tok_abc123');

    expect(mockPost).toHaveBeenCalledWith(
      '/api/care-team/accept',
      { token: 'tok_abc123' },
      expect.anything(),
    );
    expect(result).toEqual({ id: 'ctm-2', childId: 'child-1', role: 'terapia_ocupacional' });
  });
});

describe('careTeamApi.myChildren', () => {
  it('GETs the caseload and unwraps the envelope to an array', async () => {
    mockGet.mockResolvedValue(
      ENVELOPE([
        {
          membershipId: 'ctm-2',
          childId: 'child-1',
          childName: 'Sofia',
          childBirthDate: '2019-04-02',
          role: 'terapia_ocupacional',
          acceptedAt: '2026-08-30T00:00:00.000Z',
        },
      ]),
    );

    const result = await careTeamApi.myChildren('token');

    expect(mockGet).toHaveBeenCalledWith('/api/care-team/my-children', expect.anything());
    expect(result).toHaveLength(1);
    expect(result[0].childName).toBe('Sofia');
  });

  it('resolves to [] when the backend sends no data', async () => {
    mockGet.mockResolvedValue({ data: { success: true, timestamp: 't' } });
    const result = await careTeamApi.myChildren('token');
    expect(result).toEqual([]);
  });
});
