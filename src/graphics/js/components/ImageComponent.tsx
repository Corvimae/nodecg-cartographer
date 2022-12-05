import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

interface ImageComponentProps {
  src?: string | string[];
  resolution?: string;
  speed?: number;
  transitionSpeed: number;
}

const DEFAULT_CAROUSEL_SPEED = 5000;

export const ImageComponent: React.FC<ImageComponentProps> = ({
  src,
  resolution,
  speed,
  transitionSpeed,
  ...props
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const carouselIntervalId = useRef(null);
  const activeImageIndexRef = useRef(0);

  const images = useMemo(() => {
    if (typeof src === 'string') return [src];

    return src;
  }, [src]);

  const inverseResolution = useMemo(() => {
    if (!resolution) return 1;
    
    const [x, y] = resolution.split('x').map(Number);

    if (Number.isNaN(x) || Number.isNaN(y)) return 1;

    return y / x;
  }, [resolution]);

  useEffect(() => {
    if (images.length > 1) {
      carouselIntervalId.current = setInterval(() => {
        const nextIndex = (activeImageIndexRef.current + 1) % images.length;

        setActiveImageIndex(nextIndex);
        activeImageIndexRef.current = nextIndex;
      }, speed || DEFAULT_CAROUSEL_SPEED);
    }

    return () => {
      if (carouselIntervalId.current) clearInterval(carouselIntervalId.current);
    }
  }, [images])
  
  return (
    <ImageContainer inverseResolution={inverseResolution} {...props}>
      {images.map((image, index) => (
        <CarouselImage
          key={index}
          transitionSpeed={transitionSpeed}
          className={index === activeImageIndex ? 'active' : ''}
          src={image}
        />
      ))}
    </ImageContainer>
  )
};

const ImageContainer = styled.div<{ inverseResolution: number }>`
  position: relative;
  padding-top: ${({ inverseResolution }) => inverseResolution * 100}%;
`;

const CarouselImage = styled.img<{ transitionSpeed?: number }>`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity ${({ transitionSpeed }) => transitionSpeed || 250}ms linear;

  &.active {
    opacity: 1;
  }
`;
