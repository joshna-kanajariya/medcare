import Link from "next/link";
import type { ReactNode } from "react";

import { FeatureCard } from "@/components/ui/feature-card";
import { StatCard } from "@/components/ui/stat-card";

const stats = [
	{
		label: "Active Patients",
		value: "12,481",
		trend: {
			value: "+12% vs last quarter",
			isPositive: true,
		},
		icon: <ChartIcon />,
	},
	{
		label: "Bed Occupancy",
		value: "78%",
		trend: {
			value: "-5% week over week",
			isPositive: false,
		},
		icon: <BedIcon />,
	},
	{
		label: "On-time Appointments",
		value: "96%",
		trend: {
			value: "+4 pts",
			isPositive: true,
		},
		icon: <ClockIcon />,
	},
];

const features = [
	{
		title: "Care orchestration",
		description:
			"Coordinate teams, automate escalations, and keep providers aligned with live care plans.",
		icon: <HeartbeatIcon />,
	},
	{
		title: "Revenue integrity",
		description:
			"Reduce denials with compliant charge capture, payer rules, and realtime reconciliation dashboards.",
		icon: <ShieldIcon />,
	},
	{
		title: "Clinical analytics",
		description:
			"Track outcomes, throughput, and acuity across facilities with predictive insights at the point of care.",
		icon: <SparkleIcon />,
	},
];

export default function Home() {
	return (
		<div className="relative isolate overflow-hidden">
			<div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--color-primary)/0.18,transparent_60%)]" />
			<main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-20 px-6 pb-24 pt-24 sm:px-10 lg:px-12">
				<section className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
					<div className="space-y-8">
						<span className="inline-flex items-center gap-2 rounded-full border border-outline/60 bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
							MEDCARE PLATFORM
						</span>
						<h1 className="text-balance text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl">
							Streamline hospital operations with a composable digital backbone.
						</h1>
						<p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
							MedCare unifies clinical, operational, and financial workflows into a
							single, secure workspace. Empower clinicians with curated insights
							while ensuring administrators maintain compliance and healthy margins.
						</p>
						<div className="flex flex-wrap items-center gap-4">
							<Link
								href="/dashboard"
								className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-hard)] transition hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
							>
								Launch command center
							</Link>
							<Link
								href="/docs"
								className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-outline/60 bg-surface px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
							>
								View API documentation
							</Link>
						</div>
						<div className="grid gap-6 sm:grid-cols-3">
							{stats.map((stat) => (
								<StatCard key={stat.label} {...stat} />
							))}
						</div>
					</div>
					<div className="relative isolate overflow-hidden rounded-[calc(var(--radius-lg)*1.2)] bg-gradient-to-br from-primary/90 via-secondary/80 to-accent/75 p-[2px] shadow-[var(--shadow-hard)]">
						<div className="rounded-[calc(var(--radius-lg)*1.15)] bg-surface/95 px-8 py-10 shadow-inner">
							<h2 className="text-xl font-semibold text-foreground">
								System telemetry
							</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								Real-time visibility across every facility keeps your teams
								proactive instead of reactive.
							</p>
							<ul className="mt-8 space-y-4 text-sm text-muted-foreground">
								<TelemetryItem label="EHR availability" value="99.997%" positive />
								<TelemetryItem label="Lab turnaround" value="&lt; 42m" />
								<TelemetryItem label="Incident response" value="12 min MTTR" positive />
							</ul>
						</div>
					</div>
				</section>

				<section className="space-y-12">
					<header className="max-w-3xl space-y-4">
						<h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
							Built for resilient, patient-centered operations
						</h2>
						<p className="text-base text-muted-foreground">
							Designed with healthcare-grade security controls, audited workflows,
							and guardrails that keep clinicians focused on care.
						</p>
					</header>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{features.map((feature) => (
							<FeatureCard key={feature.title} {...feature} />
						))}
					</div>
				</section>

				<section className="rounded-[var(--radius-lg)] border border-outline/50 bg-surface/80 p-10 shadow-[var(--shadow-soft)] backdrop-blur">
					<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
						<div className="space-y-2">
							<h3 className="text-2xl font-semibold text-foreground">
								Enterprise security baked in
							</h3>
							<p className="text-sm text-muted-foreground">
								SOC 2 Type II, HIPAA, and HITRUST-aligned controls with full audit
								trails. Granular RBAC, PHI masking, and environment isolation come
								standard.
							</p>
						</div>
						<Link
							href="/compliance"
							className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-outline/60 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
						>
							Review compliance framework
						</Link>
					</div>
				</section>

				<section className="rounded-[var(--radius-lg)] border border-outline/60 bg-surface px-6 py-8 shadow-sm">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h3 className="text-lg font-semibold text-foreground">
								Operational health at a glance
							</h3>
							<p className="text-sm text-muted-foreground">
								Monitor platform availability with real-time API probes for
								infrastructure and database connectivity.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<Link
								href="/api/health"
								className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
							>
								GET /api/health
							</Link>
							<Link
								href="/api/db-health"
								className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-outline/60 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
							>
								GET /api/db-health
							</Link>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}

