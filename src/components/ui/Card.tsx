import { ReactNode } from 'react';
import { cn } from '@/lib/utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export default function Card({ children, className, title, description, action }: CardProps) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      {(title || description || action) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
