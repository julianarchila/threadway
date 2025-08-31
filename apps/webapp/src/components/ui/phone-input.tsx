import * as React from "react";
import { CheckIcon, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  getCountries, 
  getCountryCallingCode, 
  parsePhoneNumber, 
  isValidPhoneNumber,
  type CountryCode 
} from "libphonenumber-js";

// Types
interface Country {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

export interface PhoneInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: string;
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  defaultCountry?: CountryCode;
}

// Utility functions
const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const createCountry = (countryCode: CountryCode): Country | null => {
  try {
    const callingCode = getCountryCallingCode(countryCode);
    return {
      code: countryCode,
      name: new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode,
      dialCode: `+${callingCode}`,
      flag: getFlagEmoji(countryCode),
    };
  } catch {
    return null;
  }
};

const getAllCountries = (): Country[] => {
  return getCountries()
    .map(createCountry)
    .filter((country): country is Country => country !== null);
};

const cleanPhoneNumber = (value: string): string => {
  return value.replace(/[^\d]/g, "");
};

const formatPhoneInput = (value: string): string => {
  return value.replace(/[^\d\s\-\(\)]/g, "");
};

const filterCountries = (countries: Country[], query: string): Country[] => {
  if (!query) return countries;
  
  const searchTerm = query.toLowerCase();
  return countries.filter(country => 
    country.name.toLowerCase().includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm) ||
    country.dialCode.includes(searchTerm)
  );
};

// Custom hooks
const useCountries = () => {
  return React.useMemo(() => getAllCountries(), []);
};

const usePhoneValidation = (dialCode: string, nationalNumber: string, onValidationChange?: (isValid: boolean) => void) => {
  React.useEffect(() => {
    const digits = cleanPhoneNumber(nationalNumber);
    const fullNumber = dialCode + digits;
    const isValid = digits.length > 0 && isValidPhoneNumber(fullNumber);
    onValidationChange?.(isValid);
  }, [dialCode, nationalNumber, onValidationChange]);
};

// Components
const CountrySelector: React.FC<{
  selectedCountry: Country;
  countries: Country[];
  searchQuery: string;
  isOpen: boolean;
  onSearchChange: (query: string) => void;
  onCountrySelect: (country: Country) => void;
  onOpenChange: (open: boolean) => void;
}> = ({ selectedCountry, countries, searchQuery, isOpen, onSearchChange, onCountrySelect, onOpenChange }) => {
  const filteredCountries = React.useMemo(() => 
    filterCountries(countries, searchQuery), 
    [countries, searchQuery]
  );

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex gap-2 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10 min-w-[120px]"
        >
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm text-muted-foreground">
            {selectedCountry.dialCode}
          </span>
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="h-60">
          {filteredCountries.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No countries found.
            </div>
          ) : (
            <div className="p-1">
              {filteredCountries.map((country) => (
                <div
                  key={country.code}
                  className="flex items-center gap-3 p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                  onClick={() => onCountrySelect(country)}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 text-sm">{country.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {country.dialCode}
                  </span>
                  {country.code === selectedCountry.code && (
                    <CheckIcon className="size-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

// Main component
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = "", onChange, onValidationChange, defaultCountry = "US", ...props }, ref) => {
    const countries = useCountries();
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(() => 
      countries.find(c => c.code === defaultCountry) || countries[0]
    );
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [nationalNumber, setNationalNumber] = React.useState("");
    const isInternalUpdate = React.useRef(false);

    // Validation effect
    usePhoneValidation(selectedCountry.dialCode, nationalNumber, onValidationChange);

    // Parse incoming value
    React.useEffect(() => {
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false;
        return;
      }

      if (!value) {
        setNationalNumber("");
        return;
      }

      try {
        const parsed = parsePhoneNumber(value);
        if (parsed?.country) {
          const country = countries.find(c => c.code === parsed.country);
          if (country) {
            setSelectedCountry(country);
            setNationalNumber(parsed.nationalNumber);
            return;
          }
        }
      } catch {
        // Continue to fallback
      }

      // Fallback: clean value and remove country code
      const cleanValue = value.replace(selectedCountry.dialCode, "");
      setNationalNumber(cleanPhoneNumber(cleanValue));
    }, [value, countries, selectedCountry.dialCode]);

    // Handlers
    const handleInputChange = React.useCallback((inputValue: string) => {
      const cleaned = formatPhoneInput(inputValue);
      setNationalNumber(cleaned);
      
      const digits = cleanPhoneNumber(cleaned);
      const fullNumber = selectedCountry.dialCode + digits;
      
      isInternalUpdate.current = true;
      onChange?.(fullNumber);
    }, [selectedCountry.dialCode, onChange]);

    const handleCountrySelect = React.useCallback((country: Country) => {
      setSelectedCountry(country);
      setIsOpen(false);
      setSearchQuery("");
      
      const digits = cleanPhoneNumber(nationalNumber);
      const fullNumber = country.dialCode + digits;
      
      isInternalUpdate.current = true;
      onChange?.(fullNumber);
    }, [nationalNumber, onChange]);

    const handleSearchChange = React.useCallback((query: string) => {
      setSearchQuery(query);
    }, []);

    const handleOpenChange = React.useCallback((open: boolean) => {
      setIsOpen(open);
      if (!open) setSearchQuery("");
    }, []);

    return (
      <div className={cn("flex", className)}>
        <CountrySelector
          selectedCountry={selectedCountry}
          countries={countries}
          searchQuery={searchQuery}
          isOpen={isOpen}
          onSearchChange={handleSearchChange}
          onCountrySelect={handleCountrySelect}
          onOpenChange={handleOpenChange}
        />
        
        <Input
          ref={ref}
          type="tel"
          value={nationalNumber}
          onChange={(e) => handleInputChange(e.target.value)}
          className="rounded-e-lg rounded-s-none"
          placeholder="Phone number"
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };