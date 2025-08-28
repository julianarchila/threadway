import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  field: any;
  label: string;
  placeholder: string;
  type?: string;
}

export function FormField({ field, label, placeholder, type = "text" }: FormFieldProps) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={field.name} className="text-right">
        {label}
      </Label>
      <div className="col-span-3">
        <Input
          id={field.name}
          name={field.name}
          type={type}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          placeholder={placeholder}
        />
        {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
          <p className="text-sm text-red-500 mt-1">
            {field.state.meta.errors[0]}
          </p>
        )}
        {field.state.meta.isValidating && (
          <p className="text-sm text-muted-foreground mt-1">Validating...</p>
        )}
      </div>
    </div>
  );
}
