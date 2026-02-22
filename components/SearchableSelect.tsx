import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  id?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  error?: boolean;
}

// Helper function to normalize text (remove accents and convert to lowercase)
const normalizeText = (text: string) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  label,
  className = "",
  inputClassName = "",
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find selected option object
  const selectedOption = options.find(opt => opt.value === value);

  // Initialize search term when value changes externally
  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    } else {
      setSearchTerm('');
    }
  }, [selectedOption]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search term to selected value if we click out without selecting new
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        } else {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption]);

  // Filter options (Accent-insensitive)
  const filteredOptions = options.filter(opt => {
    const normalizedSearch = normalizeText(searchTerm);
    const normalizedLabel = normalizeText(opt.label);
    const normalizedSubLabel = opt.subLabel ? normalizeText(opt.subLabel) : '';

    return normalizedLabel.includes(normalizedSearch) ||
      normalizedSubLabel.includes(normalizedSearch);
  });

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && <label htmlFor={id} className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          className={`w-full bg-white text-slate-900 border rounded-md shadow-sm focus:ring-blue-500 p-2 pr-8 placeholder-gray-400 ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} ${inputClassName}`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
            // If user clears text, clear value
            if (e.target.value === '') onChange('');
          }}
          onFocus={() => {
            setIsOpen(true);
            // Optional: select all text on focus for easier replacement
            // inputRef.current?.select(); 
          }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 mr-1"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={16} className="text-gray-400 pointer-events-none" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {filteredOptions.length === 0 ? (
            <div className="cursor-default select-none relative py-2 px-4 text-gray-500">
              Nenhum resultado encontrado.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${option.value === value ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`}
                onClick={() => handleSelect(option)}
              >
                <div className="flex flex-col">
                  <span className={`block truncate ${option.value === value ? 'font-semibold' : 'font-normal'}`}>
                    {option.label}
                  </span>
                  {option.subLabel && (
                    <span className="text-xs text-gray-500 truncate">
                      {option.subLabel}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};