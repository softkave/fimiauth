"use client";

import { cn } from "@/src/lib/utils.js";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "./badge.js";
import { Button } from "./button.js";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";

export interface IComboboxOption {
  label: string;
  value: string;
}

export interface IComboboxRenderSelectedProps {
  options: IComboboxOption[];
  onRemove: (value: string) => void;
}

export interface IComboboxProps {
  options: IComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundMessage?: string;
  onChange: (value: string[]) => void;
  value: string[];
  isMultiSelect?: boolean;
  renderSelected?: (props: IComboboxRenderSelectedProps) => React.ReactNode;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  notFoundMessage = "No option found.",
  isMultiSelect = false,
  renderSelected: inputRenderSelected,
}: IComboboxProps) {
  const [open, setOpen] = useState(false);

  const valueRecord = useMemo(() => {
    return value.reduce((acc, curr) => {
      acc[curr] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }, [value]);

  const optionsRecord = useMemo(() => {
    return options.reduce((acc, curr) => {
      acc[curr.value] = curr;
      return acc;
    }, {} as Record<string, IComboboxOption>);
  }, [options]);

  const selectedOptions = useMemo(() => {
    return value.map((v) => optionsRecord[v]);
  }, [value, optionsRecord]);

  const defaultRenderSelected = useCallback(
    (props: IComboboxRenderSelectedProps) => {
      return (
        <div>
          {props.options.map((option) => (
            <Badge key={option.value} variant="outline" className="space-x-2">
              <span>{option.label}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  props.onRemove(option.value);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </Badge>
          ))}
        </div>
      );
    },
    [value, optionsRecord, onChange]
  );

  const handleRemove = useCallback(
    (inputValue: string) => {
      onChange(value.filter((v) => v !== inputValue));
    },
    [onChange]
  );

  const renderSelected = inputRenderSelected ?? defaultRenderSelected;
  const renderSelectedProps = useMemo(
    (): IComboboxRenderSelectedProps => ({
      options: selectedOptions,
      onRemove: handleRemove,
    }),
    [selectedOptions, handleRemove]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {renderSelected(renderSelectedProps)}
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{notFoundMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    const isSelected = value.includes(currentValue);
                    if (isSelected) {
                      onChange(value.filter((v) => v !== currentValue));
                    } else {
                      onChange([...value, currentValue]);
                    }

                    if (!isMultiSelect) {
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      valueRecord[option.value] ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
