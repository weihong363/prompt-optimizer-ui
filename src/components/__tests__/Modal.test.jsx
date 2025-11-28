// Mock styled-components以避免CSS渲染问题
jest.mock('styled-components', () => {
  // 创建一个简单的标签函数生成器
  const createStyledComponent = (tagName) => {
    // 标签函数需要接受模板字符串
    return function(styles) {
      // 返回一个组件函数
      return function Component({ children, onClick, type, className, ...props }) {
        // 返回一个简单的React元素对象
        return {
          type: tagName, // 这里直接返回标签名作为type
          props: {
            ...props,
            children,
            onClick,
            type,
            className
          },
          // 添加一个displayName以便于调试
          displayName: `Styled.${tagName}`
        };
      };
    };
  };
  
  // 创建styled对象，包含所有需要的HTML标签
  const styled = {
    div: createStyledComponent('div'),
    h3: createStyledComponent('h3'),
    p: createStyledComponent('p'),
    button: createStyledComponent('button'),
    span: createStyledComponent('span')
  };
  
  // 导出styled对象作为默认导出
  return styled;
});

// 导入Modal组件
import Modal from '../Modal';

describe('Modal组件测试', () => {
  // 基本测试
  test('组件导入测试', () => {
    expect(Modal).toBeDefined();
    expect(typeof Modal).toBe('function');
  });

  // 测试isOpen=false时不渲染
  test('当isOpen为false时不应渲染任何内容', () => {
    const result = Modal({
      isOpen: false,
      onClose: jest.fn(),
      message: '测试消息'
    });
    expect(result).toBeNull();
  });

  // 测试isOpen=true时应该返回一个React组件
  test('当isOpen为true时应返回一个组件实例', () => {
    const onClose = jest.fn();
    const result = Modal({
      isOpen: true,
      onClose,
      message: '测试消息',
      type: 'info',
      title: '自定义标题'
    });
    
    // 验证返回的不是null
    expect(result).not.toBeNull();
    // 验证返回的是一个对象（React元素）
    expect(typeof result).toBe('object');
  });

  // 测试不同类型的模态框都能正确处理
  test('应能正确处理不同类型的模态框', () => {
    const onClose = jest.fn();
    
    // 测试success类型
    const successModal = Modal({
      isOpen: true,
      onClose,
      message: '成功消息',
      type: 'success'
    });
    
    // 测试error类型
    const errorModal = Modal({
      isOpen: true,
      onClose,
      message: '错误消息',
      type: 'error'
    });
    
    // 测试warning类型
    const warningModal = Modal({
      isOpen: true,
      onClose,
      message: '警告消息',
      type: 'warning'
    });
    
    // 测试默认info类型
    const infoModal = Modal({
      isOpen: true,
      onClose,
      message: '提示消息'
    });
    
    // 验证所有类型都能正确处理而不报错
    expect(successModal).not.toBeNull();
    expect(errorModal).not.toBeNull();
    expect(warningModal).not.toBeNull();
    expect(infoModal).not.toBeNull();
  });

  // 测试自定义标题参数
  test('应能正确接收自定义标题参数', () => {
    const onClose = jest.fn();
    const customTitle = '自定义成功标题';
    
    // 不应该抛出异常
    const result = Modal({
      isOpen: true,
      onClose,
      message: '测试消息',
      type: 'success',
      title: customTitle
    });
    
    expect(result).not.toBeNull();
  });

  // 测试不传onClose参数时的行为
  test('当未提供onClose参数时不应报错', () => {
    // 不应该抛出异常
    expect(() => {
      Modal({
        isOpen: true,
        message: '测试消息'
      });
    }).not.toThrow();
  });

  // 测试不传message参数时的行为
  test('当未提供message参数时不应报错', () => {
    // 不应该抛出异常
    expect(() => {
      Modal({
        isOpen: true,
        onClose: jest.fn()
      });
    }).not.toThrow();
  });
});