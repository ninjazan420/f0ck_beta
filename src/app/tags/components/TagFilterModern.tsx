'use client';
import { useState } from 'react';
import { SortBy, Filters } from './TagsPage';
import styled, { keyframes, css } from 'styled-components';
import { ModernSearchInput } from '@/components/ui/ModernSearchInput';

interface TagFilterProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

// Animations
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const FilterContainer = styled.div`
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  @media (prefers-color-scheme: dark) {
    background: rgba(17, 24, 39, 0.8);
    border-color: rgba(75, 85, 99, 0.3);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }
`;

const MainRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  @media (min-width: 640px) {
    flex-direction: row;
    gap: 0.75rem;
  }
`;

const SortSelect = styled.select`
  padding: 0.625rem 0.875rem;
  border: none;
  border-radius: 0.625rem;
  background: rgba(243, 244, 246, 0.8);
  font-size: 0.875rem;
  min-width: 120px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    background: white;
    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.1);
  }

  @media (prefers-color-scheme: dark) {
    background: rgba(55, 65, 81, 0.8);
    color: white;

    &:focus {
      background: rgba(55, 65, 81, 1);
    }
  }
`;

// Modern Button inspired by uiverse.io
const ModernButton = styled.button<{ $active?: boolean; $variant?: 'primary' | 'secondary' }>`
  position: relative;
  padding: 0.625rem 0.875rem;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  ${props => props.$variant === 'primary' ? css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    
    &:hover::before {
      left: 100%;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  ` : css`
    background: ${props.$active ? 'rgba(147, 51, 234, 0.1)' : 'rgba(243, 244, 246, 0.8)'};
    color: ${props.$active ? '#7c3aed' : '#6b7280'};
    
    &:hover {
      background: ${props.$active ? 'rgba(147, 51, 234, 0.2)' : 'rgba(229, 231, 235, 1)'};
      transform: translateY(-1px);
    }
    
    @media (prefers-color-scheme: dark) {
      background: ${props.$active ? 'rgba(147, 51, 234, 0.3)' : 'rgba(55, 65, 81, 0.8)'};
      color: ${props.$active ? '#a855f7' : '#9ca3af'};
      
      &:hover {
        background: ${props.$active ? 'rgba(147, 51, 234, 0.4)' : 'rgba(75, 85, 99, 1)'};
      }
    }
  `}
`;

// Time Range Buttons with role-based styling
const TimeRangeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`;

const TimeRangeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const TimeRangeLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
`;

const TimeRangeButton = styled.button<{ $active: boolean; $timeRange: string }>`
  position: relative;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  
  ${props => {
    const colors = {
      all: { bg: '#10b981', light: '#d1fae5', dark: '#065f46' },
      day: { bg: '#f59e0b', light: '#fef3c7', dark: '#92400e' },
      week: { bg: '#ef4444', light: '#fee2e2', dark: '#991b1b' },
      month: { bg: '#8b5cf6', light: '#ede9fe', dark: '#5b21b6' },
      year: { bg: '#06b6d4', light: '#cffafe', dark: '#0e7490' }
    };
    
    const color = colors[props.$timeRange as keyof typeof colors] || colors.all;
    
    return css`
      background: ${props.$active ? color.bg : 'rgba(243, 244, 246, 0.8)'};
      color: ${props.$active ? 'white' : '#6b7280'};
      
      &:hover {
        background: ${props.$active ? color.bg : color.light};
        color: ${props.$active ? 'white' : color.dark};
        transform: translateY(-2px);
        box-shadow: 0 4px 12px ${color.bg}40;
      }
      
      &:active {
        animation: ${pulse} 0.2s ease;
      }
      
      @media (prefers-color-scheme: dark) {
        background: ${props.$active ? color.bg : 'rgba(55, 65, 81, 0.8)'};
        color: ${props.$active ? 'white' : '#9ca3af'};
        
        &:hover {
          background: ${props.$active ? color.bg : `${color.bg}30`};
          color: ${props.$active ? 'white' : color.bg};
        }
      }
    `;
  }}
`;

const AdvancedSection = styled.div<{ $show: boolean }>`
  overflow: hidden;
  transition: all 0.3s ease;
  
  ${props => props.$show ? css`
    max-height: 500px;
    opacity: 1;
    animation: ${slideIn} 0.3s ease;
  ` : css`
    max-height: 0;
    opacity: 0;
  `}
`;

const AdvancedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(229, 231, 235, 0.5);

  @media (prefers-color-scheme: dark) {
    border-color: rgba(75, 85, 99, 0.5);
  }
`;

const AdvancedInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: rgba(243, 244, 246, 0.8);
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    background: white;
    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
  }

  @media (prefers-color-scheme: dark) {
    background: rgba(55, 65, 81, 0.8);
    color: white;

    &::placeholder {
      color: #6b7280;
    }

    &:focus {
      background: rgba(55, 65, 81, 1);
    }
  }
`;

export function TagFilterModern({ filters, onFilterChange }: TagFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const timeRangeOptions = [
    { value: 'all', label: '🕒 All Time' },
    { value: 'day', label: '📅 Today' },
    { value: 'week', label: '📆 This Week' },
    { value: 'month', label: '📅 This Month' },
    { value: 'year', label: '📅 This Year' }
  ] as const;

  const sortOptions = [
    { value: 'most_used', label: '🔥 Most Used' },
    { value: 'newest', label: '🆕 Newest' },
    { value: 'alphabetical', label: '🔤 A-Z' },
    { value: 'trending', label: '📈 Trending' }
  ] as const;

  const hasAdvancedFilters = filters.creator || filters.usedBy || filters.minPosts > 0;

  return (
    <FilterContainer>
      {/* Main Filter Row */}
      <MainRow>
        <ModernSearchInput
          placeholder="🔍 Search tags..."
          value={filters.search}
          onChange={value => onFilterChange({ ...filters, search: value })}
          maxWidth="300px"
        />
        
        <SortSelect
          value={filters.sortBy}
          onChange={e => onFilterChange({ ...filters, sortBy: e.target.value as SortBy })}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SortSelect>
        
        <ModernButton
          $variant="primary"
          $active={!!(showAdvanced || hasAdvancedFilters)}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {hasAdvancedFilters ? '⚙️ Filters' : '⚙️ More'}
        </ModernButton>
      </MainRow>

      {/* Time Range Buttons */}
      <TimeRangeContainer>
        <TimeRangeGroup>
          <TimeRangeLabel>Time Range:</TimeRangeLabel>

          {timeRangeOptions.map(option => (
            <TimeRangeButton
              key={option.value}
              $active={filters.timeRange === option.value}
              $timeRange={option.value}
              onClick={() => onFilterChange({ ...filters, timeRange: option.value })}
            >
              {option.label}
            </TimeRangeButton>
          ))}
        </TimeRangeGroup>
      </TimeRangeContainer>

      {/* Advanced Filters */}
      <AdvancedSection $show={showAdvanced}>
        <AdvancedGrid>
          <AdvancedInput
            type="text"
            placeholder="👤 Creator"
            value={filters.creator}
            onChange={e => onFilterChange({ ...filters, creator: e.target.value })}
          />
          
          <AdvancedInput
            type="text"
            placeholder="👤 Used by user"
            value={filters.usedBy}
            onChange={e => onFilterChange({ ...filters, usedBy: e.target.value })}
          />
          
          <AdvancedInput
            type="number"
            min="0"
            placeholder="📝 Min posts"
            value={filters.minPosts || ''}
            onChange={e => onFilterChange({ ...filters, minPosts: parseInt(e.target.value) || 0 })}
          />
        </AdvancedGrid>
      </AdvancedSection>
    </FilterContainer>
  );
}
