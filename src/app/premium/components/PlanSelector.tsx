'use client';

import React from 'react';
import styled from 'styled-components';

interface PlanSelectorProps {
  selectedPlan: 'onetime' | 'monthly' | 'yearly';
  onSelectPlan: (plan: 'onetime' | 'monthly' | 'yearly') => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ selectedPlan, onSelectPlan }) => {
  return (
    <StyledWrapper>
      <div className="plan-selector">
        <button
          className={`plan-option ${selectedPlan === 'onetime' ? 'selected' : ''}`}
          onClick={() => onSelectPlan('onetime')}
        >
          One-time
        </button>
        <button
          className={`plan-option ${selectedPlan === 'monthly' ? 'selected' : ''}`}
          onClick={() => onSelectPlan('monthly')}
        >
          Monthly
        </button>
        <button
          className={`plan-option ${selectedPlan === 'yearly' ? 'selected' : ''}`}
          onClick={() => onSelectPlan('yearly')}
        >
          Yearly
        </button>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .plan-selector {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
  }

  .plan-option {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    background-color: rgba(56, 45, 71, 0.5);
    color: #7e8590;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease-out;
  }

  .plan-option:hover {
    background-color: rgba(56, 45, 71, 0.8);
    color: #bd89ff;
    transform: translate(1px, -1px);
  }

  .plan-option.selected {
    background-color: #5353ff;
    color: #ffffff;
  }

  .plan-option:active {
    transform: scale(0.98);
  }
`;

export default PlanSelector;
