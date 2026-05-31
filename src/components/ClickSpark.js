"use client";

import React, { useRef, useEffect, useCallback } from 'react';

const ClickSpark = ({
  sparkColor = '#B33A3A', // Default to brand red
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  children,
}) => {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(parent);
    resizeCanvas();

    return () => ro.disconnect();
  }, []);

  const easeFunc = useCallback((t) => {
    switch (easing) {
      case 'linear': return t;
      case 'ease-in': return t * t;
      case 'ease-in-out': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default: return t * (2 - t); // ease-out
    }
  }, [easing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;

    const draw = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeFunc(progress);

        const distance = spark.velocity * eased * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + Math.cos(spark.angle) * distance;
        const y1 = spark.y + Math.sin(spark.angle) * distance;
        const x2 = spark.x + Math.cos(spark.angle) * (distance + lineLength);
        const y2 = spark.y + Math.sin(spark.angle) * (distance + lineLength);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return progress < 1;
      });

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [sparkColor, sparkSize, duration, easeFunc, extraScale]);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const now = performance.now();
    const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (i * 2 * Math.PI) / sparkCount,
      velocity: sparkRadius,
      start: now,
    }));

    sparksRef.current.push(...newSparks);
  };

  return (
    <div 
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: '100vh' }} 
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          zIndex: 99999, // Ensure it's on top of everything
          width: '100%',
          height: '100%'
        }}
      />
      {children}
    </div>
  );
};

export default ClickSpark;
