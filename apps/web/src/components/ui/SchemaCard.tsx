import React from 'react';
import { Clock, BarChart3, Search, Globe, Bot, Settings, Users, Link2, Wrench } from 'lucide-react';

export interface SchemaCardProps {
  title: string;
  description: string;
  badge?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  status?: 'live' | 'draft' | 'archived';
  href?: string;
}

export function SchemaCard({
  title,
  description,
  badge,
  icon,
  actionText = 'Подробнее',
  onAction,
  status = 'live',
  href,
}: SchemaCardProps) {
  const ActionComponent = href ? 'a' : 'button';
  const actionProps = href
    ? { href, onClick: onAction }
    : { onClick: onAction, type: 'button' as const };

  return (
    <div className="relative card-border overflow-hidden rounded-2xl flex flex-col bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors">
      <div className="p-2 flex justify-center relative">
        <div className="w-full rounded-xl border border-white/20 bg-white/5 overflow-hidden relative flex flex-col items-center justify-center pt-3 pb-2">
          {icon && (
            <div className="text-white/80 mb-2">
              {icon}
            </div>
          )}
          <h3 className="text-sm font-medium text-white text-center px-2">{title}</h3>
        </div>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="p-3">
        {badge && (
          <span className="inline-block px-3 py-1 glass text-white/70 rounded-full text-xs font-medium mb-2 border border-white/20">
            {badge}
          </span>
        )}
        <p className="text-white/70 leading-relaxed text-xs">
          {description}
        </p>
      </div>
    </div>
  );
}

// Export icons for easy usage
export const Icons = {
  Clock,
  BarChart3,
  Search,
  Globe,
  Bot,
  Settings,
  Users,
  Link2,
  Wrench,
};
