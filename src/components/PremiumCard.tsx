'use client';

import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface PremiumCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const PremiumCard: React.FC<PremiumCardProps> = ({ 
  children, 
  title = 'Upgrade to Premium 💎', 
  subtitle = 'Unlock all premium features and benefits' 
}) => {
  return (
    <StyledWrapper>
      <div className="premium-card">
        {title && <h2 className="title">{title}</h2>}
        {subtitle && <p className="subtitle">{subtitle}</p>}
        <div className="content">
          {children}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .premium-card {
    width: 100%;
    background-color: rgba(36, 40, 50, 1);
    background-image: linear-gradient(
      139deg,
      rgba(36, 40, 50, 1) 0%,
      rgba(36, 40, 50, 1) 0%,
      rgba(37, 28, 40, 1) 100%
    );
    border-radius: 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .title {
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
    margin: 0;
  }

  .subtitle {
    color: #bd89ff;
    font-size: 1rem;
    text-align: center;
    margin: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  /* Light mode adjustments */
  @media (prefers-color-scheme: light) {
    .premium-card {
      background-color: rgba(36, 40, 50, 0.95);
      background-image: linear-gradient(
        139deg,
        rgba(36, 40, 50, 0.95) 0%,
        rgba(36, 40, 50, 0.95) 0%,
        rgba(37, 28, 40, 0.95) 100%
      );
    }
  }
`;

export default PremiumCard;
