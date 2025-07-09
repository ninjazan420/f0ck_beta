'use client';
import { useState, useEffect } from 'react';
import { ContentRating } from './PostsPage';
import { useSearchParams } from 'next/navigation';
import styled, { keyframes, css } from 'styled-components';
import { ModernSearchInput } from '@/components/ui/ModernSearchInput';

const SORT_OPTIONS = {
  newest: '🆕 Newest First',
  oldest: '📅 Oldest First',
  most_liked: '❤️ Most Liked',
  most_commented: '💬 Most Commented'
} as const;

interface FilterState {
  searchText: string;
  tags: string[];
  uploader: string;
  commenter: string;
  sortBy: keyof typeof SORT_OPTIONS;
  minLikes: number;
  dateFrom: string;
  dateTo: string;
  contentRating: ContentRating[];
  author: string;
  likedBy: string;
  favoritedBy: string;
}

interface PostFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  infiniteScroll: boolean;
  onToggleInfiniteScroll: (enabled: boolean) => void;
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

const ContentRatingRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);

  @media (prefers-color-scheme: dark) {
    border-color: rgba(75, 85, 99, 0.5);
  }
`;

const SortSelect = styled.select`
  padding: 0.625rem 0.875rem;
  border: none;
  border-radius: 0.625rem;
  background: rgba(243, 244, 246, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;

  &:focus {
    outline: none;
    background: white;
    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
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
    background: ${props.$active
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &:active {
      animation: ${pulse} 0.2s ease;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    &:hover::before {
      left: 100%;
    }
  ` : css`
    background: rgba(243, 244, 246, 0.8);
    color: #6b7280;

    &:hover {
      background: rgba(229, 231, 235, 1);
      transform: translateY(-1px);
    }

    @media (prefers-color-scheme: dark) {
      background: rgba(55, 65, 81, 0.8);
      color: #9ca3af;

      &:hover {
        background: rgba(75, 85, 99, 1);
      }
    }
  `}
`;

// Content Rating Button Component
const ContentRatingButton = styled.button<{ $active: boolean; $rating: ContentRating }>`
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  ${props => {
    const colors = {
      safe: {
        bg: '#10b981',
        light: '#d1fae5',
        dark: '#065f46'
      },
      sketchy: {
        bg: '#f59e0b',
        light: '#fef3c7',
        dark: '#92400e'
      },
      unsafe: {
        bg: '#ef4444',
        light: '#fee2e2',
        dark: '#991b1b'
      }
    };

    const color = colors[props.$rating];

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

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }

      &:hover::before {
        left: 100%;
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

const DatePickerSection = styled.div<{ $show: boolean }>`
  overflow: hidden;
  transition: all 0.3s ease;

  ${props => props.$show ? css`
    max-height: 200px;
    opacity: 1;
    margin-bottom: 0.75rem;
  ` : css`
    max-height: 0;
    opacity: 0;
    margin-bottom: 0;
  `}
`;

const DatePickerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(243, 244, 246, 0.5);
  border-radius: 0.5rem;
  flex-wrap: wrap;

  @media (prefers-color-scheme: dark) {
    background: rgba(55, 65, 81, 0.5);
  }
`;

export function PostFilter({ filters, onFilterChange, infiniteScroll, onToggleInfiniteScroll }: PostFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const searchParams = useSearchParams();

  // Function to toggle content ratings
  const toggleRating = (rating: ContentRating) => {
    const currentRatings = filters.contentRating;
    let newRatings: ContentRating[];

    if (currentRatings.includes(rating)) {
      // Remove rating, but ensure at least one remains selected
      newRatings = currentRatings.filter(r => r !== rating);
      if (newRatings.length === 0) {
        // If all would be removed, keep the current one
        newRatings = [rating];
      }
    } else {
      // Add the rating
      newRatings = [...currentRatings, rating];
    }

    console.log('New content ratings:', newRatings);
    onFilterChange({ ...filters, contentRating: newRatings });
  };

  useEffect(() => {
    const author = searchParams.get('uploader');
    if (author && filters.uploader !== author) {
      onFilterChange({ ...filters, uploader: author });
    }
  }, [searchParams, filters.uploader]);

  // Check if advanced filters are active
  const hasAdvancedFilters = filters.uploader || filters.commenter || filters.minLikes > 0 ||
                            filters.dateFrom || filters.dateTo || filters.author ||
                            filters.likedBy || filters.favoritedBy;

  return (
    <FilterContainer>
      {/* Main Filter Row */}
      <MainRow>
        <ModernSearchInput
          placeholder="🔍 Search posts, tags, descriptions..."
          value={filters.searchText}
          onChange={value => onFilterChange({ ...filters, searchText: value })}
          maxWidth="300px"
        />

        <SortSelect
          value={filters.sortBy}
          onChange={e => onFilterChange({ ...filters, sortBy: e.target.value as keyof typeof SORT_OPTIONS })}
        >
          {Object.entries(SORT_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
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

      {/* Content Rating Row */}
      <ContentRatingRow>
        <ContentRatingButton
          $active={filters.contentRating.includes('safe')}
          $rating="safe"
          onClick={() => toggleRating('safe')}
        >
          ✅ Safe
        </ContentRatingButton>
        <ContentRatingButton
          $active={filters.contentRating.includes('sketchy')}
          $rating="sketchy"
          onClick={() => toggleRating('sketchy')}
        >
          ⚠️ Sketchy
        </ContentRatingButton>
        <ContentRatingButton
          $active={filters.contentRating.includes('unsafe')}
          $rating="unsafe"
          onClick={() => toggleRating('unsafe')}
        >
          🔞 Unsafe
        </ContentRatingButton>

        <button
          onClick={() => onToggleInfiniteScroll(!infiniteScroll)}
          className={`px-4 py-2 text-sm font-normal rounded-lg transition-all ${
            infiniteScroll
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          ♾️ Infinite Scroll
        </button>
      </ContentRatingRow>

      {/* Advanced Filters */}
      <AdvancedSection $show={showAdvanced}>
        <AdvancedGrid>
          <AdvancedInput
            type="text"
            placeholder="👤 Uploader"
            value={filters.uploader}
            onChange={e => onFilterChange({ ...filters, uploader: e.target.value })}
          />

          <AdvancedInput
            type="text"
            placeholder="💬 Commenter"
            value={filters.commenter}
            onChange={e => onFilterChange({ ...filters, commenter: e.target.value })}
          />

          <AdvancedInput
            type="number"
            min="0"
            placeholder="❤️ Min likes"
            value={filters.minLikes || ''}
            onChange={e => onFilterChange({ ...filters, minLikes: parseInt(e.target.value) || 0 })}
          />

          <AdvancedInput
            type="text"
            placeholder="👤 Author"
            value={filters.author}
            onChange={e => onFilterChange({ ...filters, author: e.target.value })}
          />

          <AdvancedInput
            type="text"
            placeholder="❤️ Liked by"
            value={filters.likedBy}
            onChange={e => onFilterChange({ ...filters, likedBy: e.target.value })}
          />

          <AdvancedInput
            type="text"
            placeholder="⭐ Favorited by"
            value={filters.favoritedBy}
            onChange={e => onFilterChange({ ...filters, favoritedBy: e.target.value })}
          />

          <ModernButton
            $variant="secondary"
            $active={showDatePicker}
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            📅 {filters.dateFrom || filters.dateTo ? 'Date filtered' : 'Date range'}
          </ModernButton>
        </AdvancedGrid>

        {/* Date Picker Section */}
        <DatePickerSection $show={showDatePicker}>
          <DatePickerContent>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>From:</span>
            <AdvancedInput
              type="date"
              value={filters.dateFrom}
              onChange={e => onFilterChange({ ...filters, dateFrom: e.target.value })}
              style={{ minWidth: '140px' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>To:</span>
            <AdvancedInput
              type="date"
              value={filters.dateTo}
              onChange={e => onFilterChange({ ...filters, dateTo: e.target.value })}
              style={{ minWidth: '140px' }}
            />
            <ModernButton
              $variant="secondary"
              onClick={() => {
                onFilterChange({ ...filters, dateFrom: '', dateTo: '' });
                setShowDatePicker(false);
              }}
            >
              Clear & Close
            </ModernButton>
          </DatePickerContent>
        </DatePickerSection>
      </AdvancedSection>

      {/* Active Tag Filters Display */}
      {filters.tags && filters.tags.length > 0 && (
        <div style={{
          marginTop: '0.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(229, 231, 235, 0.5)'
        }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active Tags:</span>
          {filters.tags.map(tag => (
            <div key={tag} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {tag}
              <button
                onClick={() => {
                  const newTags = filters.tags.filter(t => t !== tag);
                  onFilterChange({ ...filters, tags: newTags });

                  const url = new URL(window.location.href);
                  const params = new URLSearchParams(url.search);
                  params.delete('tag');
                  newTags.forEach(t => params.append('tag', t));

                  window.history.pushState({}, '', `${url.pathname}?${params.toString()}`);
                  sessionStorage.removeItem('active_tag_filter');
                }}
                style={{
                  marginLeft: '0.25rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </FilterContainer>
  );
}
