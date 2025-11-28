// 极简测试，只确保组件能被导入                                                          
import OptimizationCard from '../OptimizationCard';

describe('OptimizationCard组件测试', () => {
  test('组件导入测试', () => {
    // 只检查组件是否被成功导入
    expect(OptimizationCard).toBeDefined();
  });
}); 