function withStroke(icon: ReactNode) {
	return (
		<svg
			aria-hidden
			viewBox="0 0 24 24"
			className="h-5 w-5 stroke-[1.5]"
			fill="none"
			stroke="currentColor"
		>
			{icon}
		</svg>
	);
}

function ChartIcon() {
	return withStroke(
		<>
			<path d="M4 19h16" />
			<path d="M6 17V7" />
			<path d="M12 17V5" />
			<path d="M18 17v-8" />
		</>,
	);
}

function BedIcon() {
	return withStroke(
		<>
			<path d="M5 9h14a3 3 0 0 1 3 3v7" />
			<path d="M2 19h20" />
			<path d="M2 9v10" />
			<path d="M5 9V7a3 3 0 0 1 6 0v2" />
		</>,
	);
}

function ClockIcon() {
	return withStroke(
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 7v5l3 2" />
		</>,
	);
}

function HeartbeatIcon() {
	return withStroke(
		<>
			<path d="M20.8 9a5 5 0 0 0-8.8-3.2L12 6.8l-.01-.01A5 5 0 0 0 3.2 9c-.47 3.76 2.4 7.05 5.6 9.55a4.18 4.18 0 0 0 5.4 0c3.2-2.5 6.07-5.79 5.6-9.55Z" />
			<path d="m8 13 2-2 2 3 2-2 2 2" />
		</>,
	);
}

function ShieldIcon() {
	return withStroke(
		<>
			<path d="M12 22c4.97-3.35 8-6.28 8-10.5V5l-8-3-8 3v6.5C4 15.72 7.03 18.65 12 22Z" />
			<path d="m9 12 2 2 4-4" />
		</>,
	);
}

function SparkleIcon() {
	return withStroke(
		<>
			<path d="M12 3v4" />
			<path d="M5.2 5.2 8 8" />
			<path d="M3 12h4" />
			<path d="M5.2 18.8 8 16" />
			<path d="M12 21v-4" />
			<path d="m18.8 18.8-2.8-2.8" />
			<path d="M21 12h-4" />
			<path d="m18.8 5.2-2.8 2.8" />
			<circle cx="12" cy="12" r="3" />
		</>,
	);
}

function TelemetryItem({
	label,
	value,
	positive,
}: {
	label: string;
	value: string;
	positive?: boolean;
}) {
	return (
		<li className="flex items-center justify-between gap-3 rounded-[var(--radius-base)] border border-outline/40 bg-surface px-4 py-3">
			<div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
				<span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_4px_rgba(14,165,233,0.15)]" />
				{label}
			</div>
			<span
				className={`text-sm font-semibold ${
					positive ? "text-success" : "text-primary-strong"
				}`}
			>
				{value}
			</span>
		</li>
	);
}
