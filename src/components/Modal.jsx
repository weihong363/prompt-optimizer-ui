import React from 'react';
import styled from 'styled-components';

// 模态框容器
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// 模态框内容
const ModalContainer = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { 
      opacity: 0;
      transform: translateY(-20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// 标题
const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// 消息内容
const ModalMessage = styled.p`
  margin: 0 0 20px 0;
  color: #e6e6e6;
  line-height: 1.6;
`;

// 按钮容器
const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

// 确认按钮
const ConfirmButton = styled.button`
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => {
    switch (props.type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      default:
        return '#4facfe';
    }
  }};
  color: white;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${props => {
      switch (props.type) {
        case 'success':
          return 'rgba(76, 175, 80, 0.4)';
        case 'error':
          return 'rgba(244, 67, 54, 0.4)';
        case 'warning':
          return 'rgba(255, 152, 0, 0.4)';
        default:
          return 'rgba(79, 172, 254, 0.4)';
      }
    }};
  }

  &:active {
    transform: translateY(0);
  }
`;

// 消息图标
const Icon = styled.span`
  font-size: 1.4rem;
`;

const Modal = ({ isOpen, onClose, message, type = 'info', title }) => {
  if (!isOpen) return null;

  // 根据类型设置标题和图标
  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'success':
        return '成功';
      case 'error':
        return '错误';
      case 'warning':
        return '警告';
      default:
        return '提示';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalTitle>
          <Icon>{getIcon()}</Icon>
          {getTitle()}
        </ModalTitle>
        <ModalMessage>{message}</ModalMessage>
        <ButtonContainer>
          <ConfirmButton type={type} onClick={onClose}>确定</ConfirmButton>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Modal;