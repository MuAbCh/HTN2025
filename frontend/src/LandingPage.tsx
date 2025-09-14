import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import WarningIcon from "@mui/icons-material/Warning";
import { useEffect, useMemo, useState, useRef } from "react";
import { io } from "socket.io-client";
import TwoFingers from "./TwoFingers";

const PRESSURE_RING_BUFFER_SIZE = 8;
const NOTIFICATION_THROTTLE_MS = 30000; // 30 seconds

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
	pressureLeftNorm: number;
	pressureRightNorm: number;
	tilt: number;
	heavyPressNorm: number;
	staticHoldNorm: number;
	burstsNorm: number;
	extremeTiltNorm: number;
	staticHoldStreakSec: number;
	minutesSinceBreak: number;
}

const socket = io("http://localhost:4000");

// Status messages for different metrics and levels
const STATUS_MESSAGES = {
	risk: {
		normal: "Your typing habits are healthy and sustainable",
		warning: "Some strain detected - consider taking breaks more frequently", 
		alert: "High strain levels detected - immediate rest recommended"
	},
	heavyPress: {
		normal: "Excellent keystroke pressure - your fingers are relaxed",
		warning: "Moderate finger strain detected - try lighter keystrokes",
		alert: "Excessive finger pressure detected - rest and adjust technique immediately"
	},
	staticHold: {
		normal: "Great finger movement and flexibility maintained",
		warning: "Your fingers need more movement - try some gentle flexing",
		alert: "Prolonged static positioning detected - stretch and flex your fingers now"
	},
	bursts: {
		normal: "Smooth, controlled finger movements - excellent technique",
		warning: "Some erratic movements detected - slow down and focus on control",
		alert: "Excessive jerky movements detected - take a break and reset your posture"
	},
	extremeTilt: {
		normal: "Optimal wrist positioning maintained",
		warning: "Wrist angle needs adjustment - check your keyboard height",
		alert: "Dangerous wrist angle detected - adjust posture immediately to prevent injury"
	},
	minutesSinceBreak: {
		normal: "You're maintaining a healthy work rhythm",
		warning: "Time for a micro-break - just 30 seconds of stretching will help",
		alert: "You've been typing too long without rest - take a proper break now"
	}
};

// Notification messages for alerts
const NOTIFICATION_MESSAGES = {
	risk: "🚨 High typing strain detected! Take a break now to prevent injury.",
	heavyPress: "⚠️ Excessive finger pressure detected! Lighten your keystrokes and rest your hands.",
	staticHold: "🤲 Your fingers need movement! Take a moment to stretch and flex.",
	bursts: "⚡ Too many sudden movements detected! Slow down and focus on smooth typing.",
	extremeTilt: "🤚 Dangerous wrist angle detected! Adjust your posture immediately.",
	minutesSinceBreak: "⏰ Time for a break! You've been typing too long without rest."
};

