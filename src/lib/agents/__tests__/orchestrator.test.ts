import { describe, it, expect } from 'vitest';
import { convertToGameAction, createChatMessage } from '../orchestrator';
import { ActionType } from '../../poker';

describe('agent orchestrator utilities', () => {
  it('convertToGameAction limits to valid actions', () => {
    const valid: ActionType[] = ['fold', 'check', 'all_in'];

    // Trying to 'call' when 'call' is not valid
    const action1 = convertToGameAction('p1', { name: 'call' }, valid);
    // Since 'call' isn't valid, but 'check' is, it defaults to 'check' or valid[0]
    expect(['check', 'fold']).toContain(action1.type);
    
    // Trying to 'raise' with amount when valid
    const valid2: ActionType[] = ['fold', 'call', 'raise', 'all_in'];
    const action2 = convertToGameAction('p1', { name: 'raise', arguments: { amount: 100 } }, valid2);
    expect(action2.type).toBe('raise');
    expect(action2.amount).toBe(100);
    
    // Missing action falls back to fold
    const action3 = convertToGameAction('p1', undefined, valid);
    expect(action3.type).toBe('fold');
  });

  it('createChatMessage constructs valid chat objects', () => {
    const chatReq = { message: 'I see your raise', tone: 'confident' as const };
    const msg = createChatMessage('agent-123', 'Botman', chatReq);
    
    expect(msg).toBeDefined();
    expect(msg?.agentId).toBe('agent-123');
    expect(msg?.agentName).toBe('Botman');
    expect(msg?.message).toBe('I see your raise');
    expect(msg?.tone).toBe('confident');
    expect(msg?.timestamp).toBeGreaterThan(0);
  });

  it('createChatMessage returns null if no message', () => {
    const msg = createChatMessage('a1', 'Bot', undefined);
    expect(msg).toBeNull();
  });
});
