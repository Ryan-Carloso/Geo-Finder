import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'react-native';

import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

// Import AsyncStorage from the correct package
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [location, setLocation] = useState(null);
  const [name, setName] = useState('');
  const [seunomename, setSeunomename] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [randomMarker, setRandomMarker] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('savedData');
        if (savedData) {
          const { name: savedName, seunomename: savedSeunomename } = JSON.parse(savedData);
          setName(savedName);
          setSeunomename(savedSeunomename);
        }
      } catch (error) {
        console.error('Erro ao carregar dados salvos do AsyncStorage:', error);
      }
    };

    loadSavedData();
  }, []);

  const handleShowMap = async () => {
    const currentTime = new Date().getTime();

    // Verifica se já passou uma hora desde o último clique
    if (lastClickTime && currentTime - lastClickTime < 3600000) {
      setShowMap(true);
      return;
    }

    if (!name || !seunomename || !/^\d{8,}$/.test(name)) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos corretamente.');
      return;
    }

    try {
      // Salva os dados no AsyncStorage
      await AsyncStorage.setItem('savedData', JSON.stringify({ name, seunomename }));
    } catch (error) {
      console.error('Erro ao salvar dados no AsyncStorage:', error);
    }

    setLoading(true);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permissão de localização negada');
      setLoading(false);
      return;
    }

    try {
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);

      const isNearby = Math.random() < 0.5;
      const distanceMultiplier = isNearby ? 0.02 : 0.2;

      const randomLatitude =
        userLocation.coords.latitude + (Math.random() - 0.5) * distanceMultiplier;
      const randomLongitude =
        userLocation.coords.longitude + (Math.random() - 0.5) * distanceMultiplier;

      setRandomMarker({
        latitude: randomLatitude,
        longitude: randomLongitude,
        name: name || 'Aleatório',
        seunomename: seunomename || 'Aleatório',
      });

      setShowMap(true);
      setLastClickTime(currentTime);
    } catch (error) {
      console.error('Erro ao obter a localização:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowMap(false);
  };

  return (
    <ImageBackground
      source={require('./backft.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        {!showMap ? (
          <View style={styles.inputContainer}>
            <Text style={styles.inputxt}>Numero de quem deseja localizar:</Text>  
            <TextInput
              style={styles.input}
              placeholder="Digite um número"
              value={name}
              onChangeText={(text) => setName(text)}
              keyboardType="numeric"
              maxLength={17}
            />
            <Text style={styles.inputxt1}>(ex: 55 11 973132341)</Text>

            <Text style={styles.inputxt}>Digite o nome dela/e:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome dela/e"
              value={seunomename}
              onChangeText={(text) => setSeunomename(text)}
              keyboardType="default"
              maxLength={16}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleShowMap}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Revelar a localização</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <SafeAreaView style={styles.mapContainer}>
            <TouchableOpacity 
              style={styles.buttonback}
              onPress={handleBack}>
              <Text style={styles.buttonTextback}>Voltar</Text>
            </TouchableOpacity>
            {location && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title={`A sua Localização ${seunomename}`}
                  description={`Você está aqui!`}
                >
                  <View style={styles.markeryou}>
                    <Text style={styles.markerText}>Você</Text>
                  </View>
                </Marker>
                {randomMarker && (
                  <Marker
                    coordinate={{
                      latitude: randomMarker.latitude,
                      longitude: randomMarker.longitude,
                    }}
                    title={`Localização de ${randomMarker.name}`}
                    description={`Ponto a localizar!`}
                  >
                    <View style={styles.marker}>
                      <Text style={styles.markerText}>{seunomename}</Text>
                    </View>
                  </Marker>
                )}
              </MapView>
            )}
          </SafeAreaView>
        )}
        <Image
          source={require('./fundoft.png')}
          style={styles.footerImage}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
   
  buttonTextback: {
    fontSize: 15,
    color: "white",
    alignItems: 'center',
    justifyContent: 'center',


  },

  buttonback:{
    alignItems: 'center',
    justifyContent: 'center',    
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
    width: '100%',
    backgroundColor: '#323232',  
  },
  markerText: {
    opacity: 100,
    color: "white",

  },
  footerImage: {
    marginBottom: 1,
    width: '100%', // Ajuste a largura conforme necessário
    resizeMode: 'cover', // Pode ser 'contain' ou 'stretch' dependendo do comportamento desejado
    position: 'absolute',
    bottom: -1, 
  },
  
  marker: {
    alignContent: "center",
    alignItems: "center",
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    width: '100%',
    marginTop: 50,
    backgroundColor: '#3F3F3F',
    color: "black",
    borderRadius: 50, // Set the borderRadius to half of the height to make it round
  },
  
  markeryou: {
    alignContent: "center",
    alignItems: "center",
    height: 40,
    borderColor: 'white',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    width: '100%',
    marginTop: 50,
    backgroundColor: 'blue',
    color: "white",
    borderRadius: 25, // Set the borderRadius to half of the height to make it round
    borderWidth: 1,
    opacity: 0.9
  },
  
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    height: '50%',
    width: 250,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center"
  },
  button:{
    alignContent: "center",
    alignItems: "center",
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    width: '70%',
    marginTop: 50,
    backgroundColor: 'lightblue',
  },
  input: {
    alignContent: "center",
    alignItems: "center",
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  inputxt: {
    alignContent: "center",
    alignItems: "center",
    color: "white",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    padding: 5
  },
  inputxt1: {
    alignContent: "center",
    alignItems: "center",
    color: "white",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    marginBottom: 20
  },
  mapContainer: {
    flex: 1,
    width: '100%',
  },
  map: {
    flex: 1,
    width: '100%',
  },
});


export { AsyncStorage }; // Add this line if you need to use AsyncStorage elsewhere
