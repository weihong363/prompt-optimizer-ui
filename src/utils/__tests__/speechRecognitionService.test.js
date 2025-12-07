import speechRecognitionService from '../speechRecognitionService';

// 模拟SpeechRecognition API
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'zh-CN';
    this.onresult = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.onnomatch = null;
    this.start = jest.fn();
    this.stop = jest.fn();
    this.abort = jest.fn();
  }

  // 模拟识别结果
  simulateResult(results) {
    if (this.onresult) {
      this.onresult({
        results,
        resultIndex: 0
      });
    }
  }

  // 模拟错误
  simulateError(error) {
    if (this.onerror) {
      this.onerror({ error });
    }
  }

  // 模拟开始事件
  simulateStart() {
    if (this.onstart) {
      this.onstart();
    }
  }

  // 模拟结束事件
  simulateEnd() {
    if (this.onend) {
      this.onend();
    }
  }
}

// 模拟webkitSpeechRecognition和SpeechRecognition
Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: MockSpeechRecognition,
  writable: true
});

Object.defineProperty(window, 'SpeechRecognition', {
  value: MockSpeechRecognition,
  writable: true
});

describe('SpeechRecognitionService', () => {
  beforeEach(() => {
    // 重置服务状态
    jest.clearAllMocks();
    
    // 重置服务的支持状态，让它重新检查
    speechRecognitionService.supported = speechRecognitionService.checkSupport();
    speechRecognitionService.recognition = null;
    speechRecognitionService.transcript = '';
    speechRecognitionService.isListening = false;
  });

  test('should check browser support correctly', () => {
    const supported = speechRecognitionService.checkSupport();
    expect(supported).toBe(true);
  });

  test('should initialize recognition instance', () => {
    const result = speechRecognitionService.init();
    expect(result).toBe(true);
  });

  test('should start and stop recognition', () => {
    speechRecognitionService.init();
    const startResult = speechRecognitionService.start();
    expect(startResult).toBe(true);
    
    // 模拟start事件，设置isListening为true
    speechRecognitionService.recognition.simulateStart();
    
    const stopResult = speechRecognitionService.stop();
    expect(stopResult).toBe(true);
  });

  test('should handle recognition results correctly', () => {
    speechRecognitionService.init();
    
    let callbackResult = '';
    speechRecognitionService.setCallbacks({
      onResult: (transcript) => {
        callbackResult = transcript;
      }
    });
    
    // 模拟最终结果
    speechRecognitionService.recognition.simulateResult([
      {
        [0]: { transcript: '你好', isFinal: true },
        length: 1,
        isFinal: true
      }
    ]);
    
    expect(callbackResult).toBe('你好');
    
    // 模拟中间结果
    speechRecognitionService.recognition.simulateResult([
      {
        [0]: { transcript: '你好', isFinal: true },
        length: 1,
        isFinal: true
      },
      {
        [0]: { transcript: '世界', isFinal: false },
        length: 1,
        isFinal: false
      }
    ]);
    
    expect(callbackResult).toBe('你好世界');
  });

  test('should handle network errors and reconnect', () => {
    speechRecognitionService.init();
    
    let callbackError = null;
    speechRecognitionService.setCallbacks({
      onError: (error) => {
        callbackError = error;
      }
    });
    
    // 保存原始reconnect方法以便验证
    const originalReconnect = speechRecognitionService.reconnect;
    const reconnectSpy = jest.spyOn(speechRecognitionService, 'reconnect').mockImplementation(() => {
      console.log('Mock reconnect called');
    });
    
    // 模拟网络错误
    speechRecognitionService.recognition.simulateError('network');
    
    expect(callbackError).toBe('network');
    expect(reconnectSpy).toHaveBeenCalled();
    
    // 恢复原始方法
    reconnectSpy.mockRestore();
  });

  test('should reset transcript on start', () => {
    speechRecognitionService.init();
    
    // 先设置一些文本
    speechRecognitionService.transcript = '旧文本';
    
    // 模拟开始事件
    speechRecognitionService.recognition.simulateStart();
    
    expect(speechRecognitionService.transcript).toBe('');
  });

  test('should combine final and interim results correctly', () => {
    speechRecognitionService.init();
    
    let callbackResult = '';
    speechRecognitionService.setCallbacks({
      onResult: (transcript) => {
        callbackResult = transcript;
      }
    });
    
    // 模拟多个结果
    speechRecognitionService.recognition.simulateResult([
      {
        [0]: { transcript: '最终', isFinal: true },
        length: 1,
        isFinal: true
      },
      {
        [0]: { transcript: '结果', isFinal: true },
        length: 1,
        isFinal: true
      },
      {
        [0]: { transcript: '中间', isFinal: false },
        length: 1,
        isFinal: false
      }
    ]);
    
    expect(callbackResult).toBe('最终结果中间');
  });

  test('should return correct status', () => {
    speechRecognitionService.init();
    const status = speechRecognitionService.getStatus();
    
    expect(status).toEqual({
      supported: true,
      listening: false,
      transcript: ''
    });
  });

  test('should handle multiple interim results correctly', () => {
    speechRecognitionService.init();
    
    let callbackResult = '';
    let callCount = 0;
    speechRecognitionService.setCallbacks({
      onResult: (transcript) => {
        callbackResult = transcript;
        callCount++;
      }
    });
    
    // 模拟第一个中间结果
    speechRecognitionService.recognition.simulateResult([
      {
        [0]: { transcript: '你', isFinal: false },
        length: 1,
        isFinal: false
      }
    ]);
    expect(callbackResult).toBe('你');
    
    // 模拟第二个中间结果
    speechRecognitionService.recognition.simulateResult([
      {
        [0]: { transcript: '你好', isFinal: false },
        length: 1,
        isFinal: false
      }
    ]);
    expect(callbackResult).toBe('你好');
    
    // 模拟最终结果
    speechRecognitionService.recognition.simulateResult([
      {
        [0]: { transcript: '你好', isFinal: true },
        length: 1,
        isFinal: true
      }
    ]);
    expect(callbackResult).toBe('你好');
    
    // 模拟最终结果后的中间结果
    speechRecognitionService.recognition.simulateResult([
      {
        [0]: { transcript: '你好', isFinal: true },
        length: 1,
        isFinal: true
      },
      {
        [0]: { transcript: '世界', isFinal: false },
        length: 1,
        isFinal: false
      }
    ]);
    expect(callbackResult).toBe('你好世界');
    
    expect(callCount).toBe(4);
  });
});
