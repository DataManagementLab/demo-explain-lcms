import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

interface Props {
  label: string;
}

export const LabeledSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & Props
>(({ id, checked, onCheckedChange, label, ...props }, ref) => {
  const [value, setValue] = useState(checked ?? false);
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`${id}-switch`}
        checked={value}
        onCheckedChange={(value) => {
          if (onCheckedChange) {
            onCheckedChange(value);
          }
          setValue(value);
        }}
        {...props}
        ref={ref}
      />
      <Label
        className={cn([value ? 'text-black' : 'text-black/50'])}
        htmlFor={`${id}-switch`}
      >
        {label}
      </Label>
    </div>
  );
});
