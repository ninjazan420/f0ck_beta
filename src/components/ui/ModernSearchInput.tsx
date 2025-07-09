import React from 'react';
import styled from 'styled-components';

interface ModernSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxWidth?: string;
  className?: string;
}

const StyledWrapper = styled.div<{ $maxWidth?: string }>`
  .group {
    display: flex;
    line-height: 28px;
    align-items: center;
    position: relative;
    max-width: ${props => props.$maxWidth || '300px'};
    width: 100%;
  }

  .input {
    font-family: inherit;
    width: 100%;
    height: 40px;
    padding-left: 2.5rem;
    padding-right: 0.875rem;
    box-shadow: 0 0 0 1.5px rgba(229, 231, 235, 0.8), 0 0 25px -17px rgba(0, 0, 0, 0.1);
    border: 0;
    border-radius: 0.625rem;
    background-color: rgba(255, 255, 255, 0.9);
    outline: none;
    color: #374151;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
    cursor: text;
    z-index: 0;
    font-size: 0.875rem;
  }

  .input::placeholder {
    color: #9ca3af;
  }

  .input:hover {
    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2), 0px 0px 25px -15px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  .input:active {
    transform: scale(0.98);
  }

  .input:focus {
    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.3);
    transform: translateY(-1px);
  }

  .search-icon {
    position: absolute;
    left: 0.875rem;
    fill: #9ca3af;
    width: 1rem;
    height: 1rem;
    pointer-events: none;
    z-index: 1;
    transition: all 0.3s ease;
  }

  .input:focus + .search-icon,
  .input:hover + .search-icon {
    fill: #7c3aed;
  }

  @media (prefers-color-scheme: dark) {
    .input {
      background-color: rgba(17, 24, 39, 0.9);
      color: #e5e7eb;
      box-shadow: 0 0 0 1.5px rgba(75, 85, 99, 0.8), 0 0 25px -17px rgba(0, 0, 0, 0.3);
    }

    .input::placeholder {
      color: #6b7280;
    }

    .input:hover {
      box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.4), 0px 0px 25px -15px rgba(0, 0, 0, 0.3);
    }

    .input:focus {
      box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5);
    }

    .search-icon {
      fill: #6b7280;
    }

    .input:focus + .search-icon,
    .input:hover + .search-icon {
      fill: #a855f7;
    }
  }

  @media (max-width: 640px) {
    .group {
      max-width: 100%;
    }
  }
`;

export function ModernSearchInput({ 
  value, 
  onChange, 
  placeholder = "🔍 Search...", 
  maxWidth,
  className 
}: ModernSearchInputProps) {
  return (
    <StyledWrapper $maxWidth={maxWidth} className={className}>
      <div className="group">
        <input
          id="search-query"
          className="input"
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <svg viewBox="0 0 24 24" aria-hidden="true" className="search-icon">
          <g>
            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
          </g>
        </svg>
      </div>
    </StyledWrapper>
  );
}
