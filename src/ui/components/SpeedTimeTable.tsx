import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {strings} from '../../strings';
import {useTheme} from '../../theme';
import {AppButton} from './AppButton';
import {Icon} from './Icon';

// One row of the table, kept as text while typing.
export type SpeedTimeRow = {step: string; seconds: string};

type Props = {
  rows: SpeedTimeRow[];
  onChange: (rows: SpeedTimeRow[]) => void;
  // Validation message for the whole table.
  message?: string;
};

// The Traction tab's time capture, after vehicles_traction_phone.PNG: speed
// step and seconds side by side, one measurement per row, and an add button.
export const SpeedTimeTable = ({rows, onChange, message}: Props) => {
  const {colors, spacing, radii, fontSizes, minTouchTarget} = useTheme();

  const input = (
    value: string,
    label: string,
    keyboardType: 'number-pad' | 'decimal-pad',
    onChangeText: (text: string) => void,
  ) => (
    <TextInput
      accessibilityLabel={label}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      maxLength={7}
      placeholderTextColor={colors.textSecondary}
      style={[
        styles.input,
        {
          minHeight: minTouchTarget,
          color: colors.textPrimary,
          borderColor:
            message !== undefined ? colors.statusShortCircuit : colors.border,
          backgroundColor: colors.surface,
          borderRadius: radii.sm,
          paddingHorizontal: spacing.md,
          fontSize: fontSizes.body,
        },
      ]}
    />
  );

  const header = (label: string) => (
    <Text
      style={[
        styles.cell,
        {color: colors.textSecondary, fontSize: fontSizes.small},
      ]}
    >
      {label}
    </Text>
  );

  return (
    <View style={{gap: spacing.sm}}>
      <View style={[styles.row, {gap: spacing.sm}]}>
        {header(strings.editor.speedStepColumn)}
        {header(strings.editor.secondsColumn)}
        <View style={{width: minTouchTarget}} />
      </View>
      {rows.map((row, index) => {
        const change = (changes: Partial<SpeedTimeRow>) => {
          onChange(
            rows.map((other, i) =>
              i === index ? {...other, ...changes} : other,
            ),
          );
        };
        return (
          // Rows have no identity of their own; the index is stable while
          // typing, and removing a row re-renders the rest.
          <View key={index} style={[styles.row, {gap: spacing.sm}]}>
            <View style={styles.cell}>
              {input(
                row.step,
                strings.editor.speedStepColumn,
                'number-pad',
                (step) => {
                  change({step});
                },
              )}
            </View>
            <View style={styles.cell}>
              {input(
                row.seconds,
                strings.editor.secondsColumn,
                'decimal-pad',
                (seconds) => {
                  change({seconds});
                },
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.editor.removeSpeedTime}
              onPress={() => {
                onChange(rows.filter((_, i) => i !== index));
              }}
              style={[
                styles.remove,
                {width: minTouchTarget, height: minTouchTarget},
              ]}
            >
              <Icon
                name="close"
                size={fontSizes.large}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        );
      })}
      {message !== undefined && (
        <Text
          accessibilityLiveRegion="polite"
          style={{color: colors.statusShortCircuit, fontSize: fontSizes.small}}
        >
          {message}
        </Text>
      )}
      <AppButton
        label={strings.editor.addSpeedTime}
        icon="plus"
        variant="outline"
        onPress={() => {
          onChange([...rows, {step: '', seconds: ''}]);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    textAlign: 'center',
  },
  remove: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
