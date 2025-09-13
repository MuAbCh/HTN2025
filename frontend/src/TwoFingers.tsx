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
					<cylinderGeometry args={[0.2, 0.18, 1, 16]} />
					<meshStandardMaterial color="#ffdbac" />
				</mesh>

				{/* Middle joint */}
				<group ref={middleRef} position={[0, 1, 0]}>
					<mesh position={[0, 0.4, 0]}>
						<cylinderGeometry args={[0.18, 0.16, 0.8, 16]} />
						<meshStandardMaterial color="#ffdbac" />
					</mesh>

					{/* Tip joint */}
					<group ref={tipRef} position={[0, 0.8, 0]}>
						<mesh position={[0, 0.3, 0]}>
							<cylinderGeometry args={[0.16, 0.12, 0.6, 16]} />
							<meshStandardMaterial color="#ffdbac" />
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

	// Update local state when props change
	useEffect(() => {
		setLocalIndexValue(indexValue);
	}, [indexValue]);

	useEffect(() => {
		setLocalMiddleValue(middleValue);
	}, [middleValue]);

	return (
		<div style={{ width: "100vw", height: "100vh", position: "relative" }}>
			<Canvas
				camera={{ position: [0, 2, 4], fov: 50 }}
				style={{ background: "#f5f5f5", width: "100%", height: "100%" }}
			>
				<ambientLight intensity={0.6} />
				<directionalLight position={[10, 10, 5]} intensity={1} />

				{/* Hand base connecting the fingers */}
				<mesh position={[0, -0.3, 0]}>
					<boxGeometry args={[1.8, 0.4, 0.6]} />
					<meshStandardMaterial color="#ffdbac" />
				</mesh>

				{/* Index finger angled outward */}
				<group rotation={[0, -0.2, 0]}>
					<Finger value={localIndexValue} position={[-0.6, 0, 0]} />
				</group>

				{/* Middle finger angled outward */}
				<group rotation={[0, 0.2, 0]}>
					<Finger value={localMiddleValue} position={[0.6, 0, 0]} />
				</group>

				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
					<planeGeometry args={[4, 4]} />
					<meshStandardMaterial color="#f0f0f0" />
				</mesh>
			</Canvas>

			<Controls
				indexValue={localIndexValue}
				middleValue={localMiddleValue}
				onIndexChange={setLocalIndexValue}
				onMiddleChange={setLocalMiddleValue}
			/>
		</div>
	);
}
