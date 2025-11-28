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
  border-left: 4px solid ${props => props.color || '#ffdd59'};
  font-family: 'Fira Code', monospace;
  white-space: pre-wrap;
  position: relative;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 221, 89, 0.1);
  border: 1px solid rgba(110, 125, 138, 0.03);
  color: #a7b2bc55;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.4;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 221, 89, 0.3);
    border-color: #ffdd59;
    opacity: 1;
  }
`;

const SuggestionList = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: #e0e0e0;
  li {
    margin-bottom: 8px;
    position: relative;
  }
`;

/**
 * 优化建议卡片组件
 * @param {Object} props - 组件属性
 * @param {Array} props.suggestions - 优化建议列表
 * @param {Function} props.onCopy - 复制按钮点击回调
 * @param {boolean} props.isCopied - 是否已复制
 */
const OptimizationCard = ({ suggestions = [], onCopy, isCopied }) => {
  // 将建议列表转换为字符串以便复制
  const suggestionsText = suggestions.join('\n\n');
  
  const handleCopy = () => {
    if (onCopy) {
      onCopy(suggestionsText);
    }
  };

  return (
    <ResultCard 
      title="✨ 优化建议"
      color="#fe4fa0"
    >
      <Content color="#fe4fa0">
        {suggestions && suggestions.length > 0 ? (
          <>
            <CopyButton 
              className="copy-button"
              onClick={handleCopy}
              aria-label="复制优化建议"
            >
              {isCopied ? '已复制!' : '复制'}
            </CopyButton>
            <SuggestionList>
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </SuggestionList>
          </>
        ) : (
          <span style={{ color: COLORS.placeholderText }}>优化建议</span>
        )}
      </Content>
    </ResultCard>
  );
};

export default OptimizationCard;