export default function LandingPage() {
	const [lastNotifTime, setLastNotifTime] = useState<number | null>(null);
	const previousStatuses = useRef({
		risk: 'normal',
		heavyPress: 'normal', 
		staticHold: 'normal',
		bursts: 'normal',
		extremeTilt: 'normal',
		minutesSinceBreak: 'normal'
	});

	const [stats, setStats] = useState<Stats | null>(null);
	const [notifications, setNotifications] = useState<NotificationItem[]>([{
		id: "1",
		type: "stretch",
		message: "Finger tension spike detected - time for some gentle stretches",
		timestamp: new Date(Date.now() - 5 * 60 * 1000),
		read: false,
	}, {
		id: "2",
		type: "posture",
		message: "Wrist positioning could be improved - check your setup",
		timestamp: new Date(Date.now() - 15 * 60 * 1000),
		read: false,
	}, {
		id: "3",
		type: "break",
		message: "Perfect timing! Your break came right when your fingers needed it",
		timestamp: new Date(Date.now() - 45 * 60 * 1000),
		read: true,
	}]);

	const [pressureLeftRing, setPressureLeftRing] = useState<number[]>([]);
	const [pressureRightRing, setPressureRightRing] = useState<number[]>([]);

	const addPressureLeft = (value: number) => {
		setPressureLeftRing((prev) => {
			const newValues = [...prev, value * 100];
			return newValues.slice(-PRESSURE_RING_BUFFER_SIZE);
		});
	};

	const addPressureRight = (value: number) => {
		setPressureRightRing((prev) => {
			const newValues = [...prev, value * 100];
			return newValues.slice(-PRESSURE_RING_BUFFER_SIZE);
		});
	};

	const pressureLeft = useMemo(() => {
		if (pressureLeftRing.length < 0.5 * PRESSURE_RING_BUFFER_SIZE) return 0;
		return pressureLeftRing.reduce((acc, val) => acc + val, 0) / pressureLeftRing.length;
	}, [pressureLeftRing]);

	const pressureRight = useMemo(() => {
		if (pressureRightRing.length < 0.5 * PRESSURE_RING_BUFFER_SIZE) return 0;
		return pressureRightRing.reduce((acc, val) => acc + val, 0) / pressureRightRing.length;
	}, [pressureRightRing]);

	useEffect(() => {
		function onUpdate(value: Stats) {
			console.log(value);
			setStats(value);
			addPressureLeft(value.pressureLeftNorm);
			addPressureRight(value.pressureRightNorm);
		}
		socket.on("update", onUpdate);
		return () => {
			socket.off("update", onUpdate);
		};
	}, []);

	useEffect(() => {
		Notification.requestPermission().then((result) => {
			console.log('Notification permission:', result);
		});
	}, []);

	// Send notification if status changes to alert and enough time has passed
	const sendNotificationIfNeeded = (metric: keyof typeof STATUS_MESSAGES, currentStatus: string) => {
		const now = Date.now();
		const shouldThrottle = lastNotifTime && (now - lastNotifTime) < NOTIFICATION_THROTTLE_MS;
		
		if (currentStatus === 'alert' && 
			previousStatuses.current[metric] !== 'alert' && 
			!shouldThrottle &&
			Notification.permission === 'granted') {
			
			new Notification('Clau - Ergonomic Alert', {
				body: NOTIFICATION_MESSAGES[metric],
				icon: '/favicon.ico',
				tag: metric // This prevents duplicate notifications for the same metric
			});
			
			setLastNotifTime(now);
		}
		
		previousStatuses.current[metric] = currentStatus;
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

	const riskStatus = useMemo(() => {
		const status = getNormStatus((stats?.risk ?? 0) / 70);
		sendNotificationIfNeeded('risk', status);
		return status;
	}, [stats?.risk]);

	const heavyPressStatus = useMemo(() => {
		const heavyPressNorm = stats?.heavyPressNorm || 0;
		let status;
		if (heavyPressNorm >= 0.3) status = "alert";
		else if (heavyPressNorm >= 0.2) status = "warning";
		else status = "normal";
		
		sendNotificationIfNeeded('heavyPress', status);
		return status;
	}, [stats?.heavyPressNorm]);

	const extremeTiltStatus = useMemo(() => {
		const extremeTiltNorm = stats?.extremeTiltNorm || 0;
		const pressure = stats?.pressure || 0;
		let status;
		if (extremeTiltNorm >= 0.3 && pressure >= 20) status = "alert";
		else if (extremeTiltNorm >= 0.2) status = "warning";
		else status = "normal";
		
		sendNotificationIfNeeded('extremeTilt', status);
		return status;
	}, [stats?.extremeTiltNorm, stats?.pressure]);

	const staticHoldStatus = useMemo(() => {
		const status = getNormStatus(stats?.staticHoldNorm || 0);
		sendNotificationIfNeeded('staticHold', status);
		return status;
	}, [stats?.staticHoldNorm]);
	
	const burstsStatus = useMemo(() => {
		const status = getNormStatus(stats?.burstsNorm || 0);
		sendNotificationIfNeeded('bursts', status);
		return status;
	}, [stats?.burstsNorm]);
	
	const minutesSinceBreakStatus = useMemo(() => {
		const status = getNormStatus((stats?.minutesSinceBreak || 0) / 40);
		sendNotificationIfNeeded('minutesSinceBreak', status);
		return status;
	}, [stats?.minutesSinceBreak]);

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
						<span style={{ fontFamily: "cursive", fontSize: "28px" }}>Health Hub</span>
					</h1>
				</div>

				{/* Agent Summary */}
				{
					/*<div
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
				</div>*/
				}

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
								{STATUS_MESSAGES.risk[riskStatus as keyof typeof STATUS_MESSAGES.risk]}
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
								{STATUS_MESSAGES.heavyPress[heavyPressStatus as keyof typeof STATUS_MESSAGES.heavyPress]}
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
								{STATUS_MESSAGES.staticHold[staticHoldStatus as keyof typeof STATUS_MESSAGES.staticHold]}
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
								{STATUS_MESSAGES.bursts[burstsStatus as keyof typeof STATUS_MESSAGES.bursts]}
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
								{STATUS_MESSAGES.extremeTilt[extremeTiltStatus as keyof typeof STATUS_MESSAGES.extremeTilt]}
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
								{STATUS_MESSAGES.minutesSinceBreak[minutesSinceBreakStatus as keyof typeof STATUS_MESSAGES.minutesSinceBreak]}
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
						Smart Health Insights
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
									Ergonomic Alert
								</h4>
								<p
									style={{
										fontSize: "13px",
										color: "#cccccc",
										margin: 0,
										lineHeight: "1.4",
									}}
								>
									Your finger tension has increased by 18% in the last hour.
									Time for a quick 90-second finger flexibility routine.
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
									Posture Optimization
								</h4>
								<p
									style={{
										fontSize: "13px",
										color: "#cccccc",
										margin: 0,
										lineHeight: "1.4",
									}}
								>
									Slight wrist adjustment recommended - try raising your keyboard
									or lowering your chair by 1-2 inches for optimal angle.
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
									Excellent Form!
								</h4>
								<p
									style={{
										fontSize: "13px",
										color: "#cccccc",
										margin: 0,
										lineHeight: "1.4",
									}}
								>
									Your keystroke consistency has improved 22% this week! 
									This controlled technique will help prevent long-term strain.
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
						Activity Log & Alerts
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
							Recent Activities
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
									Hand Mobility Routine
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
									Tension Release Session
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
									Pressure Point Relief
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
							Health Alerts
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
					position: "relative",
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
						Real-Time Biomechanics
					</h3>
					<p style={{ fontSize: "14px", color: "#888888", margin: 0 }}>
						Live ergonomic monitoring & analysis
					</p>
				</div>

				<div style={{ width: "100%", height: "calc(100% - 80px)", marginTop: "104px" }}>
					<div style={{ width: "100%", height: "100%", position: "relative" }}>
						<TwoFingers indexValue={pressureRight} middleValue={pressureLeft} />
					</div>
				</div>
			</div>
		</div>
	);
}
