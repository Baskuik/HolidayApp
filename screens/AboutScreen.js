//deze pagina toont informatie over mezelf en de app.

import { Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export default function AboutScreen() {
    // width en height voor landscape.
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.content, isLandscape && styles.contentLandscape]}>
                <View style={[styles.photoContainer, isLandscape && styles.photoContainerLandscape]}>
                    {/*mijn selfie*/}
                    <Image
                        source={require('../assets/images/selfie.jpg')}
                        style={styles.photo}
                    />
                </View>
        {/*de tekst*/}
                <Text style={styles.name}>Bas Kuik</Text>

                <Text style={styles.role}>Ontwikkelaar</Text>

                <Text style={styles.studentNumber}>Studentnummer: 97105236</Text>

                <View style={[styles.section, isLandscape && styles.sectionLandscape]}>
                    <Text style={styles.sectionTitle}>Over deze app:</Text>
                    <Text style={styles.description}>
                        Deze app toont schoolvakanties voor verschillende regio's in Nederland.
                        Data komt van de Rijksoverheid API.
                    </Text>
                </View>

                <View style={[styles.section, isLandscape && styles.sectionLandscape]}>
                    <Text style={styles.sectionTitle}>Functies:</Text>
                    <Text style={styles.listItem}>• Overzicht van alle schoolvakanties</Text>
                    <Text style={styles.listItem}>• Countdown tot volgende vakantie</Text>
                    <Text style={styles.listItem}>• GPS regio detectie</Text>
                    <Text style={styles.listItem}>• Meerdere schooljaren</Text>
                </View>

                <View style={styles.versionContainer}>
                    <Text style={styles.versionLabel}>Versie:</Text>
                    <Text style={styles.versionNumber}>1.0.0</Text>
                </View>

                <Text style={styles.footer}>
                    Gemaakt voor school opdracht{'\n'}
                    React Native • Expo
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    contentLandscape: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
    },
    photoContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    photoContainerLandscape: {
        marginRight: 16,
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e5e7eb',
        borderWidth: 3,
        borderColor: '#9ca3af',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoEmoji: {
        fontSize: 60,
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#3b82f6',
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    role: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 4,
    },
    studentNumber: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 30,
    },
    section: {
        width: '100%',
        marginBottom: 25,
    },
    sectionLandscape: {
        maxWidth: 480,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 22,
    },
    listItem: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 24,
    },
    versionContainer: {
        marginTop: 20,
        marginBottom: 30,
    },
    versionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 5,
    },
    versionNumber: {
        fontSize: 14,
        color: '#6b7280',
    },
    footer: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 40,
        lineHeight: 18,
    },
});