import React from "react";

const PortfolioSummary = ({ totalAsset, dailyReturn, yearlyReturn }) => (
	<div
		style={{
			display: "flex",
			justifyContent: "space-between",
			gap: 16,
			marginBottom: 32,
			flexWrap: "wrap",
		}}
	>
		<div
			style={{
				flex: 1,
				minWidth: 120,
				background: "#f7fbfa",
				borderRadius: 12,
				padding: 16,
				textAlign: "center",
				fontWeight: "700",
				fontSize: 22,
				color: "#222",
			}}
		>
			<div style={{ fontSize: 28, fontWeight: "900", color: "#222" }}>
				{totalAsset}
			</div>
			<div style={{ fontWeight: "400", fontSize: 14, marginTop: 8 }}>
				총 자산
			</div>
		</div>

		<div
			style={{
				flex: 1,
				minWidth: 120,
				background: "#f7fbfa",
				borderRadius: 12,
				padding: 16,
				textAlign: "center",
				fontWeight: "700",
				fontSize: 18,
				color: "#1ea932",
			}}
		>
			<div style={{ fontSize: 24, fontWeight: "900" }}>{dailyReturn}</div>
			<div style={{ fontWeight: "400", fontSize: 14, marginTop: 8 }}>
				일간 수익률
			</div>
		</div>

		<div
			style={{
				flex: 1,
				minWidth: 120,
				background: "#f7fbfa",
				borderRadius: 12,
				padding: 16,
				textAlign: "center",
				fontWeight: "700",
				fontSize: 18,
				color: "#1ea932",
			}}
		>
			<div style={{ fontSize: 24, fontWeight: "900" }}>{yearlyReturn}</div>
			<div style={{ fontWeight: "400", fontSize: 14, marginTop: 8 }}>
				연간 수익률
			</div>
		</div>
	</div>
);

const PortfolioAllocation = ({ allocation }) => (
	<div>
		<div
			style={{
				fontWeight: "700",
				fontSize: 16,
				marginBottom: 12,
				color: "#222",
			}}
		>
			자산 배분{" "}
			<span
				style={{
					float: "right",
					fontWeight: "400",
					fontSize: 13,
					color: "#666",
				}}
			>
				실시간 업데이트
			</span>
		</div>
		{allocation.map(({ label, percent, color }) => (
			<div key={label} style={{ marginBottom: 14 }}>
				<div
					style={{
						fontWeight: "600",
						fontSize: 14,
						color: "#222",
						marginBottom: 6,
						display: "flex",
						justifyContent: "space-between",
					}}
				>
					<span>{label}</span>
					<span>{percent}%</span>
				</div>
				<div
					style={{
						background: "#e1e1e1",
						borderRadius: 8,
						height: 8,
						overflow: "hidden",
					}}
				>
					<div
						style={{
							width: `${percent}%`,
							height: "100%",
							background: color,
							borderRadius: 8,
							transition: "width 0.3s ease",
						}}
					/>
				</div>
			</div>
		))}
	</div>
);

const PortfolioSummarySection = ({ data }) => (
	<section
		style={{
			background: "#fff",
			borderRadius: 16,
			padding: 24,
			boxSizing: "border-box",
			color: "#222",
			boxShadow: "0 6px 20px rgb(16 16 39 / 0.15)",
		}}
	>
		<h2
			style={{
				fontWeight: "700",
				fontSize: 18,
				marginBottom: 24,
				display: "flex",
				alignItems: "center",
				gap: 8,
			}}
		>
			<span
				style={{
					backgroundColor: "#e2e2e2",
					borderRadius: 4,
					padding: "0 6px",
					fontWeight: "700",
					fontSize: 14,
					color: "#444",
				}}
			>
				!
			</span>{" "}
			포트폴리오 현황
		</h2>

		<PortfolioSummary
			totalAsset={data.totalAsset}
			dailyReturn={data.dailyReturn}
			yearlyReturn={data.yearlyReturn}
		/>
		<PortfolioAllocation allocation={data.allocation} />
	</section>
);

export default PortfolioSummarySection;
