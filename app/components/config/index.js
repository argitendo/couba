import React from 'react';

function CustomConfig({ label, min, max, step, value, onChange }) {
  const handleChange = (event) => {
    onChange(parseFloat(event.target.value));
  };

  return (
    <div className="flex flex-col items-center space-y-2 mx-2">
      {/* <label className="text-white text-lg">{label}</label> */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer"
      />
      {/* <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-20 p-2 text-center border border-gray-600 rounded-md bg-gray-800 text-white"
      /> */}
    </div>
  );
}

export default CustomConfig;
