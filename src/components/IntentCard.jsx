import React from 'react';
import styled from 'styled-components';
import ResultCard from './ResultCard';

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

const CopyButton = styled.button`
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
`;

/**
 * 意图识别卡片组件
 * @param {Object} props - 组件属性
 * @param {string} props.intent - 意图识别结果
 * @param {Function} props.onCopy - 复制按钮点击回调
 * @param {boolean} props.isCopied - 是否已复制
 */
const IntentCard = ({ intent, onCopy, isCopied }) => {
  return (
    <ResultCard 
      title="🎯 意图识别"
      color="#4facfe"
    >
      <Content color="#4facfe">
        {intent ? (
          <>
            <CopyButton 
              className="copy-button"
              onClick={onCopy}
              aria-label="复制意图识别结果"
            >
              {isCopied ? '已复制!' : '复制'}
            </CopyButton>
            {intent}
          </>
        ) : (
          <span style={{ color: COLORS.placeholderText }}>识别结果</span>
        )}
      </Content>
    </ResultCard>
  );
};

export default IntentCard;