import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export interface SearchableSelectOption<T = string> {
  value: T;
  label: string;
  subLabel?: string;
  badge?: React.ReactNode;
  extra?: React.ReactNode;
  keywords?: string[];
}

export interface SearchableSelectProps<T = string> {
  options: SearchableSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Vui lòng chọn...',
  searchPlaceholder = 'Nhập từ khóa tìm kiếm...',
  label,
  badge,
  disabled = false,
  className = '',
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Lọc options theo search term (đã debounce)
  const filteredOptions = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return options;
    const term = debouncedSearchTerm.toLowerCase().trim();
    return options.filter((opt) => {
      const labelMatch = opt.label.toLowerCase().includes(term);
      const subMatch = (opt.subLabel || '').toLowerCase().includes(term);
      const extraMatch = typeof opt.extra === 'string' && opt.extra.toLowerCase().includes(term);
      const keywordsMatch = opt.keywords?.some((k) => k.toLowerCase().includes(term));
      return labelMatch || subMatch || extraMatch || keywordsMatch;
    });
  }, [options, debouncedSearchTerm]);

  // Option đang được chọn
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  const handleToggleOpen = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleSelectOption = (optValue: T) => () => {
    onChange(optValue);
    setIsOpen(false);
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  return (
    <div className={`space-y-2 p-3.5 bg-white rounded-xl border border-indigo-200 shadow-xs ${className}`}>
      {/* Header Label + Badge */}
      {(label || badge) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-xs font-extrabold text-slate-800">
              {label}
            </label>
          )}
          {badge && (
            <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Combobox Trigger & Dropdown Menu */}
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={handleToggleOpen}
          className={`w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border rounded-xl text-xs font-bold text-slate-900 flex items-center justify-between gap-2 transition-all cursor-pointer select-none text-left ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            isOpen
              ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-white'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedOption?.badge}
            <span className="font-bold text-slate-900 truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.extra && (
              <span className="text-[11px] text-slate-500 font-normal hidden sm:inline">
                • {selectedOption.extra}
              </span>
            )}
            {selectedOption?.subLabel && (
              <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                {selectedOption.subLabel}
              </span>
            )}
          </div>
          <div className="text-slate-400 shrink-0">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* Dropdown Menu Popup */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Thanh Search tích hợp bên trong */}
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-300 focus:border-indigo-600 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors shadow-2xs"
                  onClick={handleInputClick}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Danh sách kết quả */}
            <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 select-none">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <div
                      key={String(opt.value)}
                      onClick={handleSelectOption(opt.value)}
                      className={`p-2 rounded-lg flex items-center justify-between gap-2 cursor-pointer text-xs transition-colors ${
                        isSelected
                          ? 'bg-indigo-50/90 text-indigo-950 font-bold border border-indigo-100'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {opt.badge}
                        <span className="font-bold text-slate-900 truncate">
                          {opt.label}
                        </span>
                        {opt.extra && (
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {opt.extra}
                          </span>
                        )}
                        {opt.subLabel && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {opt.subLabel}
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <Check size={14} className="text-indigo-600 shrink-0" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 space-y-1">
                  <p>Không tìm thấy mục nào phù hợp với</p>
                  <p className="font-bold text-slate-800 break-words">"{searchTerm}"</p>
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="mt-1 text-indigo-600 hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    Xóa tìm kiếm / Xem tất cả
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
