"use client";

import React, { useEffect } from "react";

const ModelViewer = ({ 
  src, 
  alt = "A 3D model of a property",
  poster = "",
  autoRotate = true,
  cameraControls = true,
  shadowIntensity = "1",
  exposure = "1",
  style = {}
}) => {
  useEffect(() => {
    // Import the model-viewer web component script
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ 
      width: "100%", 
      height: "400px", 
      backgroundColor: "#f8f9fa", 
      borderRadius: "12px", 
      overflow: "hidden",
      position: "relative",
      border: "1px solid #e2e8f0",
      ...style 
    }}>
      <model-viewer
        src={src}
        alt={alt}
        poster={poster}
        auto-rotate={autoRotate ? "" : undefined}
        camera-controls={cameraControls ? "" : undefined}
        shadow-intensity={shadowIntensity}
        exposure={exposure}
        style={{ width: "100%", height: "100%", outline: "none" }}
        touch-action="pan-y"
      >
        <div slot="poster" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#666" }}>
          <span>Memuat Model 3D...</span>
        </div>
      </model-viewer>
    </div>
  );
};

export default ModelViewer;
