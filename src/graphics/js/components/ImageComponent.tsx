import React from 'react';

interface ImageComponentProps {
  src?: string;
}

export const ImageComponent: React.FC<ImageComponentProps> = ({ src, ...props }) => (
  <img src={src} {...props} />
)
