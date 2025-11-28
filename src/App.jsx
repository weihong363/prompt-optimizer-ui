import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components'
import './App.css'
import Modal from './components/Modal'
import SpeechInputButton from './components/SpeechInputButton';
import speechRecognitionService from './utils/speechRecognitionService'
import IntentCard from './components/IntentCard';
import MissingInfoCard from './components/MissingInfoCard';
import OptimizationCard from './components/OptimizationCard';
import EnrichedPromptCard from './components/EnrichedPromptCard';

// 颜色常量定义
const COLORS = {
  placeholderText: '#b1b8be71', // 浅灰色带透明度
}

// API调用函数
const callApi = async (endpoint, data) => {
  const url = `http://localhost:8080${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error) {
    console.error(`调用API ${endpoint} 失败:`, error);
    throw error;
  }
}

// 样式组件定义
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e6e6e6;
  padding: 16px;
  font-family: 'Fira Code', 'Monaco', monospace;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
`

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
  h1 {
    font-size: 2rem;
    background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
    animation: fadeInUp 0.8s ease-out;
  }
  p {
    color: #888;
    animation: fadeInUp 0.8s ease-out 0.2s both;
  }
  
  @media (max-width: 768px) {
    h1 {
      font-size: 1.8rem;
    }
    p {
      font-size: 0.9rem;
    }
  }
`

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
`

const InputSection = styled.section`
  background: rgba(255, 255, 255, 0.05);
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 15px;
`

const TextAreaWithSpeech = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TextArea = styled.textarea`
  width: 100%;
  height: 150px;
  min-height: 120px;
  max-height: 400px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s, box-shadow 0.3s;
  
  &:focus {
    outline: none;
    border-color: #4facfe;
    box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.2);
  }
  
  &::placeholder {
    color: ${COLORS.placeholderText};
  }
  
  @media (max-width: 768px) {
    height: 120px;
    font-size: 0.9rem;
    padding: 12px;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const SpeechButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  position: relative;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: #00f2fe;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: rgba(0, 242, 254, 0.2);
    border-color: #00f2fe;
    animation: pulse 1.5s infinite;
  }
  
  &.active::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 120%;
    height: 120%;
    background: #00f2fe;
    border-radius: 50%;
    opacity: 0.6;
    z-index: -1;
    animation: expand 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 242, 254, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(0, 242, 254, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 242, 254, 0);
    }
  }
  
  @keyframes expand {
    0% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 0.8;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 0;
    }
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

// 语音识别状态指示器
const SpeechRecognitionIndicator = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  
  .status-dot {
    width: 8px;
    height: 8px;
    background: #48bb78;
    border-radius: 50%;
    animation: blink 1.5s infinite;
  }
  
  .microphone-icon {
    font-size: 1.2rem;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`

const AnalyzeButton = styled.button`
  padding: 12px 30px;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`

const ClearButton = styled.button`
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`

const ResultsSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`

const ResultCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.6s ease-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }

  h2 {
    font-size: 1.2rem;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  &:hover .copy-button {
    opacity: 1;
  }
  
  .content {
    min-height: 100px;
    background: rgba(0, 0, 0, 0.2);
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid ${props => props.color || '#4facfe'};
    font-family: 'Fira Code', monospace;
    white-space: pre-wrap;
    position: relative;
  }
  .copy-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(79, 172, 254, 0.1);
    border: 1px solid rgba(110, 125, 138, 0.03);
    color: #a7b2bc55;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    opacity: 0.4;
    transition: all 0.2s;

    &:hover {
      background: rgba(79, 172, 254, 0.3);
      border-color: #4facfe;
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #4facfe;
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const Code = styled.code`
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  color: #00f2fe;
`

const MissingInfoInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #333;
  border-radius: 6px;
  color: #fff;
  font-size: 0.95rem;
  font-family: inherit;
  margin-bottom: 12px;
  transition: border-color 0.3s, box-shadow 0.3s;
  
  &:focus {
    outline: none;
    border-color: #00f2fe;
    box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.2);
  }
  
  &::placeholder {
    color: ${COLORS.placeholderText};
  }
`

const SubmitButton = styled.button`
  padding: 10px 24px;
  background: linear-gradient(45deg, #00f2fe 0%, #4facfe 100%);
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 8px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 242, 254, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

// 主应用组件
function App() {
  const [prompt, setPrompt] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState({
    rawIntent: null,
    intent: null,
    missingInfo: null,
    optimizedPrompt: null
  })
  const [copiedSection, setCopiedSection] = useState(null)
  const [missingInfoInputs, setMissingInfoInputs] = useState({})
  const [isSubmittingMissingInfo, setIsSubmittingMissingInfo] = useState(false)
  const [enrichedPrompt, setEnrichedPrompt] = useState(null)
  const [isEnrichedPromptExpanded, setIsEnrichedPromptExpanded] = useState(false)
  // 模态框相关状态
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalType, setModalType] = useState('info')
  // 语音识别相关状态
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [currentRecognizingInput, setCurrentRecognizingInput] = useState(null) // 当前正在进行语音识别的输入框标识
  const currentRecognizingInputRef = useRef(null) // 使用ref来解决闭包问题
  
  // 当currentRecognizingInput状态变化时，更新ref
  useEffect(() => {
    currentRecognizingInputRef.current = currentRecognizingInput
  }, [currentRecognizingInput])
  
  // 初始化语音识别服务
  const initializeSpeechRecognition = () => {
    const supported = speechRecognitionService.checkSupport()
    setSpeechSupported(supported)
    
    if (supported) {
      // 设置语音识别回调
      speechRecognitionService.setCallbacks({
        onResult: (transcript) => {
          
          // 使用ref获取最新的状态值
          const currentInput = currentRecognizingInputRef.current;
          console.log('当前识别的输入框:', currentInput);
          
          if (currentInput === 'prompt') {
            setPrompt(transcript)
            console.log('已更新prompt值:', transcript)
          } else if (currentInput && currentInput.startsWith('missing_')) {
            const index = currentInput.split('_')[1]
            setMissingInfoInputs(prev => ({
              ...prev,
              [`item_${index}`]: transcript
            }))
          }
        },
        onStart: () => {
          setIsSpeechRecognitionActive(true)
        },
        onEnd: () => {
          setIsSpeechRecognitionActive(false)
          setCurrentRecognizingInput(null)
        },
        onError: (error) => {
          console.error('语音识别错误:', error)
          setIsSpeechRecognitionActive(false)
          setCurrentRecognizingInput(null)
          
          // 处理常见错误
          if (error === 'not-allowed') {
            openModal('请允许访问麦克风以使用语音识别功能', 'error')
          } else if (error === 'no-speech') {
            openModal('未检测到语音，请重试', 'warning')
          } else if (error === 'network') {
            // 尝试自动重新连接
            speechRecognitionService.reconnect();
            openModal('网络连接错误，正在尝试重新连接...请检查网络并重试', 'error')
          } else if (error === 'service-not-allowed') {
            openModal('语音识别服务暂时不可用，请稍后重试', 'error')
          } else if (error === 'audio-capture') {
            openModal('无法访问麦克风，请确保麦克风可用', 'error')
          } else {
            openModal(`语音识别出错: ${error}`, 'error')
          }
        }
      })
    }
  }
  
  // 开始语音识别
  const startSpeechRecognition = (inputType, index = null) => {
    if (!speechSupported) {
      openModal('您的浏览器不支持语音识别功能', 'error')
      return
    }
    
    if (isSpeechRecognitionActive) {
      // 如果已经在进行语音识别，先停止
      stopSpeechRecognition()
      return
    }
    
    // 设置当前正在识别的输入框
    if (inputType === 'prompt') {
      setCurrentRecognizingInput('prompt')
    } else if (inputType === 'missing') {
      setCurrentRecognizingInput(`missing_${index}`)
    }
    
    // 开始语音识别
    const started = speechRecognitionService.start()
    if (!started) {
      openModal('启动语音识别失败，请重试', 'error')
    }
  }
  
  // 停止语音识别
  const stopSpeechRecognition = () => {
    speechRecognitionService.stop()
    setIsSpeechRecognitionActive(false)
    setCurrentRecognizingInput(null)
  }
  
  // 组件挂载时初始化语音识别
  useEffect(() => {
    initializeSpeechRecognition()
    
    // 组件卸载时停止语音识别
    return () => {
      if (isSpeechRecognitionActive) {
        speechRecognitionService.abort()
      }
    }
  }, [])

  const analyzePrompt = async () => {
    if (!prompt.trim()) return
    
    setIsAnalyzing(true)
    
    try {
      // 调用意图识别API
      const intentResponse = await callApi('/prompt/detect-intent', { prompt });
      
      // 格式化意图分析结果
      const formattedIntentResult = `意图类型: ${intentResponse.intent}\n置信度: ${(intentResponse.confidence * 100).toFixed(1)}%\n\n` +
        `关键信息:\n` +
        `• 原始提示词: ${intentResponse.keyInformation?.originalPrompt || 'N/A'}\n` +
        // `• 实体: ${intentResponse.keyInformation?.entities?.join(', ') || 'N/A'}\n` +
        `• 关键词: ${intentResponse.keyInformation?.keywords?.join(', ') || 'N/A'}`;
      
      // // 调用缺失信息分析API
      // const missingInfoResponse = await callApi('/prompt/requirement/refine', { prompt });
      // const formattedMissingInfo = missingInfoResponse.keyInformation?.missingInformation?.join('\n• ') 
      //   ? `缺失信息:\n• ${missingInfoResponse.keyInformation.missingInformation.join('\n• ')}`
      //   : '未检测到明显的缺失信息';
      
      
      // 调用优化建议API
      const optimizeResponse = await callApi('/prompt/optimize', { prompt, platform: '' });
      const optimizedPrompt = optimizeResponse.optimizedPrompt || '无法生成优化建议';
      // 调用缺失信息分析API
      const formattedMissingInfo = optimizeResponse.keyInformation?.missingInformation?.join('\n• ') 
        ? `缺失信息:\n• ${optimizeResponse.keyInformation.missingInformation.join('\n• ')}`
        : '未检测到明显的缺失信息';
      
      setResults({
        rawIntent: intentResponse.intent,
        intent: formattedIntentResult,
        missingInfo: formattedMissingInfo,
        optimizedPrompt: optimizedPrompt
      })
    } catch (error) {
      console.error('分析过程中发生错误:', error)
      setResults({
        intent: '分析过程中发生错误',
        missingInfo: '无法分析缺失信息',
        optimizedPrompt: '无法生成优化建议'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  const clearPrompt = () => {
    setPrompt('')
    setResults({
      intent: null,
      missingInfo: null,
      optimizedPrompt: null
    })
  }
  
  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      openModal('复制失败，请手动复制', 'error')
    }
  }
  
  // 打开模态框的函数
  const openModal = (message, type = 'info') => {
    setModalMessage(message)
    setModalType(type)
    setModalVisible(true)
  }
  
  // 关闭模态框的函数
  const closeModal = () => {
    setModalVisible(false)
  }
  
  const handleSubmitMissingInfo = async (missingItems) => {
    try {
      setIsSubmittingMissingInfo(true)
      
      // 收集用户输入的缺失信息
      const userInputs = missingItems.map((item, index) => ({
        question: item,
        answer: missingInfoInputs[`item_${index}`] || ''
      }))
      
      console.log(userInputs)
      
      // 调用/prompt/enrich接口
      const response = await callApi('/prompt/enrich', {
        originalPrompt: prompt,
        intent: results.rawIntent,
        missingInfos: userInputs,
        keywords: results.keywords
      })
      
      // 处理返回结果，更新优化建议和丰富后的提示词
      if (response) {
        // // 更新优化建议
        // if (response.optimizedPrompt) {
        //   setResults(prev => ({
        //     ...prev,
        //     optimizedPrompt: response.optimizedPrompt
        //   }))
        // }
        
        // 存储丰富后的提示词
        try {
          // if (typeof response === 'object') {
          //   setEnrichedPrompt(response.enrichedPrompt || JSON.stringify(response))
          // } else {
          // }
          // 假设非对象响应已经是文本格式
          setEnrichedPrompt(String(response))
        } catch (error) {
          console.error('处理enrichedPrompt时出错:', error)
        }
        
        // 显示成功消息
        openModal('信息补全成功！已更新优化建议和丰富后的提示词。', 'success')
    } else {
      openModal('未获取到响应，请重试。', 'warning')
    }
  } catch (error) {
    console.error('提交缺失信息时发生错误:', error)
    openModal('提交失败，请重试。', 'error')
    } finally {
      setIsSubmittingMissingInfo(false)
    }
  }

  return (
    <Container>
      <Header>
        <h1>提示词解析器</h1>
        <p>分析、完善和优化你的提示词</p>
      </Header>
      
      {/* 语音识别全局状态指示器 */}
      {isSpeechRecognitionActive && (
        <SpeechRecognitionIndicator>
          <div className="status-dot"></div>
          <span className="microphone-icon">🎤</span>
          <span>语音识别中...</span>
        </SpeechRecognitionIndicator>
      )}
      
      <Main>
        <InputSection>
          <TextAreaWithSpeech>
            <InputContainer>
              <TextArea
                placeholder="在这里输入你的提示词..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  // 按下Enter键且没有按下Shift键时触发分析
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // 阻止默认的换行行为
                    if (prompt.trim() && !isAnalyzing) {
                      analyzePrompt();
                    }
                  }
                }}
                aria-label="提示词输入"
              />
            </InputContainer>
          </TextAreaWithSpeech>
          <ButtonGroup>
            <AnalyzeButton 
              onClick={analyzePrompt}
              disabled={isAnalyzing || !prompt.trim()}
              aria-label="分析提示词"
            >
              {isAnalyzing ? <LoadingSpinner /> : null}
              {isAnalyzing ? '分析中...' : '分析提示词'}
            </AnalyzeButton>
            {speechSupported && (
              <SpeechInputButton
                onClick={() => startSpeechRecognition('prompt')}
                isActive={isSpeechRecognitionActive && currentRecognizingInput === 'prompt'}
                ariaLabel={isSpeechRecognitionActive && currentRecognizingInput === 'prompt' ? '停止语音识别' : '开始语音识别'}
                size="medium"
              />
            )}
            <ClearButton 
              onClick={clearPrompt}
              disabled={isAnalyzing || !prompt.trim()}
              aria-label="清空提示词"
            >
              清空
            </ClearButton>
          </ButtonGroup>
        </InputSection>

        <ResultsSection>

          <IntentCard 
            intent={results.intent}
            copiedSection={copiedSection}
            onCopy={() => copyToClipboard(results.intent, 'intent')}
          />

          <MissingInfoCard
            missingInfo={results.missingInfo}
            missingInfoInputs={missingInfoInputs}
            setMissingInfoInputs={setMissingInfoInputs}
            onSubmit={handleSubmitMissingInfo}
            isSubmitting={isSubmittingMissingInfo}
            speechSupported={speechSupported}
            isSpeechRecognitionActive={isSpeechRecognitionActive}
            currentRecognizingInput={currentRecognizingInput}
            startSpeechRecognition={startSpeechRecognition}
            copiedSection={copiedSection}
            onCopy={() => copyToClipboard(results.missingInfo, 'missingInfo')}
          />

          <OptimizationCard
            optimizedPrompt={results.optimizedPrompt}
            copiedSection={copiedSection}
            onCopy={() => copyToClipboard(results.optimizedPrompt, 'optimized')}
          />

          {/* 确保卡片跨越整个网格宽度 */}
          <div style={{ gridColumn: '1 / -1', width: '100%' }}>
            <EnrichedPromptCard
              prompt={enrichedPrompt}
              onCopy={() => copyToClipboard(enrichedPrompt, 'enriched')}
              isCopied={copiedSection === 'enriched'}
              onUse={() => setPrompt(enrichedPrompt)}
            />
          </div>
        </ResultsSection>

        <footer style={{ marginTop: '50px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
          <p>提示词解析器 &copy; {new Date().getFullYear()} | 使用 <Code>React</Code> + <Code>Styled Components</Code> 构建</p>
        </footer>
      </Main>
      
      {/* 模态框组件 */}
      <Modal 
        isOpen={modalVisible}
        onClose={closeModal}
        message={modalMessage}
        type={modalType}
      />
    </Container>
  )
}

export default App
