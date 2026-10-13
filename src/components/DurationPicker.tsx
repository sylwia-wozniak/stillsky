import React, { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { Chip } from './Chip';

interface DurationPickerProps {
  options: number[];
  value: number;
  onChange(min: number): void;
  testIdFor(min: number): string;
}

export function DurationPicker({ options, value, onChange, testIdFor }: DurationPickerProps) {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const didInitialScroll = useRef(false);

  return (
    <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
      {options.map(m => (
        <View
          key={m}
          onLayout={e => {
            // Bring the initially selected duration into view once.
            if (m === value && !didInitialScroll.current) {
              didInitialScroll.current = true;
              scrollRef.current?.scrollTo({ x: Math.max(0, e.nativeEvent.layout.x - 40), animated: false });
            }
          }}>
          <Chip
            label={`${m} min`}
            selected={m === value}
            onPress={() => onChange(m)}
            testID={testIdFor(m)}
            accessibilityLabel={`${m} minutes`}
          />
        </View>
      ))}
    </ScrollView>
  );
}
