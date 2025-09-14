import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface FingerProps {
	value: number; // 0-100
	position: [number, number, number];
}

interface TwoFingersProps {
	indexValue: number;
	middleValue: number;
}

// Individual finger component with 3 joints
function Finger({ value, position }: FingerProps) {
	const baseRef = useRef<THREE.Group>(null);
	const middleRef = useRef<THREE.Group>(null);
	const tipRef = useRef<THREE.Group>(null);

	// Map 0-100 value to joint rotations (bending toward camera)
	const mapValueToRotations = (val: number) => {
		const normalized = Math.max(0, Math.min(100, val)) / 100;
		return {
			base: normalized * Math.PI / 3, // up to 60° toward camera
			middle: normalized * Math.PI / 2, // up to 90° toward camera
			tip: normalized * Math.PI / 3, // up to 60° toward camera
		};
	};

	useEffect(() => {
		const rotations = mapValueToRotations(value);

		if (baseRef.current) {
			baseRef.current.rotation.x = rotations.base;
		}
		if (middleRef.current) {
			middleRef.current.rotation.x = rotations.middle;
		}
		if (tipRef.current) {
			tipRef.current.rotation.x = rotations.tip;
		}
	}, [value]);

	return (
		<group position={position}>
			{/* Base joint */}
			<group ref={baseRef}>
				<mesh position={[0, 0.5, 0]}>
					<capsuleGeometry args={[0.30, 0.8, 4, 16]} />
					<meshToonMaterial
						color="#00ffff"
						transparent={true}
						opacity={0.85}
						emissive="#004444"
						emissiveIntensity={0.3}
					/>
				</mesh>

				{/* Middle joint */}
				<group ref={middleRef} position={[0, 1, 0]}>
					<mesh position={[0, 0.35, 0]}>
						<capsuleGeometry args={[0.26, 0.6, 4, 16]} />
						<meshToonMaterial
							color="#00ffff"
							transparent={true}
							opacity={0.85}
							emissive="#004444"
							emissiveIntensity={0.3}
						/>
					</mesh>

					{/* Tip joint */}
					<group ref={tipRef} position={[0, 0.8, 0]}>
						<mesh position={[0, 0.25, 0]}>
							<capsuleGeometry args={[0.22, 0.4, 4, 16]} />
							<meshToonMaterial
								color="#00ffff"
								transparent={true}
								opacity={0.85}
								emissive="#004444"
								emissiveIntensity={0.3}
							/>
						</mesh>
					</group>
				</group>
			</group>
		</group>
	);
}

// Control panel component
function Controls(
	{ indexValue, middleValue, onIndexChange, onMiddleChange }: {
		indexValue: number;
		middleValue: number;
		onIndexChange: (value: number) => void;
		onMiddleChange: (value: number) => void;
	},
) {
	return (
		<div
			style={{
				position: "absolute",
				top: 20,
				left: 20,
				background: "rgba(255, 255, 255, 0.9)",
				padding: "20px",
				borderRadius: "8px",
				boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
				fontFamily: "Arial, sans-serif",
			}}
		>
			<h3 style={{ margin: "0 0 15px 0", color: "#333" }}>Finger Controls</h3>

			<div style={{ marginBottom: "15px" }}>
				<label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
					Index Finger: {indexValue}
				</label>
				<input
					type="range"
					min="0"
					max="100"
					value={indexValue}
					onChange={(e) => onIndexChange(Number(e.target.value))}
					style={{ width: "200px" }}
				/>
				<div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
					0 = Extended, 100 = Contracted
				</div>
			</div>

			<div>
				<label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
					Middle Finger: {middleValue}
				</label>
				<input
					type="range"
					min="0"
					max="100"
					value={middleValue}
					onChange={(e) => onMiddleChange(Number(e.target.value))}
					style={{ width: "200px" }}
				/>
				<div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
					0 = Extended, 100 = Contracted
				</div>
			</div>
		</div>
	);
}

// Main TwoFingers component
export default function TwoFingers({ indexValue, middleValue }: TwoFingersProps) {
	const [localIndexValue, setLocalIndexValue] = useState(indexValue);
	const [localMiddleValue, setLocalMiddleValue] = useState(middleValue);
	const [showControls, setShowControls] = useState(true);
	const cameraPosition: [number, number, number] = [2, 4.5, -2.0];

	// Update local state when props change
	useEffect(() => {
		setLocalIndexValue(indexValue);
	}, [indexValue]);

	useEffect(() => {
		setLocalMiddleValue(middleValue);
	}, [middleValue]);

	return (
		<div style={{ width: "100%", height: "100%", position: "relative" }}>
			<Canvas
				camera={{ position: cameraPosition, fov: 60 }}
				onCreated={({ camera }) => {
					camera.lookAt(0, 0, 0);
				}}
				style={{
					background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
					width: "100%",
					height: "100%",
				}}
			>
				<ambientLight intensity={0.4} />
				<directionalLight position={[10, 10, 5]} intensity={0.8} color="#00ffff" />
				<pointLight position={[0, 5, 0]} intensity={0.5} color="#00ffff" />

				{/* Hologram scan lines effect */}
				<mesh position={[0, 0, -2]}>
					<planeGeometry args={[10, 10]} />
					<meshBasicMaterial color="#00ffff" transparent={true} opacity={0.05} side={2} />
				</mesh>

				{/* Hand rotated so fingertips point downward */}
				<group rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
					{/* Hand base connecting the fingers */}
					<mesh position={[0, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
						<capsuleGeometry args={[0.3, 1.2, 4, 16]} />
						<meshToonMaterial
							color="#00ffff"
							transparent={true}
							opacity={0.85}
							emissive="#004444"
							emissiveIntensity={0.3}
						/>
					</mesh>

					{/* Index finger positioned naturally */}
					<group rotation={[0, -0.15, 0]}>
						<Finger value={localIndexValue} position={[-0.6, 0, 0]} />
					</group>

					{/* Middle finger positioned naturally */}
					<group rotation={[0, 0.05, 0]}>
						<Finger value={localMiddleValue} position={[0.2, 0, 0]} />
					</group>
				</group>
			</Canvas>

			{showControls && (
				<Controls
					indexValue={localIndexValue}
					middleValue={localMiddleValue}
					onIndexChange={setLocalIndexValue}
					onMiddleChange={setLocalMiddleValue}
				/>
			)}

			{/* Toggle Controls Button */}
			<button
				onClick={() => setShowControls(!showControls)}
				style={{
					position: "absolute",
					top: 20,
					right: 20,
					padding: "10px 15px",
					backgroundColor: "rgba(0, 255, 255, 0.8)",
					color: "#000",
					border: "none",
					borderRadius: "6px",
					cursor: "pointer",
					fontWeight: "bold",
					fontSize: "12px",
					boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
				}}
			>
				{showControls ? "Hide Controls" : "Show Controls"}
			</button>

			{/* Do Exercises Button */}
			<button
				style={{
					position: "absolute",
					bottom: "20px",
					right: "20px",
					padding: "12px 24px",
					background: "linear-gradient(135deg, #ff6b35, #ff8c42)",
					color: "#fff",
					border: "none",
					borderRadius: "8px",
					cursor: "pointer",
					fontWeight: "600",
					fontSize: "14px",
					boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)",
					transition: "all 0.2s ease",
					zIndex: 20,
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.transform = "translateY(-2px)";
					e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 107, 53, 0.4)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.transform = "translateY(0)";
					e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.3)";
				}}
				onClick={() => {
					// TODO: Implement exercise functionality
					console.log("Starting exercises...");
				}}
			>
				Do Exercises
			</button>
		</div>
	);
}
