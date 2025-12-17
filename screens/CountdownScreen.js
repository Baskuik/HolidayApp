//deze pagina toont een countdown tot de volgende vakantie op basis van de regio en het schooljaar die zijn opgeslagen in de asyncstorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

export default function CountdownScreen({ navigation, route }) {
    //haalt schermbreedte op via usedWindowDimensions om te bepalen of het scherm in landschap of normale modus is.
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const [nextHoliday, setNextHoliday] = useState(null);
    const [daysLeft, setDaysLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState('midden');
    const [schoolYear, setSchoolYear] = useState('2025-2026');

    useEffect(() => {
        loadDataAndCalculate();
    }, [route?.params?.holiday]);
    //haalt regio en schooljaar op uit asycnstorage en rekent dagen tot volgende vakantie (vandaag - startdatum = aantaldagen)
    //checkt of er een vakantie is doorgegeven via route.params of asyncstorage anders haalt die de eerst volgende vakantie op via de API
    const loadDataAndCalculate = async () => {
        try {
            setLoading(true);

            const savedRegion = await AsyncStorage.getItem('region');
            const savedYear = await AsyncStorage.getItem('schoolYear');

            const currentRegion = savedRegion || 'midden';
            const currentYear = savedYear || '2025-2026';

            setRegion(currentRegion);
            setSchoolYear(currentYear);

            //checkt of vakantie is aangeklikt in overzicht scherm dan gebruikt die die.
            const passedHoliday = route?.params?.holiday;
            if (passedHoliday) {
                console.log('Using passed holiday from route.params:', JSON.stringify(passedHoliday));
                setNextHoliday(passedHoliday);
                const today = new Date();
                const startDate = new Date(passedHoliday.startdate);
                const diffTime = startDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setDaysLeft(diffDays);
                setLoading(false);
                return;
            }

            //als er geen opgeslagen vakanties uit eerdere sessie zijn, haal dan de eerst volgende vakantie op via de API.
            try {
                const stored = await AsyncStorage.getItem('selectedHoliday_v1');
                if (stored) {
                    const sel = JSON.parse(stored);
                    console.log('Using selected holiday from AsyncStorage:', JSON.stringify(sel));
                    setNextHoliday(sel);
                    const today = new Date();
                    const startDate = new Date(sel.startdate);
                    const diffTime = startDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setDaysLeft(diffDays);
                    await AsyncStorage.removeItem('selectedHoliday_v1');
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.warn('Error reading selectedHoliday from storage:', e);
            }

            const url = `https://opendata.rijksoverheid.nl/v1/sources/rijksoverheid/infotypes/schoolholidays/schoolyear/${currentYear}?output=json`;
            let response;
            let lastError;

            for (let i = 0; i < 3; i++) {
                try {
                    response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'HolidayApp/1.0',
                        },
                        timeout: 15000,
                    });

                    if (response.ok) break;
                } catch (error) {
                    lastError = error;
                    console.warn(`Attempt ${i + 1} failed:`, error.message);
                    if (i < 2) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                    }
                }
            }

            if (!response || !response.ok) {
                throw lastError || new Error('Network request failed');
            }

            const data = await response.json();

            const transformedHolidays = [];
            data.content[0].vacations.forEach(vacation => {
                vacation.regions.forEach(regionData => {
                    if (regionData.region === currentRegion || (regionData.region || '').toLowerCase().includes('heel')) {
                        transformedHolidays.push({
                            type: vacation.type,
                            startdate: regionData.startdate,
                            enddate: regionData.enddate,
                            region: regionData.region,
                        });
                    }
                });
            });

            const today = new Date();
            const upcomingHolidays = transformedHolidays.filter(holiday => {
                const startDate = new Date(holiday.startdate);
                return startDate >= today;
            });
            if (upcomingHolidays.length > 0) {
                upcomingHolidays.sort((a, b) => new Date(a.startdate) - new Date(b.startdate));
                const next = upcomingHolidays[0];

                setNextHoliday(next);

                const startDate = new Date(next.startdate);
                const diffTime = startDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setDaysLeft(diffDays);
            }
        } catch (error) {
            console.error('Error:', error);
            setNextHoliday(null);
        } finally {
            setLoading(false);
        }
    };
    //geeft een emoji terug op basis van het type vakantie
    const getSeasonEmoji = (type) => {
        if (type.toLowerCase().includes('herfst')) return '🍂';
        if (type.toLowerCase().includes('kerst')) return '🎄';
        if (type.toLowerCase().includes('voorjaar')) return '🌸';
        if (type.toLowerCase().includes('mei')) return '🌸';
        if (type.toLowerCase().includes('zomer')) return '☀️';
        return '📅';
    };
    //maakt datums beter inplaats van 2025-01-01 naar 1 jan 2025
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('nl-NL', options);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Countdown laden...</Text>
            </View>
        );
    }

    //als er geen volgende vakantie is gevonden toon dan een bericht
    if (!nextHoliday) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        Regio: {region.charAt(0).toUpperCase() + region.slice(1)} | {schoolYear}
                    </Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Geen aankomende vakanties gevonden</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    Regio: {region.charAt(0).toUpperCase() + region.slice(1)} | {schoolYear}
                </Text>
            </View>

            <View style={[styles.countdownCard, isLandscape && styles.countdownCardLandscape]}>
                {/* Seizoen Icoon */}
                <View style={[styles.iconContainer, isLandscape && styles.iconContainerLandscape]}>
                    <Text style={styles.emoji}>{getSeasonEmoji(nextHoliday.type)}</Text>
                </View>

                {/* Vakantie Info */}
                <View style={isLandscape ? styles.infoColumn : undefined}>
                    <Text style={styles.holidayName}>{nextHoliday.type}</Text>
                    <Text style={styles.date}>{formatDate(nextHoliday.startdate)}</Text>
                    {isLandscape && (
                        <>
                            <Text style={styles.countdownNumber}>{daysLeft}</Text>
                            <Text style={styles.countdownText}>dagen te gaan</Text>
                        </>
                    )}
                </View>

                {!isLandscape && (
                    <>
                        <Text style={styles.countdownNumber}>{daysLeft}</Text>
                        <Text style={styles.countdownText}>dagen te gaan</Text>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        backgroundColor: '#3b82f6',
        padding: 12,
        alignItems: 'center',
    },
    headerText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    countdownCard: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    countdownCardLandscape: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#fbbf24',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 3,
        borderColor: '#000',
    },
    iconContainerLandscape: {
        marginBottom: 0,
    },
    emoji: {
        fontSize: 70,
    },
    infoColumn: {
        alignItems: 'center',
    },
    holidayName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    date: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 40,
    },
    countdownNumber: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    countdownText: {
        fontSize: 18,
        color: '#6b7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
    },
});