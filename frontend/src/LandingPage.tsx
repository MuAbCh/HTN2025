import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import WarningIcon from "@mui/icons-material/Warning";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import TwoFingers from "./TwoFingers";

interface NotificationItem {
	id: string;
	type: "stretch" | "break" | "posture" | "info";
	message: string;
	timestamp: Date;
	read: boolean;
}

interface Stats {
	risk: number;
	pressure: number;
	tilt: number;
	heavyPressNorm: number;
	staticHoldNorm: number;
	burstsNorm: number;
	extremeTiltNorm: number;
	staticHoldStreakSec: number;
	minutesSinceBreak: number;
}

const socket = io("http://localhost:4000");

export default function LandingPage() {
	const [keystrokeImpact, setKeystrokeImpact] = useState("normal");
	const [tremorDetection, setTremorDetection] = useState("normal");
	const [excessiveMovement, setExcessiveMovement] = useState("normal");
	const [prolongedUse, setProlongedUse] = useState("normal");
	const [jointSwelling, setJointSwelling] = useState("warning");
	const [typingAngle, setTypingAngle] = useState("alert");
	const [agentSummary, setAgentSummary] = useState(
		"Your typing posture has been stable today with minor fluctuations in finger tension. Consider taking a 5-minute break to perform wrist rotations and finger stretches. Your impact scores are excellent, indicating good keystroke pressure control.",
	);
	const [typingTime, setTypingTime] = useState(142); // minutes
	const [nextBreak, setNextBreak] = useState(18); // minutes
	const [indexValue, setIndexValue] = useState(25);
	const [middleValue, setMiddleValue] = useState(30);

	const [stats, setStats] = useState<Stats | null>(null);
	const [notifications, setNotifications] = useState<NotificationItem[]>([{
		id: "1",
		type: "stretch",
		message: "Time to stretch your fingers - detected increased tension",
		timestamp: new Date(Date.now() - 5 * 60 * 1000),
		read: false,
	}, {
		id: "2",
		type: "posture",
		message: "Consider adjusting your wrist position",
		timestamp: new Date(Date.now() - 15 * 60 * 1000),
		read: false,
	}, {
		id: "3",
		type: "break",
		message: "Great job! You took a break at the right time",
		timestamp: new Date(Date.now() - 45 * 60 * 1000),
		read: true,
	}]);

	useEffect(() => {
		function onUpdate(value: Stats) {
			console.log(value);
			setStats(value);
		}
		socket.on("update", onUpdate);
		return () => {
			socket.off("update", onUpdate);
		};
	}, []);

	// Simulate real-time updates
	useEffect(() => {
		const interval = setInterval(() => {
			setTypingTime((prev) => prev + 1);
			setNextBreak((prev) => Math.max(0, prev - 1));

			// Fetch real data from backend
			fetchHealthData();

			// Simulate finger sensor data
			setIndexValue((prev) => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));
			setMiddleValue((prev) => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));
		}, 60000); // Update every minute

		return () => clearInterval(interval);
	}, []);

	const formatTime = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	};

	const fetchHealthData = async () => {
		try {
			// Mock data for now - replace with actual API call
			const mockData = {
				overall_status: "normal",
				keystrike_impact: { status: "normal", explanation: "No hard strikes detected" },
				tremor_detection: { status: "normal", explanation: "No tremors detected" },
				excessive_movement: { status: "warning", explanation: "Some movement detected" },
				prolonged_use: { status: "normal", explanation: "Usage within normal limits" },
				summary:
					"Your finger health indicators are mostly within normal ranges with minor movement alerts.",
			};

			setKeystrokeImpact(mockData.keystrike_impact.status);
			setTremorDetection(mockData.tremor_detection.status);
			setExcessiveMovement(mockData.excessive_movement.status);
			setProlongedUse(mockData.prolonged_use.status);
			setAgentSummary(mockData.summary);
		} catch (error) {
			console.error("Failed to fetch health data:", error);
		}
	};

	const getStatusDisplay = (status: string) => {
		switch (status) {
			case "normal":
				return "Good";
			case "warning":
				return "Warning";
			case "alert":
				return "Alert";
			default:
				return "Unknown";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "normal":
				return "#4caf50";
			case "warning":
				return "#ff9800";
			case "alert":
				return "#f44336";
			default:
				return "#9e9e9e";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "normal":
				return <TaskAltIcon />;
			case "warning":
				return <WarningIcon />;
			case "alert":
				return <CloseIcon />;
			default:
				return <TaskAltIcon />;
		}
	};

	const getScoreColor = (score: number) => {
		if (score >= 80) return "#00ff88";
		if (score >= 60) return "#ffaa00";
		return "#ff4444";
	};

	const markAsRead = (id: string) => {
		setNotifications((prev) =>
			prev.map((notif) => notif.id === id ? { ...notif, read: true } : notif)
		);
	};

	const getNormStatus = (norm: number) => {
		if (norm >= 80) return "alert";
		if (norm >= 60) return "warning";
		return "normal";
	};

	const riskStatus = useMemo(() => getNormStatus((stats?.risk ?? 0) / 100), [stats?.risk]);
	const heavyPressStatus = useMemo(() => getNormStatus(stats?.heavyPressNorm || 0), [stats?.heavyPressNorm]);
	const staticHoldStatus = useMemo(() => getNormStatus(stats?.staticHoldNorm || 0), [stats?.staticHoldNorm]);
	const burstsStatus = useMemo(() => getNormStatus(stats?.burstsNorm || 0), [stats?.burstsNorm]);
	const extremeTiltStatus = useMemo(() => getNormStatus(stats?.extremeTiltNorm || 0), [stats?.extremeTiltNorm]);
	const minutesSinceBreakStatus = useMemo(() => getNormStatus((stats?.minutesSinceBreak || 0) / 40), [stats?.minutesSinceBreak]);

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)",
				display: "flex",
				fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
				color: "#ffffff",
				overflow: "hidden",
			}}
		>
			{/* Left Panel - Stats and Controls */}
			<div
				style={{
					flex: "2",
					padding: "24px",
					display: "flex",
					flexDirection: "column",
					gap: "20px",
					overflow: "hidden",
					minHeight: 0,
				}}
			>
				{/* Header */}
				<div style={{ marginBottom: "12px", flexShrink: 0 }}>
					<h1
						style={{
							fontSize: "32px",
							fontWeight: "700",
							margin: "0 0 8px 0",
							background: "linear-gradient(135deg, #ffffff 0%, #888888 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							letterSpacing: "-0.02em",
							display: "flex",
							alignItems: "baseline",
							gap: "8px",
						}}
					>
						<span style={{ fontFamily: "cursive", fontSize: "28px" }}>Your</span>
						<span style={{ fontFamily: "serif", fontSize: "36px" }}>Clau</span>
						<span style={{ fontFamily: "cursive", fontSize: "28px" }}>Dashboard</span>
					</h1>
				</div>

				{/* Agent Summary */}
				{/*<div
					style={{
						background: "rgba(255, 255, 255, 0.05)",
						borderRadius: "12px",
						padding: "20px",
						border: "1px solid rgba(255, 255, 255, 0.1)",
						backdropFilter: "blur(10px)",
						flexShrink: 0,
						marginBottom: "20px",
					}}
				>
					<h3
						style={{
							fontSize: "16px",
							fontWeight: "600",
							margin: "0 0 12px 0",
							color: "#00ffff",
						}}
					>
						Agent Summary
					</h3>
					<p style={{ fontSize: "14px", color: "#cccccc", margin: 0, lineHeight: "1.5" }}>
						{agentSummary}
					</p>
				</div>*/}

				{/* 2x3 Scores Grid */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr 1fr",
						gridTemplateRows: "1fr 1fr",
						gap: "16px",
						flexShrink: 0,
						marginBottom: "20px",
					}}
				>
					{/* Risk Score */}
					<div
						style={{
							background: "rgba(255, 255, 255, 0.05)",
							borderRadius: "12px",
							padding: "20px",
							border: "1px solid rgba(255, 255, 255, 0.1)",
							backdropFilter: "blur(10px)",
							boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
							transition: "all 0.2s ease",
							cursor: "pointer",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
							e.currentTarget.style.transform = "translateY(-2px)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.3)";
							e.currentTarget.style.transform = "translateY(0)";
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								height: "100%",
								minHeight: "100px",
							}}
						>
							{/* Top Section - Icon and Title */}
							<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
								<div
									style={{
										width: "48px",
										height: "48px",
										borderRadius: "50%",
										background: `${getStatusColor(riskStatus)}20`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: "24px",
										color: getStatusColor(riskStatus),
									}}
								>
									{getStatusIcon(riskStatus)}
								</div>
								<h3
									style={{
										fontSize: "18px",
										fontWeight: "600",
										margin: 0,
										color: getStatusColor(riskStatus),
									}}
								>
									Overall Risk
								</h3>
							</div>

							{/* Bottom Section - Description */}
							<p
								style={{
									fontSize: "14px",
									color: "#cccccc",
									margin: 0,
									lineHeight: "1.4",
									textAlign: "left",
								}}
							>
								{riskStatus === "normal"
									? "Your typing posture is within healthy limits."
									: riskStatus === "warning"
									? "Not great! Consider giving your hands a break."
									: "High pressure detected. Take breaks and adjust typing technique."}
							</p>
						</div>
					</div>

					{/* Heavy Press */}
					<div
						style={{
							background: "rgba(255, 255, 255, 0.05)",
							borderRadius: "12px",
							padding: "20px",
							border: "1px solid rgba(255, 255, 255, 0.1)",
							backdropFilter: "blur(10px)",
							boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
							transition: "all 0.2s ease",
							cursor: "pointer",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
							e.currentTarget.style.transform = "translateY(-2px)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.3)";
							e.currentTarget.style.transform = "translateY(0)";
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								height: "100%",
								minHeight: "100px",
							}}
						>
							{/* Top Section - Icon and Title */}
							<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
								<div
									style={{
										width: "48px",
										height: "48px",
										borderRadius: "50%",
										background: `${getStatusColor(heavyPressStatus)}20`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: "24px",
										color: getStatusColor(heavyPressStatus),
									}}
								>
									{getStatusIcon(heavyPressStatus)}
								</div>
								<h3
									style={{
										fontSize: "18px",
										fontWeight: "600",
										margin: 0,
										color: getStatusColor(heavyPressStatus),
									}}
								>
									Flexor Strain
								</h3>
							</div>

							{/* Bottom Section - Description */}
							<p
								style={{
									fontSize: "14px",
									color: "#cccccc",
									margin: 0,
									lineHeight: "1.4",
									textAlign: "left",
								}}
							>
								{heavyPressStatus === "normal"
									? "Little to no strain detected on flexors."
									: heavyPressStatus === "warning"
									? "Minor strain detected on flexors. Consider taking a break."
									: "Significant strain detected on flexors. Rest your hands and consider ergonomic adjustments."}
							</p>
						</div>
					</div>

					{/* Static Hold */}
					<div
						style={{
							background: "rgba(255, 255, 255, 0.05)",
							borderRadius: "12px",
							padding: "20px",
							border: "1px solid rgba(255, 255, 255, 0.1)",
							backdropFilter: "blur(10px)",
							boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
							transition: "all 0.2s ease",
							cursor: "pointer",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
							e.currentTarget.style.transform = "translateY(-2px)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.3)";
							e.currentTarget.style.transform = "translateY(0)";
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								height: "100%",
								minHeight: "100px",
							}}
						>
							{/* Top Section - Icon and Title */}
							<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
								<div
									style={{
										width: "48px",
										height: "48px",
										borderRadius: "50%",
										background: `${getStatusColor(staticHoldStatus)}20`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: "24px",
										color: getStatusColor(staticHoldStatus),
									}}
								>
									{getStatusIcon(staticHoldStatus)}
								</div>
								<h3
									style={{
										fontSize: "18px",
										fontWeight: "600",
										margin: 0,
										color: getStatusColor(staticHoldStatus),
									}}
								>
									Excessive Movement
								</h3>
							</div>

							{/* Bottom Section - Description */}
							<p
								style={{
									fontSize: "14px",
									color: "#cccccc",
									margin: 0,
									lineHeight: "1.4",
									textAlign: "left",
								}}
							>
								{staticHoldStatus === "normal"
									? "Activity levels are normal."
									: staticHoldStatus === "warning"
									? "Your fingers haven't moved much, give them a flex!"
									: "High levels of strain detected over a long period of time. Flex your fingers and stretch your hands!"}
							</p>
						</div>
					</div>

					{/* Bursts */}
					<div
						style={{
							background: "rgba(255, 255, 255, 0.05)",
							borderRadius: "12px",
							padding: "20px",
							border: "1px solid rgba(255, 255, 255, 0.1)",
							backdropFilter: "blur(10px)",
							boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
							transition: "all 0.2s ease",
							cursor: "pointer",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
							e.currentTarget.style.transform = "translateY(-2px)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.3)";
							e.currentTarget.style.transform = "translateY(0)";
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								height: "100%",
								minHeight: "100px",
							}}
						>
							{/* Top Section - Icon and Title */}
							<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
								<div
									style={{
										width: "48px",
										height: "48px",
										borderRadius: "50%",
										background: `${getStatusColor(burstsStatus)}20`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: "24px",
										color: getStatusColor(burstsStatus),
									}}
								>
									{getStatusIcon(burstsStatus)}
								</div>
								<h3
									style={{
										fontSize: "18px",
										fontWeight: "600",
										margin: 0,
										color: getStatusColor(burstsStatus),
									}}
								>
									Sudden Movements
								</h3>
							</div>

							{/* Bottom Section - Description */}
							<p
								style={{
									fontSize: "14px",
									color: "#cccccc",
									margin: 0,
									lineHeight: "1.4",
									textAlign: "left",
								}}
							>
								{burstsStatus === "normal"
									? "Low twitchiness detected. Your fingers are relaxed."
									: burstsStatus === "warning"
									? "Some twitchiness detected. Consider taking a break soon."
									: "Your fingers are making a lot of sudden movements. Adjust your working finger posture."}
							</p>
						</div>
					</div>

					{/* Extreme Tilt */}
					<div
						style={{
							background: "rgba(255, 255, 255, 0.05)",
							borderRadius: "12px",
							padding: "20px",
							border: "1px solid rgba(255, 255, 255, 0.1)",
							backdropFilter: "blur(10px)",
							boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
							transition: "all 0.2s ease",
							cursor: "pointer",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
							e.currentTarget.style.transform = "translateY(-2px)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.3)";
							e.currentTarget.style.transform = "translateY(0)";
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								height: "100%",
								minHeight: "100px",
							}}
						>
							{/* Top Section - Icon and Title */}
							<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
								<div
									style={{
										width: "48px",
										height: "48px",
										borderRadius: "50%",
										background: `${getStatusColor(extremeTiltStatus)}20`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: "24px",
										color: getStatusColor(extremeTiltStatus),
									}}
								>
									{getStatusIcon(extremeTiltStatus)}
								</div>
								<h3
									style={{
										fontSize: "18px",
										fontWeight: "600",
										margin: 0,
										color: getStatusColor(extremeTiltStatus),
									}}
								>
									Hand Tilt
								</h3>
							</div>

							{/* Bottom Section - Description */}
							<p
								style={{
									fontSize: "14px",
									color: "#cccccc",
									margin: 0,
									lineHeight: "1.4",
									textAlign: "left",
								}}
							>
								{extremeTiltStatus === "normal"
									? "Hand tilt is within normal range."
									: extremeTiltStatus === "warning"
									? "Some excessive hand tilt detected. Consider adjusting your posture."
									: "Your hand appears to be at a very uncomfortable angle; give your wrist a break!"}
							</p>
						</div>
					</div>

					{/* Mins Since Break */}
					<div
						style={{
							background: "rgba(255, 255, 255, 0.05)",
							borderRadius: "12px",
							padding: "20px",
							border: "1px solid rgba(255, 255, 255, 0.1)",
							backdropFilter: "blur(10px)",
							boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
							transition: "all 0.2s ease",
							cursor: "pointer",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
							e.currentTarget.style.transform = "translateY(-2px)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.3)";
							e.currentTarget.style.transform = "translateY(0)";
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								height: "100%",
								minHeight: "100px",
							}}
						>
							{/* Top Section - Icon and Title */}
							<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
								<div
									style={{
										width: "48px",
										height: "48px",
										borderRadius: "50%",
										background: `${getStatusColor(minutesSinceBreakStatus)}20`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: "24px",
										color: getStatusColor(minutesSinceBreakStatus),
									}}
								>
									{getStatusIcon(minutesSinceBreakStatus)}
								</div>
								<h3
									style={{
										fontSize: "18px",
										fontWeight: "600",
										margin: 0,
										color: getStatusColor(minutesSinceBreakStatus),
									}}
								>
									Break Needed?
								</h3>
							</div>

							{/* Bottom Section - Description */}
							<p
								style={{
									fontSize: "14px",
									color: "#cccccc",
									margin: 0,
									lineHeight: "1.4",
									textAlign: "left",
								}}
							>
								{minutesSinceBreakStatus === "normal"
									? "No need to take a break."
									: minutesSinceBreakStatus === "warning"
									? "You've been at this for some time. Consider taking a short break."
									: "You've been working your fingers a lot, give them some rest!"}
							</p>
						</div>
					</div>
				</div>

				{/* Alerts and Recommendations */}
				<div
					style={{
						background: "rgba(255, 255, 255, 0.05)",
						borderRadius: "12px",
						padding: "20px",
						border: "1px solid rgba(255, 255, 255, 0.1)",
						backdropFilter: "blur(10px)",
						flexShrink: 0,
					}}
				>
					<h3
						style={{
							fontSize: "16px",
							fontWeight: "600",
							margin: "0 0 16px 0",
							color: "#00ffff",
						}}
					>
						Alerts & Recommendations
					</h3>

					<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
						{/* Alert Item */}
						<div
							style={{
								background: "rgba(255, 165, 0, 0.1)",
								borderRadius: "8px",
								padding: "12px",
								border: "1px solid rgba(255, 165, 0, 0.3)",
								display: "flex",
								alignItems: "flex-start",
								gap: "12px",
							}}
						>
							<div
								style={{
									width: "6px",
									height: "6px",
									borderRadius: "50%",
									background: "#ffa500",
									marginTop: "6px",
									flexShrink: 0,
								}}
							/>
							<div>
								<h4
									style={{
										fontSize: "14px",
										fontWeight: "600",
										margin: "0 0 4px 0",
										color: "#ffa500",
									}}
								>
									Tension Alert
								</h4>
								<p
									style={{
										fontSize: "13px",
										color: "#cccccc",
										margin: 0,
										lineHeight: "1.4",
									}}
								>
									Your finger tension has increased by 15% in the last hour.
									Consider taking a 2-minute break for finger stretches.
								</p>
							</div>
						</div>

						{/* Recommendation Item */}
						<div
							style={{
								background: "rgba(0, 255, 255, 0.1)",
								borderRadius: "8px",
								padding: "12px",
								border: "1px solid rgba(0, 255, 255, 0.3)",
								display: "flex",
								alignItems: "flex-start",
								gap: "12px",
							}}
						>
							<div
								style={{
									width: "6px",
									height: "6px",
									borderRadius: "50%",
									background: "#00ffff",
									marginTop: "6px",
									flexShrink: 0,
								}}
							/>
							<div>
								<h4
									style={{
										fontSize: "14px",
										fontWeight: "600",
										margin: "0 0 4px 0",
										color: "#00ffff",
									}}
								>
									Posture Improvement
								</h4>
								<p
									style={{
										fontSize: "13px",
										color: "#cccccc",
										margin: 0,
										lineHeight: "1.4",
									}}
								>
									Adjust your wrist angle by 5-10 degrees. Your current tilt score
									could be improved with better keyboard positioning.
								</p>
							</div>
						</div>

						{/* Positive Feedback */}
						<div
							style={{
								background: "rgba(0, 255, 0, 0.1)",
								borderRadius: "8px",
								padding: "12px",
								border: "1px solid rgba(0, 255, 0, 0.3)",
								display: "flex",
								alignItems: "flex-start",
								gap: "12px",
							}}
						>
							<div
								style={{
									width: "6px",
									height: "6px",
									borderRadius: "50%",
									background: "#00ff00",
									marginTop: "6px",
									flexShrink: 0,
								}}
							/>
							<div>
								<h4
									style={{
										fontSize: "14px",
										fontWeight: "600",
										margin: "0 0 4px 0",
										color: "#00ff00",
									}}
								>
									Great Progress!
								</h4>
								<p
									style={{
										fontSize: "13px",
										color: "#cccccc",
										margin: 0,
										lineHeight: "1.4",
									}}
								>
									Your typing accuracy has improved by 3% this week. Keep
									maintaining this excellent keystroke pressure control.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Exercise History & Notifications */}
				<div
					style={{
						background: "rgba(255, 255, 255, 0.05)",
						borderRadius: "12px",
						padding: "20px",
						border: "1px solid rgba(255, 255, 255, 0.1)",
						backdropFilter: "blur(10px)",
						flex: 1,
						minHeight: 0,
						display: "flex",
						flexDirection: "column",
					}}
				>
					<h2
						style={{
							fontSize: "20px",
							fontWeight: "600",
							margin: "0 0 24px 0",
							color: "#ffffff",
						}}
					>
						Exercise History & Notifications
					</h2>
					{/* Exercise History Section */}
					<div
						style={{
							marginBottom: "24px",
							paddingBottom: "20px",
							borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
						}}
					>
						<h3
							style={{
								fontSize: "16px",
								fontWeight: "600",
								margin: "0 0 16px 0",
								color: "#00ffff",
							}}
						>
							Recent Exercises
						</h3>
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							<div
								style={{
									background: "rgba(0, 255, 0, 0.1)",
									borderRadius: "6px",
									padding: "12px",
									border: "1px solid rgba(0, 255, 0, 0.2)",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<span style={{ color: "#ffffff", fontSize: "14px" }}>
									Finger Stretches
								</span>
								<span style={{ color: "#00ff00", fontSize: "12px" }}>
									Completed 2h ago
								</span>
							</div>
							<div
								style={{
									background: "rgba(0, 255, 0, 0.1)",
									borderRadius: "6px",
									padding: "12px",
									border: "1px solid rgba(0, 255, 0, 0.2)",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<span style={{ color: "#ffffff", fontSize: "14px" }}>
									Wrist Rotations
								</span>
								<span style={{ color: "#00ff00", fontSize: "12px" }}>
									Completed 4h ago
								</span>
							</div>
							<div
								style={{
									background: "rgba(255, 165, 0, 0.1)",
									borderRadius: "6px",
									padding: "12px",
									border: "1px solid rgba(255, 165, 0, 0.2)",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<span style={{ color: "#ffffff", fontSize: "14px" }}>
									Hand Massage
								</span>
								<span style={{ color: "#ffa500", fontSize: "12px" }}>
									Skipped 6h ago
								</span>
							</div>
						</div>
					</div>

					{/* Notifications Section */}
					<div>
						<h3
							style={{
								fontSize: "16px",
								fontWeight: "600",
								margin: "0 0 16px 0",
								color: "#00ffff",
							}}
						>
							Notifications
						</h3>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "12px",
								flex: 1,
								overflowY: "auto",
							}}
						>
							{notifications.map((notification) => (
								<div
									key={notification.id}
									style={{
										background: notification.read
											? "rgba(255, 255, 255, 0.03)"
											: "rgba(0, 255, 255, 0.1)",
										borderRadius: "8px",
										padding: "16px",
										border: notification.read
											? "1px solid rgba(255, 255, 255, 0.05)"
											: "1px solid rgba(0, 255, 255, 0.3)",
										cursor: "pointer",
										transition: "all 0.2s ease",
									}}
									onClick={() => markAsRead(notification.id)}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
											marginBottom: "8px",
										}}
									>
										<h3
											style={{
												fontSize: "14px",
												fontWeight: "600",
												margin: 0,
												color: notification.read ? "#cccccc" : "#00ffff",
											}}
										>
											{notification.type.charAt(0).toUpperCase()
												+ notification.type.slice(1)}
										</h3>
										<span style={{ fontSize: "12px", color: "#888888" }}>
											{new Date(notification.timestamp).toLocaleTimeString(
												[],
												{ hour: "2-digit", minute: "2-digit" },
											)}
										</span>
									</div>
									<p
										style={{
											fontSize: "12px",
											margin: 0,
											color: notification.read ? "#999999" : "#ffffff",
											lineHeight: "1.4",
										}}
									>
										{notification.message}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Right Panel - Finger Visualization */}
			<div
				style={{
					flex: "1",
					background: "rgba(255, 255, 255, 0.02)",
					borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
					position: "relative"
				}}
			>
				<div
					style={{
						position: "absolute",
						top: "24px",
						left: "24px",
						right: "24px",
						zIndex: 10,
					}}
				>
					<h3
						style={{
							fontSize: "18px",
							fontWeight: "600",
							margin: "0 0 8px 0",
							color: "#ffffff",
						}}
					>
						Live Finger Tracking
					</h3>
					<p style={{ fontSize: "14px", color: "#888888", margin: 0,  }}>
						Real-time ergonomic analysis
					</p>
				</div>

				<div style={{ width: "100%", height: "calc(100% - 80px)", marginTop: "104px" }}>
					<div style={{ width: "100%", height: "100%", position: "relative" }}>
						<TwoFingers indexValue={indexValue} middleValue={middleValue} />
					</div>
				</div>
			</div>
		</div>
	);
}
