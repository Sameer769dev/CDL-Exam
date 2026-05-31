import React, { useState, useMemo, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Linking,
    Modal, FlatList, TextInput, StyleSheet, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
    ChevronLeft, ChevronDown, Search, ExternalLink, BookOpen,
    CheckCircle, XCircle, AlertTriangle, FileText, Calendar,
    DollarSign, ShieldCheck, MapPin, Info, X
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../src/context/ThemeContext';
import { useUser } from '../src/context/UserContext';
import { useProgressStats } from '../src/hooks/useProgressStats';
import { US_STATES, STATE_VERIFICATION_DATA } from '../src/data/states';
import { getCategories } from '../src/utils/dataLoader';

// ─── Animated SVG circle ──────────────────────────────────────────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Pass-probability calculator ─────────────────────────────────────────────
function calcPassProbability(
    accuracy: number,
    totalQuestions: number,
    categoriesStudied: number
): number {
    if (totalQuestions === 0) return 0;

    // Three weighted signals:
    // 1. Overall accuracy (55%)
    const accuracyScore = Math.min(accuracy / 100, 1) * 55;

    // 2. Volume studied – 200+ Qs gives full credit (30%)
    const volumeScore = Math.min(totalQuestions / 200, 1) * 30;

    // 3. Category breadth – 5+ categories (15%)
    const breadthScore = Math.min(categoriesStudied / 5, 1) * 15;

    const raw = accuracyScore + volumeScore + breadthScore;
    return Math.min(Math.round(raw), 100);
}

// ─── Gauge component ──────────────────────────────────────────────────────────
const ProbabilityGauge = ({
    probability,
    isDark
}: {
    probability: number;
    isDark: boolean;
}) => {
    const radius = 80;
    const strokeWidth = 14;
    const innerRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * innerRadius;
    const strokeDashoffset = circumference - (circumference * probability) / 100;

    const color =
        probability >= 80 ? '#22c55e' :
        probability >= 55 ? '#f59e0b' :
        '#ef4444';

    const label =
        probability >= 80 ? 'Exam Ready! ✅' :
        probability >= 55 ? 'Getting Close 🟡' :
        'Keep Studying 🔴';

    const bg = isDark ? '#1e293b' : '#ffffff';

    return (
        <View style={{ alignItems: 'center' }}>
            <View style={{ width: radius * 2, height: radius * 2, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={radius * 2} height={radius * 2}>
                    <Circle
                        cx={radius} cy={radius} r={innerRadius}
                        stroke={color} strokeWidth={strokeWidth}
                        strokeOpacity={0.2} fill="transparent"
                    />
                    <Circle
                        cx={radius} cy={radius} r={innerRadius}
                        stroke={color} strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${radius}, ${radius}`}
                    />
                </Svg>
                <View style={StyleSheet.absoluteFill as any} className="items-center justify-center">
                    <Text style={{ fontSize: 32, fontWeight: '900', color }}>{probability}%</Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">Pass Probability</Text>
                </View>
            </View>
            <View style={{ backgroundColor: `${color}20`, borderColor: `${color}40`, borderWidth: 1 }}
                className="mt-4 px-5 py-2 rounded-full">
                <Text style={{ color, fontWeight: '700', fontSize: 14 }}>{label}</Text>
            </View>
        </View>
    );
};

// ─── Single fee row ────────────────────────────────────────────────────────────
const FeeRow = ({ label, value, icon: Icon, color }: any) => (
    <View className="flex-row items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
        <View className="flex-row items-center flex-1">
            <View style={{ backgroundColor: `${color}15` }} className="w-8 h-8 rounded-xl items-center justify-center mr-3">
                <Icon size={16} color={color} />
            </View>
            <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm">{label}</Text>
        </View>
        <Text className="text-slate-900 dark:text-white font-bold text-base">{value}</Text>
    </View>
);

// ─── Readiness row ────────────────────────────────────────────────────────────
const ReadinessRow = ({ name, attempted, total, highScore }: {
    name: string;
    attempted: number;
    total: number;
    highScore?: number;
}) => {
    const coverage = total > 0 ? (attempted / total) * 100 : 0;
    const ready = (highScore ?? 0) >= 80 && coverage >= 50;
    const partial = !ready && (coverage >= 20 || (highScore ?? 0) >= 50);

    const color = ready ? '#22c55e' : partial ? '#f59e0b' : '#ef4444';
    const Icon = ready ? CheckCircle : partial ? AlertTriangle : XCircle;
    const statusText = ready ? 'Ready' : partial ? 'Borderline' : 'Need Study';

    return (
        <View className="flex-row items-center py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
            <Icon size={18} color={color} style={{ marginRight: 10 }} />
            <View className="flex-1">
                <Text className="text-slate-800 dark:text-slate-200 font-semibold text-sm">{name}</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    {attempted}/{total} Qs • Best: {highScore ?? 0}%
                </Text>
            </View>
            <View style={{ backgroundColor: `${color}20`, borderRadius: 20 }} className="px-3 py-1">
                <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{statusText}</Text>
            </View>
        </View>
    );
};

// ─── State picker modal ───────────────────────────────────────────────────────
const StatePickerModal = ({
    visible,
    selectedCode,
    onSelect,
    onClose,
    isDark
}: {
    visible: boolean;
    selectedCode: string;
    onSelect: (code: string) => void;
    onClose: () => void;
    isDark: boolean;
}) => {
    const [query, setQuery] = useState('');
    const filtered = useMemo(() =>
        US_STATES.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.code.toLowerCase().includes(query.toLowerCase())
        ), [query]);

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View className="bg-white dark:bg-slate-900 rounded-t-3xl" style={{ maxHeight: '85%' }}>
                    {/* Handle */}
                    <View className="items-center pt-3 pb-1">
                        <View className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                    </View>

                    <View className="flex-row items-center justify-between px-6 pb-4 pt-2">
                        <Text className="text-xl font-black text-slate-900 dark:text-white">Select Your State</Text>
                        <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                            <X size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                        </TouchableOpacity>
                    </View>

                    <View className="px-6 mb-3">
                        <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
                            <Search size={18} color="#64748b" />
                            <TextInput
                                className="flex-1 ml-3 text-slate-900 dark:text-white font-medium"
                                placeholder="Search states..."
                                placeholderTextColor="#94a3b8"
                                value={query}
                                onChangeText={setQuery}
                            />
                        </View>
                    </View>

                    <FlatList
                        data={filtered}
                        keyExtractor={item => item.code}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                        renderItem={({ item }) => {
                            const isSelected = item.code === selectedCode;
                            return (
                                <TouchableOpacity
                                    onPress={() => { onSelect(item.code); onClose(); }}
                                    className={`flex-row items-center justify-between p-4 mb-2 rounded-2xl border ${
                                        isSelected
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <View className="flex-row items-center">
                                        <Text className={`text-xs font-bold w-8 ${isSelected ? 'text-blue-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {item.code}
                                        </Text>
                                        <Text className={`font-bold text-base ml-1 ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                            {item.name}
                                        </Text>
                                    </View>
                                    {isSelected && <CheckCircle size={18} color="white" />}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CrossVerifyScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { userProfile, progress, highScores } = useUser();
    const { accuracy, totalQuestions, categoriesStudied } = useProgressStats();

    const [selectedState, setSelectedState] = useState(
        userProfile?.targetState || 'CA'
    );
    const [pickerVisible, setPickerVisible] = useState(false);

    const stateData = STATE_VERIFICATION_DATA[selectedState];
    const categories = useMemo(() => getCategories(), []);
    const probability = useMemo(
        () => calcPassProbability(accuracy, totalQuestions, categoriesStudied),
        [accuracy, totalQuestions, categoriesStudied]
    );

    const openUrl = useCallback(async (url: string, label: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Cannot Open', `Please visit: ${url}`);
            }
        } catch {
            Alert.alert('Error', `Could not open ${label}.`);
        }
    }, []);

    const gaugeColor =
        probability >= 80 ? '#22c55e' :
        probability >= 55 ? '#f59e0b' :
        '#ef4444';

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* ── Header ── */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-2 -ml-2 rounded-full active:bg-slate-100 dark:active:bg-slate-800"
                    >
                        <ChevronLeft size={28} color={isDark ? '#fff' : '#1e293b'} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">Cross-Verify Readiness</Text>
                    <View className="w-10" />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60, paddingTop: 8 }}
                >
                    {/* ── Info banner ── */}
                    <Animated.View entering={FadeInDown.delay(50).springify()}>
                        <LinearGradient
                            colors={isDark ? ['#1e293b', '#0f172a'] : ['#eff6ff', '#dbeafe']}
                            className="p-4 rounded-2xl mb-6 flex-row items-start border border-blue-200 dark:border-blue-900"
                        >
                            <Info size={18} color="#3b82f6" style={{ marginTop: 2, marginRight: 10, flexShrink: 0 }} />
                            <Text className="flex-1 text-blue-800 dark:text-blue-300 text-sm font-medium leading-relaxed">
                                DMV CDL knowledge tests are <Text className="font-black">non-refundable</Text>. Use this tool to confirm you're ready before you pay and book your appointment.
                            </Text>
                        </LinearGradient>
                    </Animated.View>

                    {/* ── State selector ── */}
                    <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-6">
                        <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                            Your Target State
                        </Text>
                        <TouchableOpacity
                            onPress={() => setPickerVisible(true)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
                        >
                            <View className="flex-row items-center">
                                <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl mr-3">
                                    <MapPin size={20} color="#3b82f6" />
                                </View>
                                <View>
                                    <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Testing State</Text>
                                    <Text className="text-slate-900 dark:text-white font-black text-lg">
                                        {stateData?.name || selectedState}
                                    </Text>
                                </View>
                            </View>
                            <View className="bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-xl flex-row items-center">
                                <Text className="text-slate-600 dark:text-slate-300 font-bold text-sm mr-1">Change</Text>
                                <ChevronDown size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* ── Pass Probability Gauge ── */}
                    <Animated.View entering={ZoomIn.delay(150).springify()}>
                        <View className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 mb-6 items-center">
                            <Text className="text-lg font-black text-slate-900 dark:text-white mb-5">
                                Your Pass Probability
                            </Text>
                            <ProbabilityGauge probability={probability} isDark={isDark} />

                            {/* Three stat pills */}
                            <View className="flex-row gap-3 mt-6 w-full">
                                <View className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-2xl p-3 items-center">
                                    <Text className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Accuracy</Text>
                                    <Text className="text-lg font-black text-slate-900 dark:text-white">{accuracy}%</Text>
                                </View>
                                <View className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-2xl p-3 items-center">
                                    <Text className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Questions</Text>
                                    <Text className="text-lg font-black text-slate-900 dark:text-white">{totalQuestions}</Text>
                                </View>
                                <View className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-2xl p-3 items-center">
                                    <Text className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Categories</Text>
                                    <Text className="text-lg font-black text-slate-900 dark:text-white">{categoriesStudied}</Text>
                                </View>
                            </View>

                            {/* Requirement bar */}
                            <View className="w-full mt-4">
                                <View className="flex-row justify-between mb-1.5">
                                    <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">DMV Passing Score</Text>
                                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">80% required</Text>
                                </View>
                                <View className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <View
                                        style={{ width: `${Math.min(accuracy, 100)}%`, backgroundColor: gaugeColor }}
                                        className="h-full rounded-full"
                                    />
                                </View>
                                {/* 80% marker */}
                                <View style={{ position: 'absolute', left: '80%', top: 20, width: 2, height: 10, backgroundColor: '#64748b', borderRadius: 1 }} />
                            </View>
                        </View>
                    </Animated.View>

                    {/* ── Endorsement Readiness Checklist ── */}
                    <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6">
                        <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                            Endorsement Readiness
                        </Text>
                        <View className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm px-5 py-2">
                            {categories.map((cat) => {
                                const prog = progress[cat.id];
                                const best = highScores[cat.id];
                                return (
                                    <ReadinessRow
                                        key={cat.id}
                                        name={cat.name}
                                        attempted={prog?.questionsAttempted ?? 0}
                                        total={cat.totalQuestions}
                                        highScore={best ? Math.round(best.percentage) : 0}
                                    />
                                );
                            })}
                        </View>
                    </Animated.View>

                    {/* ── DMV Fees ── */}
                    {stateData && (
                        <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-6">
                            <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                                {stateData.name} DMV Fees
                            </Text>
                            <View className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm px-5 py-2">
                                <FeeRow label="Permit / Application" value={stateData.permitFee} icon={FileText} color="#3b82f6" />
                                <FeeRow label="Knowledge Test" value={stateData.testFee} icon={ShieldCheck} color="#8b5cf6" />
                                <FeeRow label="Re-test Fee" value={stateData.retestFee} icon={DollarSign} color="#ef4444" />
                            </View>
                            {stateData.notes && (
                                <View className="flex-row items-start mt-3 px-1">
                                    <Info size={14} color="#94a3b8" style={{ marginTop: 1, marginRight: 6, flexShrink: 0 }} />
                                    <Text className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed flex-1">{stateData.notes}</Text>
                                </View>
                            )}
                        </Animated.View>
                    )}

                    {/* ── Official Resources ── */}
                    {stateData && (
                        <Animated.View entering={FadeInDown.delay(400).springify()} className="mb-6">
                            <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                                Official Resources
                            </Text>

                            {/* Download Handbook */}
                            <TouchableOpacity
                                onPress={() => openUrl(stateData.manualUrl, 'Official CDL Handbook')}
                                className="bg-blue-600 rounded-2xl p-4 mb-3 flex-row items-center shadow-lg shadow-blue-500/30 active:opacity-90"
                            >
                                <View className="bg-white/20 w-10 h-10 rounded-xl items-center justify-center mr-4">
                                    <BookOpen size={20} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-black text-base">Download Official Handbook</Text>
                                    <Text className="text-blue-200 text-xs font-medium mt-0.5">{stateData.name} CDL Manual — Free PDF</Text>
                                </View>
                                <ExternalLink size={18} color="rgba(255,255,255,0.7)" />
                            </TouchableOpacity>

                            {/* Book Appointment */}
                            <TouchableOpacity
                                onPress={() => openUrl(stateData.appointmentUrl, 'DMV Appointment')}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex-row items-center border border-slate-200 dark:border-slate-700 shadow-sm active:opacity-80"
                            >
                                <View className="bg-emerald-100 dark:bg-emerald-900/30 w-10 h-10 rounded-xl items-center justify-center mr-4">
                                    <Calendar size={20} color="#10b981" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-900 dark:text-white font-black text-base">Book DMV Appointment</Text>
                                    <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">Schedule your {stateData.name} knowledge test</Text>
                                </View>
                                <ExternalLink size={18} color={isDark ? '#64748b' : '#cbd5e1'} />
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {/* ── Smart Tip ── */}
                    <Animated.View entering={FadeInUp.delay(500).springify()}>
                        <LinearGradient
                            colors={isDark ? ['#14532d', '#052e16'] : ['#dcfce7', '#bbf7d0']}
                            className="rounded-2xl p-4 border border-green-300 dark:border-green-900"
                        >
                            <View className="flex-row items-center mb-2">
                                <ShieldCheck size={18} color="#16a34a" style={{ marginRight: 8 }} />
                                <Text className="text-green-800 dark:text-green-300 font-black text-base">Pro Tip</Text>
                            </View>
                            <Text className="text-green-700 dark:text-green-400 text-sm leading-relaxed font-medium">
                                Score <Text className="font-black">80% or higher</Text> consistently across all categories in this app before booking your DMV appointment. Our questions are based on the same federal CDL manual your state uses.
                            </Text>
                        </LinearGradient>
                    </Animated.View>
                </ScrollView>

                {/* ── State Picker Modal ── */}
                <StatePickerModal
                    visible={pickerVisible}
                    selectedCode={selectedState}
                    onSelect={setSelectedState}
                    onClose={() => setPickerVisible(false)}
                    isDark={isDark}
                />
            </SafeAreaView>
        </View>
    );
}
