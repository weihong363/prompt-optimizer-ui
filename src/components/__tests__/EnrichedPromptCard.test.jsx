// 极简测试策略，只测试组件的基本存在性
import EnrichedPromptCard from '../EnrichedPromptCard';

describe('EnrichedPromptCard组件测试', () => {
  test('组件导入测试', () => {
    // 确保组件能够被正确导入
    expect(EnrichedPromptCard).toBeDefined();
  });

  test('组件应为函数类型', () => {
    // 验证组件类型
    expect(typeof EnrichedPromptCard).toBe('function');
  });

  test('组件名称验证', () => {
    // 验证组件名称或显示名称
    expect(EnrichedPromptCard.name).toBeDefined();
  });
});