import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

interface Props {
  rightLabel: string;
  leftLabel?: string;
}

export const LabeledSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & Props
>(({ id, checked, onCheckedChange, leftLabel, rightLabel, ...props }, ref) => {
  const [value, setValue] = useState(checked ?? false);
  return (
    <div className="flex items-center space-x-2">
      <Label
        className={cn([value ? 'text-black/50' : 'text-black'])}
        htmlFor={`${id}-switch`}
      >
        {leftLabel}
      </Label>
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
        {rightLabel}
      </Label>
    </div>
  );
});
