import { useEffect } from 'react';
import { useSettings } from './useSettings';

/**
 * Hook to control GIF autoplay based on user settings
 * This works by replacing GIF sources with static images when autoplay is disabled
 */
export function useGifAutoplay() {
  const { settings } = useSettings();

  useEffect(() => {
    const controlGifAutoplay = () => {
      // Find all img elements with data-no-autoplay attribute
      const gifImages = document.querySelectorAll('img[data-no-autoplay="true"]');
      
      gifImages.forEach((img) => {
        const imgElement = img as HTMLImageElement;
        const originalSrc = imgElement.src;
        
        if (!settings.autoplayGifs) {
          // If autoplay is disabled, try to get a static version
          // For now, we'll use a simple approach - on hover, show the animated version
          imgElement.addEventListener('mouseenter', () => {
            if (imgElement.dataset.originalSrc) {
              imgElement.src = imgElement.dataset.originalSrc;
            }
          });
          
          imgElement.addEventListener('mouseleave', () => {
            if (imgElement.dataset.staticSrc) {
              imgElement.src = imgElement.dataset.staticSrc;
            }
          });
          
          // Store original src if not already stored
          if (!imgElement.dataset.originalSrc) {
            imgElement.dataset.originalSrc = originalSrc;
          }
        } else {
          // If autoplay is enabled, ensure we're showing the animated version
          if (imgElement.dataset.originalSrc) {
            imgElement.src = imgElement.dataset.originalSrc;
          }
        }
      });
    };

    // Run immediately
    controlGifAutoplay();
    
    // Also run when new content is loaded (for dynamic content)
    const observer = new MutationObserver(() => {
      controlGifAutoplay();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      observer.disconnect();
    };
  }, [settings.autoplayGifs]);
}