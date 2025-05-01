'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface PremiumButtonProps {
  text?: string;
  isLoading?: boolean;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  text = 'Get Premium 💎',
  isLoading = false,
  onClick,
  href,
  disabled = false
}) => {
  const ButtonContent = () => (
    <>
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        text
      )}
    </>
  );

  if (href) {
    return (
      <StyledWrapper>
        <div className="container">
          <Link href={href} className="button">
            <ButtonContent />
          </Link>
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <div className="container">
        <button
          className="button"
          onClick={onClick}
          disabled={disabled || isLoading}
        >
          <ButtonContent />
        </button>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    font-size: 1em;
    padding: 0.6em 0.8em;
    border-radius: 0.5em;
    border: none;
    background-color: rgba(36, 40, 50, 1);
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    width: 100%;
    text-decoration: none;
    transition: all 0.3s ease-out;
  }

  .container {
    position: relative;
    padding: 2px;
    background: linear-gradient(139deg, #5353ff, #bd89ff);
    border-radius: 0.6em;
    transition: all 0.3s ease-out;
    display: inline-block;
  }

  .container::before {
    content: "";
    position: absolute;
    inset: 0;
    margin: auto;
    border-radius: 0.6em;
    z-index: -10;
    filter: blur(0);
    transition: filter 0.3s ease-out;
  }

  .container:hover::before {
    background: linear-gradient(139deg, #5353ff, #bd89ff);
    filter: blur(0.8em);
  }

  .container:hover {
    transform: translate(1px, -1px);
  }

  .container:active {
    transform: scale(0.99);
  }

  /* Light mode styles */
  @media (prefers-color-scheme: light) {
    .button {
      background-color: rgba(36, 40, 50, 0.9);
      color: #fff;
    }
  }

  /* Dark mode styles */
  .dark .button {
    background-color: rgba(36, 40, 50, 1);
    color: #fff;
  }
`;

export default PremiumButton;
