export interface DashboardMetric {
    label: string;
    value: string;
    change: string;
    detail: string;
}

export interface HealthTrendPoint {
    month: string;
    score: number;
}

export interface SpeciesDistribution {
    species: string;
    count: number;
    share: number;
}

export interface InventoryZone {
    name: string;
    trees: number;
    health: number;
    x: number;
    y: number;
}

export interface MaintenanceItem {
    treeId: string;
    species: string;
    district: string;
    task: string;
    due: string;
    priority: "Critical" | "High" | "Routine";
}

export const dashboardMetrics: DashboardMetric[] = [
    {
        label: "Active inventory",
        value: "12,846",
        change: "+4.8%",
        detail: "584 trees added this year",
    },
    {
        label: "Healthy canopy",
        value: "82%",
        change: "+2.1%",
        detail: "10,533 trees rated good",
    },
    {
        label: "Priority work",
        value: "148",
        change: "-12%",
        detail: "32 critical inspections",
    },
    {
        label: "Carbon stored",
        value: "6,420 t",
        change: "+6.4%",
        detail: "Estimated annual impact",
    },
];

export const healthTrend: HealthTrendPoint[] = [
    { month: "Apr", score: 76 },
    { month: "May", score: 78 },
    { month: "Jun", score: 77 },
    { month: "Jul", score: 80 },
    { month: "Aug", score: 81 },
    { month: "Sep", score: 82 },
];

export const speciesDistribution: SpeciesDistribution[] = [
    { species: "Douglas fir", count: 2_846, share: 100 },
    { species: "Western redcedar", count: 2_182, share: 77 },
    { species: "Bigleaf maple", count: 1_594, share: 56 },
    { species: "Red alder", count: 1_241, share: 44 },
    { species: "Garry oak", count: 986, share: 35 },
];

export const inventoryZones: InventoryZone[] = [
    { name: "North district", trees: 2_380, health: 86, x: 164, y: 68 },
    { name: "Harbour parks", trees: 1_760, health: 79, x: 294, y: 108 },
    { name: "Central streets", trees: 3_120, health: 74, x: 378, y: 178 },
    { name: "East greenway", trees: 2_460, health: 83, x: 488, y: 92 },
    { name: "South district", trees: 3_126, health: 88, x: 238, y: 218 },
];

export const maintenanceItems: MaintenanceItem[] = [
    {
        treeId: "TR-10482",
        species: "Western redcedar",
        district: "Central streets",
        task: "Risk inspection",
        due: "Today",
        priority: "Critical",
    },
    {
        treeId: "TR-08217",
        species: "Bigleaf maple",
        district: "Harbour parks",
        task: "Crown pruning",
        due: "Sep 3",
        priority: "High",
    },
    {
        treeId: "TR-11903",
        species: "Douglas fir",
        district: "East greenway",
        task: "Pest treatment",
        due: "Sep 4",
        priority: "High",
    },
    {
        treeId: "TR-06741",
        species: "Garry oak",
        district: "North district",
        task: "Soil assessment",
        due: "Sep 8",
        priority: "Routine",
    },
];
