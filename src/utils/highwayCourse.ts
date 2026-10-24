import { HighwayUnit, HighwayNode } from '../types/highway';

/**
 * Builds the Duolingo-style CDL Highway Course map with Units, Stepping-Stone Nodes,
 * and Milestones from the endorsement curriculum.
 */
export function generateHighwayUnits(completedNodeIds: string[] = [], nodeStars: Record<string, 1 | 2 | 3> = {}): HighwayUnit[] {
    const rawUnits = [
        {
            id: 'unit_1',
            unitNumber: 1,
            title: 'Pre-Trip & Safety Foundations',
            subtitle: 'Vehicle inspection & road basics',
            accentColor: '#2563eb', // Blue
            categoryId: 'general_knowledge',
            nodes: [
                {
                    id: 'u1_n1',
                    title: 'Walkaround Inspection',
                    subtitle: 'Tires, rims & lights',
                    type: 'lesson' as const,
                    questionCount: 5,
                    xpReward: 15,
                },
                {
                    id: 'u1_n2',
                    title: 'Speed True/False',
                    subtitle: '60-second rapid check',
                    type: 'speed_drill' as const,
                    questionCount: 6,
                    xpReward: 20,
                },
                {
                    id: 'u1_n3',
                    title: 'Mirror & Space Management',
                    subtitle: 'Blind spots & following distance',
                    type: 'lesson' as const,
                    questionCount: 5,
                    xpReward: 15,
                },
                {
                    id: 'u1_n4',
                    title: 'Scale House Inspection',
                    subtitle: 'Interactive roadside roleplay',
                    type: 'scenario' as const,
                    questionCount: 1,
                    xpReward: 25,
                },
                {
                    id: 'u1_n5',
                    title: 'Highway Pitstop Chest',
                    subtitle: 'Claim XP & Diesel Gems',
                    type: 'chest' as const,
                    questionCount: 0,
                    xpReward: 50,
                    gemReward: 30,
                },
                {
                    id: 'u1_n6',
                    title: 'Unit 1 Checkpoint',
                    subtitle: 'Mastery certification',
                    type: 'boss_exam' as const,
                    questionCount: 10,
                    xpReward: 40,
                },
            ],
        },
        {
            id: 'unit_2',
            unitNumber: 2,
            title: 'Air Brakes System Mastery',
            subtitle: 'Compressors, governors & dual air',
            accentColor: '#3b82f6', // Bright Blue
            categoryId: 'air_brakes',
            nodes: [
                {
                    id: 'u2_n1',
                    title: 'Supply Pressure Basics',
                    subtitle: 'Gauges, cut-in & cut-out',
                    type: 'lesson' as const,
                    questionCount: 5,
                    xpReward: 15,
                },
                {
                    id: 'u2_n2',
                    title: 'Dual Air Drill',
                    subtitle: 'Rapid warning buzzer quiz',
                    type: 'speed_drill' as const,
                    questionCount: 6,
                    xpReward: 20,
                },
                {
                    id: 'u2_n3',
                    title: 'Leak-Down Sequencing',
                    subtitle: '7-step test order',
                    type: 'lesson' as const,
                    questionCount: 5,
                    xpReward: 15,
                },
                {
                    id: 'u2_n4',
                    title: 'Mountain Brake Fade',
                    subtitle: 'AI emergency road scenario',
                    type: 'scenario' as const,
                    questionCount: 1,
                    xpReward: 25,
                },
                {
                    id: 'u2_n5',
                    title: 'Air Master Chest',
                    subtitle: 'Gems & Streak Shield',
                    type: 'chest' as const,
                    questionCount: 0,
                    xpReward: 50,
                    gemReward: 40,
                },
                {
                    id: 'u2_n6',
                    title: 'Air Brakes Boss Exam',
                    subtitle: '25-question endorsement sim',
                    type: 'boss_exam' as const,
                    questionCount: 15,
                    xpReward: 50,
                },
            ],
        },
        {
            id: 'unit_3',
            unitNumber: 3,
            title: 'Hazmat & Placard Protocol',
            subtitle: 'UN numbers, shipping papers & leaks',
            accentColor: '#dc2626', // Crimson Red
            categoryId: 'hazmat',
            nodes: [
                {
                    id: 'u3_n1',
                    title: 'Diamond Placards',
                    subtitle: 'Classes 1 through 9',
                    type: 'lesson' as const,
                    questionCount: 5,
                    xpReward: 15,
                },
                {
                    id: 'u3_n2',
                    title: 'Placard Match Drill',
                    subtitle: 'Symbols & UN classes',
                    type: 'speed_drill' as const,
                    questionCount: 6,
                    xpReward: 20,
                },
                {
                    id: 'u3_n3',
                    title: 'Shipping Papers & Tunnels',
                    subtitle: 'Prohibited routes & driver door',
                    type: 'lesson' as const,
                    questionCount: 5,
                    xpReward: 15,
                },
                {
                    id: 'u3_n4',
                    title: 'Spill on Interstate 80',
                    subtitle: 'AI hazmat emergency scenario',
                    type: 'scenario' as const,
                    questionCount: 1,
                    xpReward: 25,
                },
                {
                    id: 'u3_n5',
                    title: 'Hazmat Chest',
                    subtitle: 'Fuel refill & 50 XP',
                    type: 'chest' as const,
                    questionCount: 0,
                    xpReward: 50,
                    gemReward: 50,
                },
                {
                    id: 'u3_n6',
                    title: 'Hazmat Endorsement Exam',
                    subtitle: 'Full 30-question simulation',
                    type: 'boss_exam' as const,
                    questionCount: 15,
                    xpReward: 60,
                },
            ],
        },
        {
            id: 'unit_4',
            unitNumber: 4,
            title: 'Combination Vehicles & Fifth Wheel',
            subtitle: 'Coupling, rollover & glad hands',
            accentColor: '#059669', // Emerald
            categoryId: 'combination_vehicles',
            nodes: [
                {
                    id: 'u4_n1',
                    title: 'Fifth Wheel Coupling',
                    subtitle: 'Kingpin locking jaws',
                    type: 'lesson' as const,
                    questionCount: 5,
                    xpReward: 15,
                },
                {
                    id: 'u4_n2',
                    title: 'Rollover Prevention Drill',
                    subtitle: 'Rearward amplification',
                    type: 'speed_drill' as const,
                    questionCount: 6,
                    xpReward: 20,
                },
                {
                    id: 'u4_n3',
                    title: 'Glad Hands & Service Lines',
                    subtitle: 'Red vs blue emergency lines',
                    type: 'lesson' as const,
                    questionCount: 5,
                    xpReward: 15,
                },
                {
                    id: 'u4_n4',
                    title: 'Winter Jackknife Scenario',
                    subtitle: 'Slippery curve recovery',
                    type: 'scenario' as const,
                    questionCount: 1,
                    xpReward: 25,
                },
                {
                    id: 'u4_n5',
                    title: 'Class A Captain Trophy',
                    subtitle: 'Comprehensive mastery test',
                    type: 'boss_exam' as const,
                    questionCount: 20,
                    xpReward: 70,
                },
            ],
        },
    ];

    // Determine lock/unlock states sequentially
    let previousNodeCompleted = true; // First node is unlocked by default

    return rawUnits.map(unit => {
        const nodes: HighwayNode[] = unit.nodes.map(n => {
            const isCompleted = completedNodeIds.includes(n.id);
            const isUnlocked = previousNodeCompleted;
            const stars = (nodeStars[n.id] || 0) as 0 | 1 | 2 | 3;

            // In Duolingo, you must complete the current node to unlock the next one
            previousNodeCompleted = isCompleted;

            return {
                id: n.id,
                unitId: unit.id,
                title: n.title,
                subtitle: n.subtitle,
                type: n.type,
                categoryId: unit.categoryId,
                questionCount: n.questionCount,
                stars,
                isUnlocked,
                isCompleted,
                xpReward: n.xpReward,
                gemReward: (n as any).gemReward,
            };
        });

        return {
            id: unit.id,
            unitNumber: unit.unitNumber,
            title: unit.title,
            subtitle: unit.subtitle,
            accentColor: unit.accentColor,
            categoryId: unit.categoryId,
            nodes,
        };
    });
}
