import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    CircleAlert,
    Cloud,
    Download,
    Leaf,
    MapPin,
    Moon,
    Search,
    Sun,
    TreePine,
    Wrench,
    type LucideIcon,
} from "lucide-react";

import {
    dashboardMetrics,
    healthTrend,
    inventoryZones,
    maintenanceItems,
    speciesDistribution,
    type DashboardMetric,
    type MaintenanceItem,
} from "@/data/demo-tree-inventory";
import { useThemeContext } from "@/hooks/theme.context";
import { cn } from "@/lib/utils";

const metricIcons: LucideIcon[] = [TreePine, Leaf, Wrench, Cloud];

export function TreeInventoryDashboard() {
    const { isDark, toggleTheme } = useThemeContext();

    return (
        <div className="min-h-full bg-background font-base text-foreground">
            <header className="border-b border-border bg-card">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-400 px-600 py-400">
                    <div className="flex min-w-0 items-center gap-300">
                        <div className="flex icon-size-700 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                            <TreePine className="icon-size-400" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-300">
                                <h1 className="truncate font-heading text-600 font-bold leading-600">
                                    Canopy Operations
                                </h1>
                                <span className="hidden rounded-full bg-accent px-300 py-100-nudge text-100 font-semibold uppercase tracking-wide text-accent-foreground sm:inline-flex">
                                    Synthetic demo
                                </span>
                            </div>
                            <p className="text-200 text-muted-foreground">
                                Urban tree inventory command centre
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-200">
                        <button
                            type="button"
                            className="hidden items-center gap-200 rounded-xl border border-border bg-card px-300 py-200 text-200 font-semibold text-card-foreground shadow-sm transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
                        >
                            <Download className="icon-size-200" aria-hidden="true" />
                            Export
                        </button>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="flex icon-size-700 items-center justify-center rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={isDark ? "Use light theme" : "Use dark theme"}
                        >
                            {isDark ? (
                                <Sun className="icon-size-300" aria-hidden="true" />
                            ) : (
                                <Moon className="icon-size-300" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-600 py-600">
                <section className="mb-600 flex flex-col justify-between gap-400 lg:flex-row lg:items-end">
                    <div>
                        <div className="mb-200 flex items-center gap-200 text-200 font-semibold text-primary">
                            <span className="icon-size-100 rounded-full bg-success" aria-hidden="true" />
                            Inventory refreshed 8 minutes ago
                        </div>
                        <h2 className="font-heading text-hero-800 font-bold leading-hero-800">
                            Your urban forest, at a glance.
                        </h2>
                        <p className="mt-200 max-w-2xl text-300 leading-400 text-muted-foreground">
                            Monitor canopy health, species diversity, and field work across every district.
                        </p>
                    </div>
                    <div className="flex flex-col gap-200 sm:flex-row">
                        <label className="relative block">
                            <Search className="absolute left-300 top-1/2 icon-size-200 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <input
                                type="search"
                                placeholder="Search tree ID"
                                className="h-10 w-full rounded-xl border border-input bg-card py-200 pl-800 pr-300 text-200 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:w-64"
                            />
                        </label>
                        <button
                            type="button"
                            className="flex h-10 items-center justify-center gap-200 rounded-xl border border-border bg-card px-300 text-200 font-semibold text-card-foreground shadow-sm hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <CalendarDays className="icon-size-200" aria-hidden="true" />
                            Last 6 months
                        </button>
                    </div>
                </section>

                <section className="mb-500 grid gap-400 sm:grid-cols-2 xl:grid-cols-4" aria-label="Inventory metrics">
                    {dashboardMetrics.map((metric, index) => (
                        <MetricCard key={metric.label} metric={metric} icon={metricIcons[index]} index={index} />
                    ))}
                </section>

                <section className="mb-500 grid gap-500 xl:grid-cols-3" aria-label="Health analytics">
                    <HealthTrendCard />
                    <ConditionCard />
                </section>

                <section className="mb-500 grid gap-500 xl:grid-cols-5" aria-label="Inventory distribution">
                    <InventoryMapCard />
                    <SpeciesCard />
                </section>

                <MaintenanceCard />
            </main>
        </div>
    );
}

function MetricCard({
    metric,
    icon: Icon,
    index,
}: {
    metric: DashboardMetric;
    icon: LucideIcon;
    index: number;
}) {
    const isImprovement = index === 2 ? metric.change.startsWith("-") : metric.change.startsWith("+");
    const TrendIcon = isImprovement ? ArrowUpRight : ArrowDownRight;

    return (
        <article className="rounded-2xl border border-border bg-card p-400 shadow-sm">
            <div className="mb-400 flex items-start justify-between">
                <div className="flex icon-size-700 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="icon-size-300" aria-hidden="true" />
                </div>
                <span className="flex items-center gap-100-nudge rounded-full bg-secondary px-200 py-100 text-100 font-semibold text-success">
                    <TrendIcon className="icon-size-100" aria-hidden="true" />
                    {metric.change}
                </span>
            </div>
            <p className="text-200 font-semibold text-muted-foreground">{metric.label}</p>
            <p className="mt-100 font-numeric text-hero-800 font-bold leading-hero-800">{metric.value}</p>
            <p className="mt-200 text-100 text-muted-foreground">{metric.detail}</p>
        </article>
    );
}

function CardHeading({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div>
            <h3 className="font-heading text-500 font-bold leading-500">{title}</h3>
            <p className="mt-100 text-200 text-muted-foreground">{subtitle}</p>
        </div>
    );
}

function HealthTrendCard() {
    const points = healthTrend
        .map((item, index) => `${34 + index * 104},${184 - (item.score - 70) * 9}`)
        .join(" ");

    return (
        <article className="rounded-2xl border border-border bg-card p-500 shadow-sm xl:col-span-2">
            <div className="mb-500 flex items-start justify-between gap-400">
                <CardHeading title="Canopy health trend" subtitle="Average health score across active trees" />
                <div className="text-right">
                    <p className="font-numeric text-600 font-bold">82.4</p>
                    <p className="text-100 font-semibold text-success">+2.1 pts</p>
                </div>
            </div>
            <div className="h-64 w-full" role="img" aria-label="Canopy health score increased from 76 in April to 82 in September">
                <svg viewBox="0 0 580 220" className="h-full w-full overflow-visible">
                    {[40, 85, 130, 175].map((y) => (
                        <line
                            key={y}
                            x1="34"
                            x2="554"
                            y1={y}
                            y2={y}
                            className="text-border"
                            stroke="currentColor"
                            strokeDasharray="4 8"
                        />
                    ))}
                    <polyline
                        points={points}
                        fill="none"
                        className="text-primary"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {healthTrend.map((item, index) => (
                        <g key={item.month}>
                            <circle
                                cx={34 + index * 104}
                                cy={184 - (item.score - 70) * 9}
                                r="7"
                                className="fill-card text-primary"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <text
                                x={34 + index * 104}
                                y="213"
                                textAnchor="middle"
                                className="fill-muted-foreground text-200"
                            >
                                {item.month}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </article>
    );
}

function ConditionCard() {
    const conditions = [
        { label: "Good", value: "72%", color: "bg-success" },
        { label: "Fair", value: "18%", color: "bg-primary" },
        { label: "At risk", value: "7%", color: "bg-warning" },
        { label: "Critical", value: "3%", color: "bg-destructive" },
    ];

    return (
        <article className="rounded-2xl border border-border bg-card p-500 shadow-sm">
            <CardHeading title="Condition mix" subtitle="Current inventory rating" />
            <div className="my-500 flex justify-center">
                <div className="relative size-40">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label="72 percent of trees are in good condition">
                        <circle cx="50" cy="50" r="40" fill="none" className="text-muted" stroke="currentColor" strokeWidth="12" />
                        <circle cx="50" cy="50" r="40" fill="none" className="text-success" stroke="currentColor" strokeWidth="12" strokeDasharray="181 251" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-numeric text-500 font-bold">72%</span>
                        <span className="text-100 text-muted-foreground">good</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-300">
                {conditions.map((condition) => (
                    <div key={condition.label} className="flex items-center gap-200">
                        <span className={cn("icon-size-100 rounded-full", condition.color)} aria-hidden="true" />
                        <span className="text-200 text-muted-foreground">{condition.label}</span>
                        <span className="ml-auto font-numeric text-200 font-semibold">{condition.value}</span>
                    </div>
                ))}
            </div>
        </article>
    );
}

function InventoryMapCard() {
    return (
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm xl:col-span-3">
            <div className="flex items-start justify-between gap-400 p-500 pb-200">
                <CardHeading title="Inventory by district" subtitle="Bubble size represents active tree count" />
                <span className="flex items-center gap-200 rounded-full bg-secondary px-300 py-100 text-100 font-semibold text-secondary-foreground">
                    <MapPin className="icon-size-100" aria-hidden="true" />
                    5 districts
                </span>
            </div>
            <div className="h-80 w-full px-400 pb-400">
                <svg viewBox="0 0 600 280" className="h-full w-full" role="img" aria-label="Abstract district map showing tree inventory counts and health">
                    <path d="M35 52 L180 20 L280 55 L250 135 L88 150 Z" className="fill-secondary text-border" fill="currentColor" stroke="currentColor" strokeWidth="2" />
                    <path d="M280 55 L462 28 L566 96 L500 160 L350 154 L250 135 Z" className="fill-accent text-border" fill="currentColor" stroke="currentColor" strokeWidth="2" />
                    <path d="M88 150 L250 135 L350 154 L326 260 L132 250 L42 205 Z" className="fill-muted text-border" fill="currentColor" stroke="currentColor" strokeWidth="2" />
                    <path d="M350 154 L500 160 L558 244 L326 260 Z" className="fill-secondary text-border" fill="currentColor" stroke="currentColor" strokeWidth="2" />
                    {inventoryZones.map((zone) => {
                        const radius = 12 + zone.trees / 320;
                        return (
                            <g key={zone.name}>
                                <circle
                                    cx={zone.x}
                                    cy={zone.y}
                                    r={radius + 7}
                                    className="fill-primary opacity-20"
                                />
                                <circle
                                    cx={zone.x}
                                    cy={zone.y}
                                    r={radius}
                                    className="fill-primary"
                                >
                                    <title>{`${zone.name}: ${zone.trees.toLocaleString()} trees, ${zone.health}% healthy`}</title>
                                </circle>
                                <text
                                    x={zone.x}
                                    y={zone.y + 4}
                                    textAnchor="middle"
                                    className="fill-primary-foreground text-100 font-bold"
                                >
                                    {zone.health}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </article>
    );
}

function SpeciesCard() {
    return (
        <article className="rounded-2xl border border-border bg-card p-500 shadow-sm xl:col-span-2">
            <CardHeading title="Top species" subtitle="Largest populations in the inventory" />
            <div className="mt-500 space-y-400">
                {speciesDistribution.map((item) => (
                    <div key={item.species}>
                        <div className="mb-200 flex items-center justify-between gap-300">
                            <span className="truncate text-200 font-semibold">{item.species}</span>
                            <span className="font-numeric text-200 text-muted-foreground">
                                {item.count.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${item.share}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
}

function MaintenanceCard() {
    return (
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-col justify-between gap-300 border-b border-border p-500 sm:flex-row sm:items-center">
                <CardHeading title="Maintenance priorities" subtitle="Upcoming work requiring field attention" />
                <button
                    type="button"
                    className="flex items-center gap-100 text-200 font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    View work plan
                    <ArrowUpRight className="icon-size-200" aria-hidden="true" />
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-secondary text-100 uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th className="px-500 py-300 font-semibold">Tree</th>
                            <th className="px-500 py-300 font-semibold">District</th>
                            <th className="px-500 py-300 font-semibold">Work item</th>
                            <th className="px-500 py-300 font-semibold">Due</th>
                            <th className="px-500 py-300 font-semibold">Priority</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {maintenanceItems.map((item) => (
                            <MaintenanceRow key={item.treeId} item={item} />
                        ))}
                    </tbody>
                </table>
            </div>
        </article>
    );
}

function MaintenanceRow({ item }: { item: MaintenanceItem }) {
    return (
        <tr className="transition-colors hover:bg-hover">
            <td className="whitespace-nowrap px-500 py-400">
                <div className="font-numeric text-200 font-semibold">{item.treeId}</div>
                <div className="mt-100 text-100 text-muted-foreground">{item.species}</div>
            </td>
            <td className="whitespace-nowrap px-500 py-400 text-200">{item.district}</td>
            <td className="whitespace-nowrap px-500 py-400 text-200 font-semibold">{item.task}</td>
            <td className="whitespace-nowrap px-500 py-400 text-200 text-muted-foreground">{item.due}</td>
            <td className="whitespace-nowrap px-500 py-400">
                <span
                    className={cn(
                        "inline-flex items-center gap-100 rounded-full px-200 py-100 text-100 font-semibold",
                        item.priority === "Critical" && "bg-destructive/10 text-destructive",
                        item.priority === "High" && "bg-warning/15 text-warning-foreground",
                        item.priority === "Routine" && "bg-secondary text-secondary-foreground",
                    )}
                >
                    {item.priority === "Critical" && <CircleAlert className="icon-size-100" aria-hidden="true" />}
                    {item.priority}
                </span>
            </td>
        </tr>
    );
}
