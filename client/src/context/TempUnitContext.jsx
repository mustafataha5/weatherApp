// src/context/TempUnitContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const TempUnitContext = createContext();

export const useTempUnit = () => useContext(TempUnitContext);

export const TempUnitProvider = ({ children }) => {
  const [unit, setUnit] = useState("C"); // UI symbol: "C" or "F"

  // Load saved preference on mount
  useEffect(() => {
    const savedUnit = localStorage.getItem("tempUnit");
    if (savedUnit) setUnit(savedUnit);
  }, []);

  // Save preference when changed
  useEffect(() => {
    localStorage.setItem("tempUnit", unit);
  }, [unit]);

  const toggleUnit = () => setUnit((prev) => (prev === "C" ? "F" : "C"));

  // Map UI unit to API unit
  const apiUnit = unit === "C" ? "metric" : "imperial";

  return (
    <TempUnitContext.Provider value={{ unit, apiUnit, toggleUnit }}>
      {children}
    </TempUnitContext.Provider>
  );
};
