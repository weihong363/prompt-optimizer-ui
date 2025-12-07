/**
 * 语音识别服务
 * 封装Web Speech API，提供语音识别功能
 */

class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.supported = this.checkSupport();
    this.transcript = '';
    this.onResult = null;
    this.onStart = null;
    this.onEnd = null;
    this.onError = null;
  }

  /**
   * 检查浏览器是否支持Web Speech API
   */
  checkSupport() {
    // Chrome和Edge使用webkitSpeechRecognition，其他浏览器可能使用标准的SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  /**
   * 初始化语音识别实例
   */
  init() {
    if (!this.supported) {
      console.error('您的浏览器不支持语音识别功能');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // 设置识别参数
    this.recognition.continuous = true; // 连续识别
    this.recognition.interimResults = true; // 返回中间结果
    this.recognition.lang = 'zh-CN'; // 设置为中文识别
    this.recognition.maxAlternatives = 1; // 只返回最可能的结果

    // 设置事件监听器
    this.setupEventListeners();
    return true;
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    if (!this.recognition) return;

    // 当识别到语音结果时触发
    this.recognition.onresult = (event) => {
      // 正确累积结果：只使用最新的最终结果或当前的中间结果
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i][0];
        if (result.isFinal) {
          finalTranscript += result.transcript;
        } else {
          interimTranscript = result.transcript;
        }
      }
      
      // 组合最终结果和当前中间结果
      this.transcript = finalTranscript + interimTranscript;
      
      // 调用回调返回最新的识别结果
      if (this.onResult) {
        this.onResult(this.transcript);
      }
    };

    // 当开始识别时触发
    this.recognition.onstart = () => {
      this.isListening = true;
      this.transcript = ''; // 开始新识别时重置转录文本
      if (this.onStart) {
        this.onStart();
      }
    };

    // 当识别结束时触发
    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) {
        this.onEnd();
      }
    };

    // 当发生错误时触发
    this.recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      if (this.onError) {
        this.onError(event.error);
      }
      
      // 处理network错误，自动重新连接
      if (event.error === 'network') {
        this.reconnect();
      }
    };
  }

  /**
   * 开始语音识别
   */
  start() {
    if (!this.recognition) {
      const initialized = this.init();
      if (!initialized) return false;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('启动语音识别失败:', error);
      return false;
    }
  }

  /**
   * 重新连接语音识别服务（用于处理network错误）
   */
  reconnect() {
    if (this.isListening) {
      this.abort();
    }
    
    // 延迟重新初始化以避免立即失败
    setTimeout(() => {
      this.recognition = null;
      this.init();
    }, 1000);
  }

  /**
   * 停止语音识别
   */
  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        return true;
      } catch (error) {
        console.error('停止语音识别失败:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * 中止语音识别
   */
  abort() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
        return true;
      } catch (error) {
        console.error('中止语音识别失败:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * 设置回调函数
   */
  setCallbacks(callbacks) {
    this.onResult = callbacks.onResult || null;
    this.onStart = callbacks.onStart || null;
    this.onEnd = callbacks.onEnd || null;
    this.onError = callbacks.onError || null;
  }

  /**
   * 获取当前识别状态
   */
  getStatus() {
    return {
      supported: this.supported,
      listening: this.isListening,
      transcript: this.transcript
    };
  }
}

// 导出单例实例
const speechRecognitionService = new SpeechRecognitionService();
export default speechRecognitionService;