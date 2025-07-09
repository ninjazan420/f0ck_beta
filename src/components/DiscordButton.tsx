'use client';

import React from 'react';
import styled from 'styled-components';
import { signIn } from 'next-auth/react';

interface DiscordButtonProps {
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'login' | 'register' | 'link'; // Neue Prop für verschiedene Varianten
}

const DiscordButton: React.FC<DiscordButtonProps> = ({ 
  text = "Continue with Discord", 
  onClick,
  disabled = false,
  variant = 'login'
}) => {
  const handleClick = async () => {
    if (onClick) {
      onClick();
    } else if (variant === 'link') {
      // Für Account-Verknüpfung zur speziellen Route
      try {
        window.location.href = '/api/auth/link-discord';
      } catch (error) {
        console.error('Error linking Discord account:', error);
      }
    } else {
      // Für Login/Register zur normalen Discord OAuth
      signIn('discord', { callbackUrl: '/' });
    }
  };

  return (
    <StyledWrapper>
      <button 
        className="button" 
        onClick={handleClick}
        disabled={disabled}
      >
        <span className="discord-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </span>
        <span className="text">{text}</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    position: relative;
    text-decoration: none;
    color: #fff;
    background: linear-gradient(45deg, #5865F2, #7289DA, #99AAB5);
    padding: 8px 16px;
    border-radius: 12px;
    font-size: 0.9em;
    cursor: pointer;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: auto;
    min-width: 100px;
    transition: all 0.3s ease;
  }

  .button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .button .text,
  .button .discord-icon {
    position: relative;
    z-index: 1;
  }

  .button .discord-icon {
    display: flex;
    align-items: center;
  }

  .button::before {
    content: "";
    position: absolute;
    inset: 2px;
    background: #272727;
    border-radius: 10px;
    transition: 0.5s;
  }

  .button:hover::before {
    opacity: 0.7;
  }

  .button:disabled:hover::before {
    opacity: 1;
  }

  .button::after {
    content: "";
    position: absolute;
    inset: 0px;
    background: linear-gradient(45deg, #5865F2, #7289DA, #99AAB5);
    border-radius: 9px;
    transition: 0.5s;
    opacity: 0;
    filter: blur(20px);
  }

  .button:hover:after {
    opacity: 1;
  }

  .button:disabled:hover:after {
    opacity: 0;
  }
`;

export default DiscordButton;