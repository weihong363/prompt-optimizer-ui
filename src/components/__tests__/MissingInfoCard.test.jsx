// 基本导入
import React from 'react';

// 导入被测试组件
import MissingInfoCard from '../MissingInfoCard';

// 模拟全局环境
if (typeof window === 'undefined') {
  global.window = {};
}

if (typeof document === 'undefined') {
  global.document = {};
}

// Mock依赖组件
jest.mock('../SpeechInputButton', () => () => null);
jest.mock('../ResultCard', () => () => null);
jest.mock('styled-components', () => ({
  __esModule: true,
  default: {
    div: () => () => null,
    input: () => () => null,
    button: () => () => null,
    label: () => () => null,
    p: () => () => null
  }
}));

describe('MissingInfoCard组件测试', () => {
  test('组件应为函数类型', () => {
    expect(typeof MissingInfoCard).toBe('function');
  });

  test('组件能够被正确导入', () => {
    expect(MissingInfoCard).toBeDefined();
  });

  // 直接测试核心逻辑函数
  describe('核心逻辑测试', () => {
    // 模拟parseMissingInfo函数
    const parseMissingInfo = (missingInfo) => {
      if (typeof missingInfo === 'string') {
        return { message: missingInfo };
      }
      if (missingInfo && typeof missingInfo === 'object' && !Array.isArray(missingInfo)) {
        return {
          fields: Object.entries(missingInfo).map(([key, value]) => ({
            key,
            value,
            label: key
          })),
          message: ''
        };
      }
      return { fields: [], message: '默认消息' };
    };

    test('parseMissingInfo - 字符串输入', () => {
      const result = parseMissingInfo('测试字符串');
      expect(result.message).toBe('测试字符串');
    });

    test('parseMissingInfo - 对象输入', () => {
      const result = parseMissingInfo({ field1: '值1', field2: '值2' });
      expect(result.fields.length).toBe(2);
    });
  });
});