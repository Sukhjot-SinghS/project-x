interface AbstractTripCoverProps {
  svgString: string;
  className?: string;
  rounded?: boolean;
}

export function AbstractTripCover({ svgString, className, rounded = true }: AbstractTripCoverProps) {
  return (
    <div
      className={`w-full h-full ${rounded ? 'rounded-2xl' : ''} overflow-hidden ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
