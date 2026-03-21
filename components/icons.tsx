import type { ReactNode } from 'react';

import { cn } from '../lib/utils';

interface IconProps {
  className?: string;
}

function BaseIcon({ className, path }: IconProps & { path: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn('h-4 w-4', className)}>
      {path}
    </svg>
  );
}

export function SparklesIcon({ className }: IconProps) {
  return <BaseIcon className={className} path={<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm6 9 1 2.8L22 16l-3 1.2L18 20l-1-2.8L14 16l3-1.2L18 12Zm-12 1 1 2.8L10 17l-3 1.2L6 21l-1-2.8L2 17l3-1.2L6 13Z" />} />;
}

export function LoaderIcon({ className }: IconProps) {
  return <BaseIcon className={cn('animate-spin', className)} path={<><path d="M21 12a9 9 0 1 1-6.2-8.6" /><path d="M21 3v6h-6" /></>} />;
}

export function BrainIcon({ className }: IconProps) {
  return <BaseIcon className={className} path={<path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8A3 3 0 0 0 6 13v1a3 3 0 0 0 3 3m0-13a3 3 0 0 1 3-2 3 3 0 0 1 3 3 3 3 0 0 1 3 3 3 3 0 0 1 0 6 3 3 0 0 1-3 3 3 3 0 0 1-3-2m-3 0h6m-6-4h4m-4 8h4" />} />;
}

export function RadarIcon({ className }: IconProps) {
  return <BaseIcon className={className} path={<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="M12 12 18 6" /></>} />;
}

export function FlaskIcon({ className }: IconProps) {
  return <BaseIcon className={className} path={<><path d="M10 3h4" /><path d="M10 3v5l-5 8a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 16l-5-8V3" /><path d="M8 14h8" /></>} />;
}

export function WrenchIcon({ className }: IconProps) {
  return <BaseIcon className={className} path={<path d="M14 6a4 4 0 0 0 4.9 4.9l-7.5 7.5a2 2 0 0 1-2.8 0l-.5-.5a2 2 0 0 1 0-2.8l7.5-7.5A4 4 0 0 0 14 6Z" />} />;
}

export function AlertIcon({ className }: IconProps) {
  return <BaseIcon className={className} path={<><path d="M12 8v5" /><path d="M12 17h.01" /><path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" /></>} />;
}
