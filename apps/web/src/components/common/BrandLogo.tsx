import { Link } from 'react-router-dom';
import clsx from 'clsx';

type BrandLogoProps = {
  to?: string;
  imgSrc?: string;
  imgClassName?: string;
  className?: string;
  showFallbackText?: boolean;
  fallbackTextClassName?: string;
};

export function BrandLogo({
  to = '/',
  imgSrc = '/brand/logo.png',
  imgClassName = 'h-9 w-auto',
  className,
  showFallbackText = true,
  fallbackTextClassName = 'text-lg',
}: BrandLogoProps) {
  return (
    <Link to={to} className={clsx('flex items-center gap-2 group', className)}>
      <div className="rounded-full overflow-hidden border-2 border-slate-700/50 bg-slate-800/50 p-1">
        <img
          src={imgSrc}
          alt="Uzbek Ta'lim"
          className={clsx(imgClassName, 'rounded-full object-cover')}
        />
      </div>
      {showFallbackText && (
        <span className={clsx('font-bold gradient-text', fallbackTextClassName)}>
          Uzbek Ta&apos;lim
        </span>
      )}
    </Link>
  );
}


