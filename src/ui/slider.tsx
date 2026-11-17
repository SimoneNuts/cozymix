"use client";

type SliderProps = {
  value: number;
  label: string;
  onChange: (value: number) => void;
  onRelease?: () => void;
  id?: string;
  dim?: boolean;
};

/**
 * A native range input with a visible percentage. Native means arrow keys,
 * Page Up/Down, Home/End and screen readers all work without extra code.
 */
export function Slider({ value, label, onChange, onRelease, id, dim }: SliderProps) {
  const percent = Math.round(value * 100);
  return (
    <div className="slider" data-dim={dim || undefined}>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={percent}
        aria-label={label}
        aria-valuetext={`${percent}%`}
        style={{ "--fill": `${percent}%` } as React.CSSProperties}
        onChange={(event) => onChange(Number(event.currentTarget.value) / 100)}
        onPointerUp={onRelease}
        onKeyUp={onRelease}
      />
      <output aria-hidden="true">{percent}%</output>
    </div>
  );
}
