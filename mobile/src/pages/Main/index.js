import React, { useState, useEffect } from "react";
import { Marker, Callout } from "react-native-maps";
import {
  requestPermissionsAsync,
  getCurrentPositionAsync
} from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

import {
  MapView,
  Image,
  DevInfo,
  DevName,
  DevBio,
  DevTechs,
  SearchForm,
  SearchInput,
  SearchButton
} from "./styles";

import api from "../../services/api";
import { connect, disconnect, subscribeToNewDevs } from "../../services/socket";

export default function Main({ navigation }) {
  const [currentRegion, setCurrentRegion] = useState(null);

  const [devs, setDevs] = useState([]);

  const [searchTechs, setSearchTechs] = useState("");

  useEffect(() => {
    async function loadInitialPosition() {
      const { granted } = await requestPermissionsAsync();

      if (granted) {
        const { coords } = await getCurrentPositionAsync({
          enableHighAccuracy: true
        });

        const { latitude, longitude } = coords;
        setCurrentRegion({
          latitude,
          longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04
        });
      }
    }

    loadInitialPosition();
  }, []);

  useEffect(() => {
    subscribeToNewDevs(dev => setDevs([...devs, dev]));
  }, [devs]);

  function setupWebsocket() {
    disconnect();

    const { latitude, longitude } = currentRegion;

    connect({ latitude, longitude, techs: searchTechs });
  }

  async function loadDevs() {
    const { latitude, longitude } = currentRegion;

    const response = await api.get("/search", {
      params: {
        latitude,
        longitude,
        techs: searchTechs
      }
    });

    setDevs(response.data);
    setupWebsocket();
  }

  function handleRegionChange(region) {
    setCurrentRegion(region);
  }

  if (!currentRegion) {
    return null;
  }

  return (
    <>
      <MapView
        initialRegion={currentRegion}
        onRegionChangeComplete={handleRegionChange}
      >
        {devs.map(dev => (
          <Marker
            key={String(dev._id)}
            coordinate={{
              latitude: dev.location.coordinates[1],
              longitude: dev.location.coordinates[0]
            }}
          >
            <Image source={{ uri: dev.avatar_url }} />

            <Callout
              onPress={() =>
                navigation.navigate("Profile", {
                  github_username: dev.github_username
                })
              }
            >
              <DevInfo>
                <DevName>{dev.name}</DevName>
                <DevBio>{dev.bio}</DevBio>
                <DevTechs>{dev.techs.join(", ")}</DevTechs>
              </DevInfo>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <SearchForm>
        <SearchInput
          value={searchTechs}
          onChangeText={setSearchTechs}
          placeholder="Buscar devs por techs..."
          placeholderTextColor="#999"
          autoCapitalize="words"
          autoCorrect={false}
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: {
              width: 4,
              height: 4
            },
            elevation: 2
          }}
        />
        <SearchButton onPress={loadDevs}>
          <MaterialIcons name="my-location" size={20} color="#fff" />
        </SearchButton>
      </SearchForm>
    </>
  );
}
