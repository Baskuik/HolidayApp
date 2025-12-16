import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function SettingsScreen({ navigation }) {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const [region, setRegion] = useState('midden');
    const [schoolYear, setSchoolYear] = useState('2025-2026');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedRegion = await AsyncStorage.getItem('region');
            const savedYear = await AsyncStorage.getItem('schoolYear');

            if (savedRegion) setRegion(savedRegion);
            if (savedYear) setSchoolYear(savedYear);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const handleGPS = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Geen toestemming', 'We hebben toestemming nodig om je locatie te gebruiken.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const latitude = location.coords.latitude;

            let detectedRegion;
            if (latitude > 52.5) {
                detectedRegion = 'noord';
            } else if (latitude > 51.5) {
                detectedRegion = 'midden';
            } else {
                detectedRegion = 'zuid';
            }

            setRegion(detectedRegion);
            Alert.alert('GPS Locatie', `Regio gedetecteerd: ${detectedRegion.charAt(0).toUpperCase() + detectedRegion.slice(1)}`);
        } catch (error) {
            Alert.alert('Fout', 'Kon locatie niet ophalen. Probeer het opnieuw.');
            console.error('GPS Error:', error);
        }
    };

    const handleSave = async () => {
        try {
            await AsyncStorage.setItem('region', region);
            await AsyncStorage.setItem('schoolYear', schoolYear);

            Alert.alert('Opgeslagen', 'Je instellingen zijn opgeslagen!', [
                { text: 'OK', onPress: () => navigation.navigate('Overzicht') }
            ]);
        } catch (error) {
            Alert.alert('Fout', 'Kon instellingen niet opslaan.');
            console.error('Save Error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.content, isLandscape && styles.contentLandscape]}>
                <View style={[styles.section, isLandscape && styles.sectionLandscape]}>
                    <Text style={styles.label}>Regio</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={region}
                            onValueChange={(value) => setRegion(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Noord" value="noord" />
                            <Picker.Item label="Midden" value="midden" />
                            <Picker.Item label="Zuid" value="zuid" />
                        </Picker>
                    </View>

                    <TouchableOpacity style={styles.gpsButton} onPress={handleGPS}>
                        <Text style={styles.buttonText}>📍 Gebruik GPS</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, isLandscape && styles.sectionLandscape]}>
                    <Text style={styles.label}>Schooljaar</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={schoolYear}
                            onValueChange={(value) => setSchoolYear(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="2024-2025" value="2024-2025" />
                            <Picker.Item label="2025-2026" value="2025-2026" />
                            <Picker.Item label="2026-2027" value="2026-2027" />
                        </Picker>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.buttonText}>Opslaan</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        flex: 1,
        padding: 20,
        gap: 16,
    },
    contentLandscape: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    section: {
        marginBottom: 30,
    },
    sectionLandscape: {
        flex: 1,
        minWidth: '45%',
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 10,
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginBottom: 15,
    },
    picker: {
        height: 50,
    },
    gpsButton: {
        backgroundColor: '#3b82f6',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    footer: {
        padding: 20,
        paddingBottom: 30,
    },
    saveButton: {
        backgroundColor: '#3b82f6',
        padding: 18,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});