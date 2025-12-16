import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function OverzichtScreen({ navigation }) {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [region, setRegion] = useState('midden');
    const [schoolYear, setSchoolYear] = useState('2025-2026');

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation?.addListener('focus', () => {
            loadSettings();
        });
        return unsubscribe;
    }, [navigation]);

    const loadSettings = async () => {
        try {
            const savedRegion = await AsyncStorage.getItem('region');
            const savedYear = await AsyncStorage.getItem('schoolYear');

            if (savedRegion) setRegion(savedRegion);
            if (savedYear) setSchoolYear(savedYear);

            await fetchHolidays(savedRegion || region, savedYear || schoolYear);
        } catch (error) {
            console.error('Error loading settings:', error);
            await fetchHolidays(region, schoolYear);
        }
    };

    const fetchHolidays = async (currentRegion, currentYear, retries = 3) => {
        try {
            setLoading(true);
            const url = `https://opendata.rijksoverheid.nl/v1/sources/rijksoverheid/infotypes/schoolholidays/schoolyear/${currentYear}?output=json`;
            console.log('Fetching from URL:', url);
            console.log('Region:', currentRegion);

            let response;
            let lastError;

            for (let i = 0; i < retries; i++) {
                try {
                    response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'HolidayApp/1.0',
                        },
                        timeout: 15000,
                    });

                    console.log(`Attempt ${i + 1}: Response status:`, response.status);

                    if (response.ok) {
                        break;
                    }
                } catch (error) {
                    lastError = error;
                    console.warn(`Attempt ${i + 1} failed:`, error.message);
                    if (i < retries - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                    }
                }
            }

            if (!response || !response.ok) {
                throw lastError || new Error('Network request failed after retries');
            }

            const data = await response.json();
            console.log('Data received successfully');
            console.log('Total vacations in API:', data.content[0].vacations.length);

            const transformedHolidays = [];
            data.content[0].vacations.forEach(vacation => {
                vacation.regions.forEach(regionData => {
                    if (regionData.region === currentRegion || (regionData.region || '').toLowerCase().includes('heel')) {
                        transformedHolidays.push({
                            type: (vacation.type || '').trim(),
                            startdate: regionData.startdate,
                            enddate: regionData.enddate,
                            region: regionData.region,
                        });
                    }
                });
            });

            console.log('Filtered holidays:', transformedHolidays.length);
            if (transformedHolidays.length > 0) {
                console.log('First holiday:', JSON.stringify(transformedHolidays[0]));
            }

            transformedHolidays.sort((a, b) => new Date(a.startdate) - new Date(b.startdate));

            setHolidays(transformedHolidays);
        } catch (error) {
            console.error('Error fetching holidays:', error);
            console.error('Full error:', JSON.stringify(error));
            setHolidays([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadSettings();
    };

    const calculateDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('nl-NL', options);
    };

    const renderHolidayCard = ({ item }) => {
        const days = calculateDays(item.startdate, item.enddate);

        const handlePress = async () => {
            try {
                console.log('Selected holiday for countdown:', JSON.stringify(item));
                await AsyncStorage.setItem('selectedHoliday_v1', JSON.stringify(item));
                navigation.navigate('Countdown', { holiday: item });
            } catch (e) {
                console.error('Error saving selected holiday:', e);
                navigation.navigate('Countdown', { holiday: item });
            }
        };

        return (
            <TouchableOpacity style={styles.card} onPress={handlePress}>
                <Text style={styles.cardTitle}>{item.type}</Text>
                <Text style={styles.cardDate}>
                    {formatDate(item.startdate)} - {formatDate(item.enddate)}
                </Text>
                <Text style={styles.cardDays}>{days} dagen</Text>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Vakanties laden...</Text>
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

            <FlatList
                data={holidays}
                renderItem={renderHolidayCard}
                keyExtractor={(item, index) => index.toString()}
                key={isLandscape ? 'landscape-2-cols' : 'portrait-1-col'}
                numColumns={isLandscape ? 2 : 1}
                columnWrapperStyle={isLandscape ? styles.columnWrapper : undefined}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3b82f6']}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    columnWrapper: {
        gap: 12,
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
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    cardDate: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    cardDays: {
        fontSize: 14,
        color: '#6b7280',
    },
});