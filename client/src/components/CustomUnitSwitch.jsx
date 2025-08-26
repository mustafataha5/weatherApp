// src/components/CustomUnitSwitch.jsx
import React from "react";
import { styled, Switch } from "@mui/material";
import { useTempUnit } from "../context/TempUnitContext"; // context hook

// Styled switch
const StyledSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        content: '"°F"',
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#2196F3',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    '&:before': {
      content: '"°C"',
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      fontSize: 14,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#000',
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#9e9e9e',
    borderRadius: 20 / 2,
  },
}));

const CustomUnitSwitch = () => {
  const { unit, toggleUnit } = useTempUnit();

  return <StyledSwitch checked={unit === "F"} onChange={toggleUnit} />;
};

export default CustomUnitSwitch;
