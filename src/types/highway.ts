export type NodeType = 'lesson' | 'speed_drill' | 'scenario' | 'chest' | 'boss_exam';

export interface HighwayNode {
    id: string;
    unitId: string;
    title: string;
    subtitle: string;
    type: NodeType;
    categoryId: string;
    questionCount: number;
    stars: 0 | 1 | 2 | 3;
    isUnlocked: boolean;
    isCompleted: boolean;
    xpReward: number;
    gemReward?: number;
}

export interface HighwayUnit {
    id: string;
    unitNumber: number;
    title: string;
    subtitle: string;
    accentColor: string;
    categoryId: string;
    nodes: HighwayNode[];
}

export type TruckerLeague = 'Rookie Hauler' | 'Local Carrier' | 'Regional Express' | 'Interstate Heavy' | 'Diamond Captain';

export interface PlayerGameState {
    fuel: number;             // 0 - 5 (Hearts)
    maxFuel: number;          // 5
    lastFuelLossTimestamp: number | null;
    dieselGems: number;       // Currency
    totalXP: number;
    weeklyXP: number;
    streakFreezes: number;
    currentLeague: TruckerLeague;
    completedNodeIds: string[];
    nodeStars: Record<string, 1 | 2 | 3>;
}
