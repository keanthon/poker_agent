import { describe, it, expect } from 'vitest';
import { agentStyles } from '../agentStyles';
import { gameStyles } from '../gameStyles';
import { agentSeatStyles, pokerTableStyles, agentDetailViewStyles } from '../tableStyles';

describe('Style Functions', () => {
  describe('agentStyles', () => {
    it('agentCard function returns correct styles based on isSelected', () => {
      const selectedStyles = agentStyles.agentCard(true);
      expect(selectedStyles.border).toBe('1px solid rgba(255, 120, 120, 0.4)');
      expect(selectedStyles.transform).toBe('translateY(-4px)');

      const unselectedStyles = agentStyles.agentCard(false);
      expect(unselectedStyles.border).toBe('1px solid rgba(255, 255, 255, 0.15)');
      expect(unselectedStyles.transform).toBe('none');
    });
  });

  describe('gameStyles', () => {
    it('playerAvatarContainer returns correct styles based on isCurrentTurn', () => {
      const activeStyle = gameStyles.playerAvatarContainer(true);
      expect(activeStyle.border).toBe('3px solid #facc15'); // Yellow

      const inactiveStyle = gameStyles.playerAvatarContainer(false);
      expect(inactiveStyle.border).toBe('3px solid rgba(255,255,255,0.2)');
    });

    it('btnCall returns expected CSS properties', () => {
      const callStyle = gameStyles.btnCall;
      expect(callStyle).toHaveProperty('cursor', 'pointer');
      expect(callStyle).toHaveProperty('background');
    });
  });

  describe('tableStyles (agentSeatStyles)', () => {
    it('container dynamically returns left/top positioning', () => {
      const style = agentSeatStyles.container(50, 60);
      expect(style.left).toBe('50%');
      expect(style.top).toBe('60%');
    });
    
    it('confidenceBar dynamically returns width', () => {
      const style = agentSeatStyles.confidenceBar(75);
      expect(style.width).toBe('75%');
    });
  });

  describe('tableStyles (pokerTableStyles)', () => {
    it('chipStackWrapper translates properly', () => {
      const style = pokerTableStyles.chipStackWrapper(3);
      expect(style.transform).toBe('translateY(-6px)');
    });
  });
  
  describe('tableStyles (agentDetailViewStyles)', () => {
    it('confidenceBar dynamically returns width', () => {
      const style = agentDetailViewStyles.confidenceBar(80);
      expect(style.width).toBe('80%');
    });
  });
});
