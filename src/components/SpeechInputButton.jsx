import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

const SpeechInputButton = ({ 
  onClick, 
  isActive = false, 
  ariaLabel = '语音输入',
  size = 'medium'
}) => {
  // 状态管理
  const [audioLevel, setAudioLevel] = useState(0);
  
  // 引用管理
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const dataArrayRef = useRef(null);
  
  // 资源清理函数 - 统一管理资源释放
  const cleanupResources = () => {
    // 取消动画帧
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // 停止并释放麦克风流
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
    
    // 重置分析相关引用
    analyserRef.current = null;
    dataArrayRef.current = null;
    
    // 重置音频级别
    setAudioLevel(0);
  };
  
  // 初始化音频分析器
  const initializeAudioAnalyser = async () => {
    try {
      // 先清理之前的资源
      cleanupResources();
      
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      microphoneStreamRef.current = stream;
      
      // 创建或恢复音频上下文
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // 配置音频分析器
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // 准备数据数组
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      // 连接音频源
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // 开始音频分析
      startAudioAnalysis();
    } catch (error) {
      console.error('无法初始化音频分析器:', error);
      cleanupResources();
    }
  };
  
  // 音频分析主循环
  const startAudioAnalysis = () => {
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    if (!analyser || !dataArray) return;
    
    // 使用函数闭包优化性能
    const analyze = () => {
      if (!analyser || !dataArray) return;
      
      // 请求下一帧
      animationFrameRef.current = requestAnimationFrame(analyze);
      
      // 获取时域数据
      analyser.getByteTimeDomainData(dataArray);
      
      // 计算RMS (均方根) 音量
      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = dataArray[i] - 128;
        sumSquares += normalized * normalized;
      }
      
      // 归一化并应用噪声门限
      const rms = Math.sqrt(sumSquares / dataArray.length);
      const normalizedRms = Math.max(0, (rms - 5) / 128);
      
      // 平滑音量变化
      setAudioLevel(prev => prev * 0.8 + normalizedRms * 0.2);
    };
    
    // 开始分析
    animationFrameRef.current = requestAnimationFrame(analyze);
  };
  
  // 控制音频分析的生命周期
  useEffect(() => {
    if (isActive) {
      initializeAudioAnalyser();
    } else {
      cleanupResources();
    }
    
    // 组件卸载时的清理
    return () => {
      cleanupResources();
      
      // 关闭音频上下文
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isActive]);
  
  // 生成波形条
  const renderWaveformBars = () => {
    const barCount = 6;
    const time = Date.now() * 0.001;
    
    // 使用Array.map替代循环，更符合React最佳实践
    return Array.from({ length: barCount }, (_, i) => {
      // 有音频数据时的动态波形
      if (dataArrayRef.current && isActive) {
        // 采样音频数据
        const sampleIndex = Math.floor((i / barCount) * dataArrayRef.current.length);
        const sample = dataArrayRef.current[sampleIndex];
        
        // 计算高度
        const normalizedSample = Math.abs(sample - 128);
        const baseHeight = 5 + (normalizedSample / 128) * 80;
        
        // 添加动画
        const phase = i * 0.5;
        const audioModulation = Math.sin(time * 4 + phase) * audioLevel * 30;
        const height = `${Math.min(100, baseHeight + audioModulation)}%`;
        
        return (
          <div
            key={i}
            className="waveform-bar active"
            style={{
              height,
              backgroundColor: `rgba(239, 68, 68, ${0.6 + Math.min(0.4, audioLevel * 0.8)})`,
              animationDelay: `${i * 0.1}s`,
              filter: `brightness(${1 + audioLevel * 0.5})`,
            }}
          />
        );
      }
      
      // 静态波形
      return (
        <div
          key={i}
          className="waveform-bar"
          style={{
            height: `${10 + (i % 3) * 20}%`,
            backgroundColor: '#94a3b8',
            opacity: 0.3,
          }}
        />
      );
    });
  };
  
  // 渲染脉冲环
  const renderPulseRings = () => {
    if (!isActive) return null;
    
    return (
      <>
        <div className="pulse-ring pulse-ring-1"></div>
        <div className="pulse-ring pulse-ring-2"></div>
        <div className="pulse-ring pulse-ring-3"></div>
      </>
    );
  };
  
  // 构造类名
  const buttonClassName = `speech-input-button size-${size} ${isActive ? 'active' : ''}`;

  return (
    <button
      className={buttonClassName}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
    >
      {renderPulseRings()}
      
      {/* 麦克风图标 */}
      <svg className="microphone-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
      </svg>
      
      {/* 波形可视化 */}
      {isActive && (
        <div className="waveform-container">
          {renderWaveformBars()}
        </div>
      )}
    </button>
  );
};

export default SpeechInputButton;