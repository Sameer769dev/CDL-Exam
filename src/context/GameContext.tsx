import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { PlayerGameState, TruckerLeague } from '../types/highway';

const GAME_STORAGE_KEY = '@cdl_player_game_state_v1';
const FUEL_REGEN_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes per fuel canister
const MAX_FUEL = 5;

interface GameContextType {
    gameState: PlayerGameState;
    consumeFuel: () => boolean; // returns false if no fuel left
    refuelAll: () => void;
    addFuel: (amount: number) => void;
    addXP: (amount: number) => void;
    addGems: (amount: number) => void;
    buyStreakFreeze: () => boolean;
    completeNode: (nodeId: string, stars: 1 | 2 | 3, xp: number, gems?: number) => void;
    isOutOfFuel: boolean;
    timeUntilNextFuelSec: number;
}

const DEFAULT_STATE: PlayerGameState = {
    fuel: MAX_FUEL,
    maxFuel: MAX_FUEL,
    lastFuelLossTimestamp: null,
    dieselGems: 120, // Starting welcome bonus
    totalXP: 0,
    weeklyXP: 0,
    streakFreezes: 1,
    currentLeague: 'Rookie Hauler',
    completedNodeIds: [],
    nodeStars: {},
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [gameState, setGameState] = useState<PlayerGameState>(DEFAULT_STATE);
    const [isLoaded, setIsLoaded] = useState(false);
    const [timeUntilNextFuelSec, setTimeUntilNextFuelSec] = useState<number>(0);

    // Load persisted state
    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(GAME_STORAGE_KEY);
                if (stored) {
                    const parsed: PlayerGameState = JSON.parse(stored);
                    // Handle fuel regeneration elapsed while app was closed
                    if (parsed.fuel < MAX_FUEL && parsed.lastFuelLossTimestamp) {
                        const elapsed = Date.now() - parsed.lastFuelLossTimestamp;
                        const regenerated = Math.floor(elapsed / FUEL_REGEN_INTERVAL_MS);
                        if (regenerated > 0) {
                            parsed.fuel = Math.min(MAX_FUEL, parsed.fuel + regenerated);
                            parsed.lastFuelLossTimestamp = parsed.fuel < MAX_FUEL
                                ? parsed.lastFuelLossTimestamp + (regenerated * FUEL_REGEN_INTERVAL_MS)
                                : null;
                        }
                    }
                    setGameState(parsed);
                }
            } catch (e) {
                console.error('[GameContext] Failed to load game state', e);
            } finally {
                setIsLoaded(true);
            }
        })();
    }, []);

    // Save state on change
    useEffect(() => {
        if (!isLoaded) return;
        AsyncStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameState)).catch(e => {
            console.error('[GameContext] Failed to save game state', e);
        });
    }, [gameState, isLoaded]);

    // Timer loop for real-time fuel countdown
    useEffect(() => {
        if (gameState.fuel >= MAX_FUEL || !gameState.lastFuelLossTimestamp) {
            setTimeUntilNextFuelSec(0);
            return;
        }

        const interval = setInterval(() => {
            const elapsed = Date.now() - (gameState.lastFuelLossTimestamp || Date.now());
            const remainingMs = Math.max(0, FUEL_REGEN_INTERVAL_MS - (elapsed % FUEL_REGEN_INTERVAL_MS));
            setTimeUntilNextFuelSec(Math.ceil(remainingMs / 1000));

            // Auto increment if interval elapsed
            if (elapsed >= FUEL_REGEN_INTERVAL_MS) {
                setGameState(prev => {
                    const newFuel = Math.min(MAX_FUEL, prev.fuel + 1);
                    return {
                        ...prev,
                        fuel: newFuel,
                        lastFuelLossTimestamp: newFuel < MAX_FUEL ? Date.now() : null,
                    };
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState.fuel, gameState.lastFuelLossTimestamp]);

    const consumeFuel = (): boolean => {
        if (gameState.fuel <= 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
            return false;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        setGameState(prev => ({
            ...prev,
            fuel: Math.max(0, prev.fuel - 1),
            lastFuelLossTimestamp: prev.lastFuelLossTimestamp ?? Date.now(),
        }));
        return true;
    };

    const refuelAll = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setGameState(prev => ({
            ...prev,
            fuel: MAX_FUEL,
            lastFuelLossTimestamp: null,
        }));
    };

    const addFuel = (amount: number) => {
        setGameState(prev => {
            const newFuel = Math.min(MAX_FUEL, prev.fuel + amount);
            return {
                ...prev,
                fuel: newFuel,
                lastFuelLossTimestamp: newFuel < MAX_FUEL ? prev.lastFuelLossTimestamp : null,
            };
        });
    };

    const addXP = (amount: number) => {
        setGameState(prev => {
            const nextTotal = prev.totalXP + amount;
            const nextWeekly = prev.weeklyXP + amount;
            // Determine league based on total XP
            let league: TruckerLeague = 'Rookie Hauler';
            if (nextTotal >= 1500) league = 'Diamond Captain';
            else if (nextTotal >= 800) league = 'Interstate Heavy';
            else if (nextTotal >= 400) league = 'Regional Express';
            else if (nextTotal >= 150) league = 'Local Carrier';

            return {
                ...prev,
                totalXP: nextTotal,
                weeklyXP: nextWeekly,
                currentLeague: league,
            };
        });
    };

    const addGems = (amount: number) => {
        setGameState(prev => ({
            ...prev,
            dieselGems: prev.dieselGems + amount,
        }));
    };

    const buyStreakFreeze = (): boolean => {
        const cost = 80;
        if (gameState.dieselGems < cost) return false;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setGameState(prev => ({
            ...prev,
            dieselGems: prev.dieselGems - cost,
            streakFreezes: prev.streakFreezes + 1,
        }));
        return true;
    };

    const completeNode = (nodeId: string, stars: 1 | 2 | 3, xp: number, gems: number = 10) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setGameState(prev => {
            const updatedCompleted = prev.completedNodeIds.includes(nodeId)
                ? prev.completedNodeIds
                : [...prev.completedNodeIds, nodeId];
            const currentStars = prev.nodeStars[nodeId] || 0;
            const bestStars = Math.max(currentStars, stars) as 1 | 2 | 3;

            return {
                ...prev,
                completedNodeIds: updatedCompleted,
                nodeStars: {
                    ...prev.nodeStars,
                    [nodeId]: bestStars,
                },
                totalXP: prev.totalXP + xp,
                weeklyXP: prev.weeklyXP + xp,
                dieselGems: prev.dieselGems + gems,
            };
        });
    };

    return (
        <GameContext.Provider
            value={{
                gameState,
                consumeFuel,
                refuelAll,
                addFuel,
                addXP,
                addGems,
                buyStreakFreeze,
                completeNode,
                isOutOfFuel: gameState.fuel <= 0,
                timeUntilNextFuelSec,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
