// import { useState, useEffect, useRef } from "react";
// import { scaleLinear } from "d3-scale";

// // CONSTANTS
// const canvasPadding = 10; // Padding on the canvas

// // Data Ranges
// const canvasRange = {
//   // Was canvasSpace
//   min: { x: 0, y: undefined },
//   max: { x: undefined, y: 0 },
// };
// const paddedCanvasRange = {
//   // Was paddedCanvasSpace
//   min: { x: canvasPadding, y: undefined },
//   max: { x: undefined, y: canvasPadding },
// };

// // Transform transferFunction to paddedCanvas
// const scaleTransferFunctionToPaddedCanvasX = scaleLinear();
// const scaleTransferFunctionToPaddedCanvasY = scaleLinear();

// export default function useCanvas(state, setState) {
//   const canvasRef = useRef(null);
//   const [canvasPoints, setCanvasPoints] = useState([]);
//   const [pointHovering, setPointHovering] = useState(null); // Index of the point currently hovering over
//   const [pointDragging, setPointDragging] = useState(null); // Index of the point currently dragging
//   const [cursorType, setCursorType] = useState("auto");
//   const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 }); // Was dragStart [0, 0]
//   const [pointStart, setPointStart] = useState({ x: 0, y: 0 }); // Was startPos, [0, 0]

//   useEffect(() => {
//     console.log("DRAWING");

//     // Set ranges
//     canvasRange.max.x = canvas.width;
//     canvasRange.min.y = canvas.height;
//     paddedCanvasRange.max.x = canvas.width - canvasPadding;
//     paddedCanvasRange.min.y = canvas.height - canvasPadding;

//     // Update transformations
//     scaleTransferFunctionToPaddedCanvasX
//       .domain([transferFunctionRange.min.x, transferFunctionRange.max.x])
//       .range([paddedCanvasRange.min.x, paddedCanvasRange.max.x]);
//     scaleTransferFunctionToPaddedCanvasY
//       .domain([transferFunctionRange.min.y, transferFunctionRange.max.y])
//       .range([paddedCanvasRange.min.y, paddedCanvasRange.max.y]);

//     // DRAW
//     const canvas = canvasRef.current;
//     const context = canvas.getContext("2d");

//     // Reset and Draw rule on canvas's midpoint
//     context.clearRect(0, 0, canvas.width, canvas.height);
//     const middle = canvas.width / 2;
//     context.moveTo(middle, canvas.height);
//     context.lineTo(middle, canvas.height - 10);
//     context.stroke();

//     // Draw lines
//     context.strokeStyle = "rgba(128, 128, 128, 0.8)";
//     context.lineWidth = 2;
//     context.beginPath();
//     for (let i = 0; i < canvasPoints.length - 1; i++) {
//       context.moveTo(canvasPoints[i].x, canvasPoints[i].y);
//       context.lineTo(canvasPoints[i + 1].x, canvasPoints[i + 1].y);
//       context.stroke();
//     }

//     // Draw points
//     context.strokeStyle = "#AAAAAA";
//     context.lineWidth = 2;
//     canvasPoints.map((point) => {
//       if (pointHovering === point) context.fillStyle = "#FFFF55";
//       else context.fillStyle = "#FFAA00";

//       context.beginPath();
//       context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
//       context.fill();
//     });

//     // Update transferFunction
//     setState({
//       ...state,
//       transferFunction: canvasPoints.map((p) => {
//         return {
//           x: scaleTransferFunctionToPaddedCanvasX.invert(p.x),
//           y: scaleTransferFunctionToPaddedCanvasY.invert(p.y),
//         };
//       }),
//     });
//   });

//   return {
//     canvasRef,
//     scaleTransferFunctionToPaddedCanvasX,
//     scaleTransferFunctionToPaddedCanvasY,
//     canvasPoints,
//     setCanvasPoints,
//     pointHovering,
//     setPointHovering,
//     pointDragging,
//     setPointDragging,
//     cursorType,
//     setCursorType,
//     mouseStart,
//     setMouseStart,
//     pointStart,
//     setPointStart,
//   };
// }
