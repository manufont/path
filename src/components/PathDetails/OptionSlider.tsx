import { Slider, Typography } from "@mui/material";

import styles from "./PathDetails.module.css";

type OptionSliderProps = {
  labels: string[];
  value: number;
  onValueChange: (newValue: number) => void;
};

const OptionSlider = ({ labels, value, onValueChange }: OptionSliderProps) => {
  return (
    <div className={styles.sliderContainer}>
      <Slider
        value={value}
        onChange={(e, value) => onValueChange(Number(value))}
        marks={true}
        min={0}
        max={1}
        step={0.1}
      ></Slider>
      <div className={styles.sliderLabels}>
        {labels.map((label, index) => (
          <Typography
            key={index}
            variant="subtitle2"
            style={{
              opacity: 1 - 0.5 * Math.abs(value - index / (labels.length - 1)),
            }}
          >
            {label}
          </Typography>
        ))}
      </div>
    </div>
  );
};

export default OptionSlider;
