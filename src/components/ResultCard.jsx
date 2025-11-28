import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.6s ease-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  color: #e6e6e6;
  
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
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

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

const EmptyState = styled.span`
  color: #b1b8be71;
`;

/**
 * 通用结果展示卡片组件
 * @param {Object} props - 组件属性
 * @param {string} props.title - 卡片标题
 * @param {React.ReactNode} props.children - 卡片内容
 * @param {string} props.color - 左侧边框颜色
 * @param {string} props.content - 要显示的内容（简单文本）
 * @param {Function} props.onCopy - 复制按钮点击回调
 * @param {boolean} props.isCopied - 是否已复制
 * @param {Object} props.style - 额外的样式
 */
const ResultCard = ({ title, children, color, content, onCopy, isCopied, style }) => {
  const renderContent = () => {
    if (children) {
      return children;
    }
    
    return (
      <Content color={color}>
        {onCopy && (
          <CopyButton 
            className="copy-button"
            onClick={onCopy}
            aria-label="复制内容"
          >
            {isCopied ? '已复制!' : '复制'}
          </CopyButton>
        )}
        {content || <EmptyState>分析结果</EmptyState>}
      </Content>
    );
  };
  
  return (
    <Card style={style}>
      <h2>{title}</h2>
      {renderContent()}
    </Card>
  );
};

export default ResultCard;