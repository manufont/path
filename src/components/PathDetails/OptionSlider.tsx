import styled from "@emotion/styled";
import { Slider, Typography } from "@mui/material";

type OptionSliderProps = {
  labels: string[];
  value: number;
  onValueChange: (newValue: number) => void;
};

const OptionSlider = ({ labels, value, onValueChange }: OptionSliderProps) => {
  return (
    <SliderContainerDiv>
      <Slider
        value={value}
        onChange={(e, value) => onValueChange(Number(value))}
        marks={true}
        min={0}
        max={1}
        step={0.1}
      ></Slider>
      <SliderLabelsDiv>
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
      </SliderLabelsDiv>
    </SliderContainerDiv>
  );
};

const SliderContainerDiv = styled.div`
  margin: 0px 8px;
`;

const SliderLabelsDiv = styled.div`
  display: flex;
  justify-content: space-between;
  margin: -12px -8px 0 -8px;
`;

export default OptionSlider;
