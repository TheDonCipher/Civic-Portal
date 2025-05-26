import { useEffect } from 'react';

interface DialogViewportHandlerProps {
  isOpen: boolean;
}

export function DialogViewportHandler({ isOpen }: DialogViewportHandlerProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
      
      // Ensure viewport meta tag is properly set for mobile
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      
      // Set optimal viewport settings for dialog
      viewportMeta.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
      
      // Handle mobile viewport height issues
      const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setViewportHeight();
      window.addEventListener('resize', setViewportHeight);
      window.addEventListener('orientationchange', setViewportHeight);
      
      return () => {
        window.removeEventListener('resize', setViewportHeight);
        window.removeEventListener('orientationchange', setViewportHeight);
      };
    } else {
      // Restore body scroll when dialog is closed
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return null;
}

export default DialogViewportHandler;
