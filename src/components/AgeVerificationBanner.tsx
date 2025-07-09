'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';

const BannerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const BannerContent = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;
  
  @media (min-width: 480px) {
    flex-direction: row;
  }
`;

const ModernButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  position: relative;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  flex: 1;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.6);
    }
  ` : `
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.6);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

const SafetyMessage = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SafetyText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
`;

export function AgeVerificationBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already verified their age
    const ageVerified = localStorage.getItem('f0ck_age_verified');
    if (!ageVerified) {
      setShowBanner(true);
    }
  }, []);

  const handleAgeConfirmation = (isOver18: boolean) => {
    if (isOver18) {
      localStorage.setItem('f0ck_age_verified', 'true');
      setShowBanner(false);
    } else {
      // Redirect to child safety website
      window.location.href = 'https://www.childnet.com/young-people/';
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <BannerOverlay>
      <BannerContent>
        <Title>Age Verification Required</Title>
        <Description>
          This website contains content that may not be suitable for minors. 
          You must be 18 years or older to access this site.
        </Description>
        
        <ButtonContainer>
          <ModernButton 
            $variant="primary"
            onClick={() => handleAgeConfirmation(true)}
          >
            I am 18 or older
          </ModernButton>
          
          <ModernButton 
            $variant="secondary"
            onClick={() => handleAgeConfirmation(false)}
          >
            I am under 18
          </ModernButton>
        </ButtonContainer>
        
        <SafetyMessage>
          <SafetyText>
            🔒 We care about your safety. The internet can be a fun place, but also dangerous. 
            Learn how to protect yourself and others.
          </SafetyText>
        </SafetyMessage>
      </BannerContent>
    </BannerOverlay>
  );
}
