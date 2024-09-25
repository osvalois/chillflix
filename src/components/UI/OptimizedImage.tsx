// src/components/UI/OptimizedImage.tsx
import React, { forwardRef, useState } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Blurhash } from 'react-blurhash';
import { useInView } from 'react-intersection-observer';

interface OptimizedImageProps extends BoxProps {
  src: string;
  alt: string;
  blurhash?: string;
}

const OptimizedImage = forwardRef<HTMLDivElement, OptimizedImageProps>(
  ({ src, alt, blurhash, ...props }, ref) => {
    const [loaded, setLoaded] = useState(false);
    const { ref: inViewRef, inView } = useInView({
      triggerOnce: true,
      rootMargin: '200px 0px',
    });

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
        inViewRef(node);
      },
      [ref, inViewRef]
    );

    return (
      <Box ref={setRefs} position="relative" overflow="hidden" {...props}>
        {inView && (
          <>
            <Blurhash
              hash={blurhash || 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'}
              width="100%"
              height="100%"
              resolutionX={32}
              resolutionY={32}
              punch={1}
              style={{ display: loaded ? 'none' : 'block' }}
            />
            <LazyLoadImage
              key={src}
              src={src}
              alt={alt}
              effect="blur"
              afterLoad={() => setLoaded(true)}
              wrapperProps={{
                style: {
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: loaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
          </>
        )}
      </Box>
    );
  }
);

export default OptimizedImage;