import React, { useState } from 'react';
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
  border-left: 4px solid ${props => props.color || '#feca57'};
  font-family: 'Fira Code', monospace;
  white-space: pre-wrap;
  position: relative;
`;

const CollapsibleContent = styled.div`
  min-height: ${props => props.isExpanded ? '100px' : 'auto'};
  max-height: ${props => props.isExpanded ? 'none' : '80px'};
  overflow: ${props => props.isExpanded ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(254, 202, 87, 0.1);
  border: 1px solid rgba(110, 125, 138, 0.03);
  color: #a7b2bc55;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.4;
  transition: all 0.2s;

  &:hover {
    background: rgba(254, 202, 87, 0.3);
    border-color: #feca57;
    opacity: 1;
  }
`;

const UseButton = styled.button`
  margin-top: 10px;
  background: rgba(254, 202, 87, 0.1);
  border: 1px solid rgba(254, 202, 87, 0.3);
  color: #feca57;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(254, 202, 87, 0.3);
    border-color: #feca57;
  }
`;

const ExpandableTitle = styled.h2`
  cursor: ${props => props.isClickable ? 'pointer' : 'default'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  transition: color 0.2s;
  color: ${props => props.isClickable ? '#feca57' : 'inherit'};
  font-size: 1.2rem;
  margin-bottom: 15px;
  gap: 10px;

  &:hover {
    color: #ffd700;
  }
`;

const ExpandIcon = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
`;

const PlaceholderText = styled.span`
  color: ${COLORS.placeholderText};
`;

const ExpandHint = styled.span`
  color: #feca57;
  font-style: italic;
  font-size: 1rem;
  padding: 10px 0;
  display: block;
  cursor: pointer;
`;

/**
 * 丰富提示词卡片组件 - 支持折叠/展开功能
 * @param {Object} props - 组件属性
 * @param {string} props.prompt - 丰富后的提示词
 * @param {Function} props.onCopy - 复制按钮点击回调
 * @param {boolean} props.isCopied - 是否已复制
 * @param {Function} props.onUse - 使用按钮点击回调
 */
const EnrichedPromptCard = ({ prompt, onCopy, isCopied, onUse }) => {
  const [isEnrichedPromptExpanded, setIsEnrichedPromptExpanded] = useState(false);

  // 处理标题点击，切换展开状态
  const handleTitleClick = () => {
    if (prompt) {
      setIsEnrichedPromptExpanded(!isEnrichedPromptExpanded);
    }
  };

  // 处理提示文字点击，展开内容
  const handleExpandClick = () => {
    setIsEnrichedPromptExpanded(true);
  };

  return (
    <ResultCard 
      color="#feca57"
      style={{ width: '100%' }}
    >
      <ExpandableTitle 
        isClickable={!!prompt}
        onClick={handleTitleClick}
      >
        🌟 丰富后的提示词
        {prompt && (
          <ExpandIcon>
            {isEnrichedPromptExpanded ? '▲' : '▼'}
          </ExpandIcon>
        )}
      </ExpandableTitle>
      
      <CollapsibleContent isExpanded={isEnrichedPromptExpanded}>
        <Content color="#feca57">
          {!prompt ? (
            <PlaceholderText>提交补全信息后生成</PlaceholderText>
          ) : isEnrichedPromptExpanded ? (
            <>
              <CopyButton 
                className="copy-button"
                onClick={onCopy}
                aria-label="复制丰富后的提示词"
              >
                {isCopied ? '已复制!' : '复制'}
              </CopyButton>
              {prompt}
            </>
          ) : (
            <ExpandHint onClick={handleExpandClick}>
              点击标题展开查看丰富后的提示词
            </ExpandHint>
          )}
        </Content>
      </CollapsibleContent>
      
      {/* TODO: 根据intent值选择合适的模型去调用，然后最后将结果返回给用户 */}
      {prompt && isEnrichedPromptExpanded && (
        <UseButton onClick={onUse} disabled={true}>
          使用此提示词
        </UseButton>
      )}
    </ResultCard>
  );
};

export default EnrichedPromptCard;