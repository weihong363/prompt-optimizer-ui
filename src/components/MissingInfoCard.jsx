import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import ResultCard from './ResultCard';
import SpeechInputButton from './SpeechInputButton';

const COLORS = {
  placeholderText: '#b1b8be71', // 浅灰色带透明度
};
const Content = styled.div`
  min-height: 100px;
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid ${props => props.color || '#4facfe'};
  font-family: 'Fira Code', monospace;
  white-space: pre-wrap;
  position: relative;
`;

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
  flex: 1;

  &:focus {
    outline: none;
    border-color: #00f2fe;
    box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.2);
  }

  &::placeholder {
    color: ${COLORS.placeholderText};
  }
`;

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
  display: flex;
  align-items: center;
  gap: 8px;

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
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  border-top-color: #000;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  color: #e6e6e6;
`;

const Instructions = styled.p`
  margin-bottom: 15px;
  color: #e6e6e6;
  font-size: 0.95rem;
`;

/**
 * 缺失信息卡片组件
 * 支持多输入框、语音识别、Enter键提交等功能
 */
const MissingInfoCard = ({ 
  missingInfo, 
  missingInfoInputs = {},
  setMissingInfoInputs,
  onSubmit,
  isSubmitting,
  speechSupported,
  isSpeechRecognitionActive,
  currentRecognizingInput,
  startSpeechRecognition,
  copiedSection,
  onCopy
}) => {
  // 解析缺失信息，提取每个缺失项
  const parseMissingInfo = () => {
    if (!missingInfo || typeof missingInfo !== 'string') return [];
    
    const missingItems = [];
    if (missingInfo.includes('缺失信息:')) {
      // 分割文本行
      const lines = missingInfo.split('\n');
      // 提取以•开头的行作为缺失信息项
      for (const line of lines) {
        if (line.trim().startsWith('•')) {
          const item = line.trim().substring(1).trim();
          missingItems.push(item);
        }
      }
    }
    return missingItems;
  };

  const missingItems = parseMissingInfo();

  // 处理输入框变化
  const handleInputChange = (index, value) => {
    if (setMissingInfoInputs) {
      setMissingInfoInputs(prev => ({
        ...prev,
        [`item_${index}`]: value
      }));
    }
  };

  // 处理Enter键
  const handleKeyDown = (e, index, missingItems) => {
    // 按下Enter键触发表单提交
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // 检查所有输入框是否都已填写
      const allFilled = missingItems.every((_, idx) => 
        missingInfoInputs[`item_${idx}`]?.trim()
      );
      if (allFilled && !isSubmitting && onSubmit) {
        onSubmit(missingItems);
      } else {
        // 如果未填写完整，聚焦到下一个空输入框
        const nextEmptyIndex = missingItems.findIndex((_, idx) => 
          !missingInfoInputs[`item_${idx}`]?.trim()
        );
        if (nextEmptyIndex !== -1) {
          const nextInput = document.querySelector(`[aria-label="${missingItems[nextEmptyIndex]}输入框"]`);
          if (nextInput) nextInput.focus();
        }
      }
    }
  };

  return (
    <ResultCard 
      title="⚠️ 缺失信息"
      color="#00f2fe"
      copiedSection={copiedSection === 'missingInfo' ? 'missingInfo' : null}
      onCopy={onCopy}
    >
      <Content color="#00f2fe">
      {missingInfo && missingInfo !== '未检测到明显的缺失信息' && (
        <>
          {/* 解析缺失信息，提取每个缺失项 */}
          {(() => {
            // 如果有缺失信息项，显示输入框
            if (missingItems.length > 0) {
              return (
                <>
                  <Instructions>请补全以下缺失信息：</Instructions>
                  {missingItems.map((item, index) => (
                    <div key={index} style={{ marginBottom: '12px' }}>
                      <Label>
                        {item}
                      </Label>
                      <InputRow>
                      <span>
                        <MissingInfoInput
                          type="text"
                          placeholder={`请输入${item}`}
                          value={missingInfoInputs[`item_${index}`] || ''}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index, missingItems)}
                          aria-label={`${item}输入框`}
                        />
                        </span>
                        <span>
                        {speechSupported && startSpeechRecognition && (
                          <SpeechInputButton
                            onClick={() => startSpeechRecognition('missing', index)}
                            isActive={isSpeechRecognitionActive && 
                              currentRecognizingInput === `missing_${index}`}
                            ariaLabel={isSpeechRecognitionActive && 
                              currentRecognizingInput === `missing_${index}` ? 
                              '停止语音识别' : '开始语音识别'}
                            size="small"
                          />
                        )}
                        </span>
                      </InputRow>
                    </div>
                  ))}
                  <SubmitButton
                    onClick={() => onSubmit && onSubmit(missingItems)}
                    disabled={isSubmitting || 
                      missingItems.some((_, index) => !missingInfoInputs[`item_${index}`]?.trim())}
                  >
                    {isSubmitting ? <LoadingSpinner /> : null}
                    {isSubmitting ? '提交中...' : '提交补全信息'}
                  </SubmitButton>
                </>
              );
            } else {
              // 如果无法解析缺失信息项，显示原始文本
              return (
                <>
                  {missingInfo}
                </>
              );
            }
          })()}
        </>
      )}
      {(missingInfo === '未检测到明显的缺失信息' || !missingInfo) && (
        <span style={{ color: COLORS.placeholderText }}>
          {missingInfo || '分析结果'}
        </span>
      )}
      </Content>
    </ResultCard>
  );
};

export default MissingInfoCard;