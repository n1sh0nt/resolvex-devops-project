import clsx from 'clsx';

export default function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-[3px]' };
  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'animate-spin rounded-full border-ink-200 border-t-brass-400',
        sizes[size],
        className
      )}
    />
  );
}
