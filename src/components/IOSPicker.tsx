import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface IOSPickerProps {
  options: number[];
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const OFFSET = ITEM_HEIGHT * 2; // To align with the middle overlay

const IOSPicker: React.FC<IOSPickerProps> = ({ options, value, onChange, label }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollY = useMotionValue(0);

  // Initialize scroll position based on value
  useEffect(() => {
    const index = options.indexOf(value);
    if (index !== -1) {
      scrollY.set(OFFSET - index * ITEM_HEIGHT);
    }
  }, [value, options, scrollY]);

  const handleDragEnd = (_: any, info: any) => {
    const velocity = info.velocity.y;
    const currentY = scrollY.get();
    
    // Calculate projected landing spot with momentum
    const targetY = currentY + velocity * 0.1;
    
    // Formula: targetY = OFFSET - index * ITEM_HEIGHT
    // => index = (OFFSET - targetY) / ITEM_HEIGHT
    const index = Math.round((OFFSET - targetY) / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    
    animate(scrollY, OFFSET - clampedIndex * ITEM_HEIGHT, {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      onComplete: () => {
        onChange(options[clampedIndex]);
      },
    });
  };

  return (
    <div className="picker-container">
      {label && <span className="picker-label">{label}</span>}
      <div 
        ref={containerRef}
        className="picker-wheel"
        style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
      >
        <div className="picker-selection-overlay" style={{ height: ITEM_HEIGHT, top: OFFSET }} />
        <motion.div
          drag="y"
          dragConstraints={{
            top: OFFSET - (options.length - 1) * ITEM_HEIGHT,
            bottom: OFFSET,
          }}
          onDragEnd={handleDragEnd}
          style={{ y: scrollY }}
          className="picker-list"
        >
          {options.map((option, index) => {
            const range = [
              OFFSET - (index + 2) * ITEM_HEIGHT,
              OFFSET - (index + 1) * ITEM_HEIGHT,
              OFFSET - index * ITEM_HEIGHT,
              OFFSET - (index - 1) * ITEM_HEIGHT,
              OFFSET - (index - 2) * ITEM_HEIGHT,
            ];

            const rotateX = useTransform(scrollY, range, [45, 25, 0, -25, -45]);
            const opacity = useTransform(scrollY, range, [0.3, 0.6, 1, 0.6, 0.3]);
            const scale = useTransform(scrollY, range, [0.8, 0.9, 1, 0.9, 0.8]);

            return (
              <motion.div
                key={option}
                className="picker-item"
                style={{
                  height: ITEM_HEIGHT,
                  rotateX,
                  opacity,
                  scale,
                }}
              >
                {option.toString().padStart(2, '0')}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default IOSPicker;
