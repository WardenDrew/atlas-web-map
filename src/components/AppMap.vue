<template>
  <div id="map"></div>
  <div class="full-width absolute-top row justify-center z-top q-mt-sm">
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <q-btn
        v-show="showCenterMapButton"
        size="sm"
        rounded
        label="Re-center Map"
        color="accent"
        icon-right="mdi-image-filter-center-focus"
        @click="centerMap"
      ></q-btn>
    </transition>
  </div>
</template>

<style lang="scss">
.body--dark #map {
  background-color: $dark-page;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

img.leaflet-tile {
  image-rendering: pixelated;
}

.gridLabel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.gridLabelText {
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(1px);
  text-align: center;
  padding: 2px 4px;
}
</style>

<script setup lang="ts">
import {
  map,
  extend,
  CRS,
  Transformation,
  imageOverlay,
  tileLayer,
  Marker,
  DivIcon,
} from 'leaflet';
import type { LatLngBoundsExpression, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { onMounted, ref } from 'vue';
import { useMapViewStore } from 'src/stores/mapViewStore';
const mapViewStore = useMapViewStore();

// constants for this map
const cellSize = 1400000;
const cellRowNum = 9;
const cellColNum = 9;

const highResTileSize = 2048;
const mapUnitPixelScale = highResTileSize / cellSize;

const worldXMax = cellRowNum * cellSize;
const worldYMax = cellColNum * cellSize;

const bounds: LatLngBoundsExpression = [
  [0, 0],
  [worldYMax, worldXMax],
];

// Center Button
const showCenterMapButton = ref(false);
let isCentering = false;
const centerMap = () => {
  isCentering = true;
  showCenterMapButton.value = false;
  appMap?.fitBounds(bounds);
};

const colToLetter = function (col: number) {
  return (col + 10).toString(36).toUpperCase();
};

let appMap: Map | undefined = undefined;

onMounted(() => {
  appMap = map('map', {
    crs: extend({}, CRS.Simple, {
      transformation: new Transformation(mapUnitPixelScale, 0, mapUnitPixelScale, 0),
    }),
    maxZoom: 5,
    minZoom: -5,
    zoom: -5,
    zoomSnap: 1,
    zoomDelta: 1,
    attributionControl: false,
  });

  appMap.on('contextmenu', function (event) {
    console.log('Coordinates: ' + event.latlng.toString());
  });

  // Low res background
  imageOverlay('map/WorldMapImage.jpg', bounds, {
    pane: 'tilePane',
  }).addTo(appMap);

  // High res tiles
  tileLayer('map/GridCellMapImage_{x}-{y}.jpg', {
    bounds,
    tileSize: highResTileSize,
    minZoom: -2,
    maxZoom: 5,
    minNativeZoom: 0,
    maxNativeZoom: 0,
  }).addTo(appMap);

  // Labels
  for (let cellCol = 0; cellCol < cellColNum; cellCol++) {
    for (let cellRow = 0; cellRow < cellRowNum; cellRow++) {
      const cellCenterX = cellCol * cellSize + cellSize / 2;
      const cellCenterY = cellRow * cellSize + cellSize / 2;

      new Marker([cellCenterY, cellCenterX], {
        icon: new DivIcon({
          html: `<div class="gridLabelText">${colToLetter(cellCol)}${cellRow + 1}</div>`,
          className: 'gridLabel',
        }),
      })
        .on('click', () => {
          appMap?.flyToBounds(
            [
              [cellRow * cellSize, cellCol * cellSize],
              [cellRow * cellSize + cellSize, cellCol * cellSize + cellSize],
            ],
            {
              animate: true,
              duration: 1,
            },
          );
        })
        .addTo(appMap);
    }
  }

  // Need to set center and zoom first
  appMap.fitBounds(bounds);

  appMap.on('movestart', () => {
    if (isCentering) return;
    showCenterMapButton.value = true;
  });

  appMap.on('moveend', () => {
    isCentering = false;
    setTimeout(() => {
      mapViewStore.state.lastCenter = appMap?.getCenter();
      mapViewStore.state.lastZoom = appMap?.getZoom();
    }, 100);
  });

  setTimeout(() => {
    if (
      appMap === undefined ||
      mapViewStore.state.lastCenter === undefined ||
      mapViewStore.state.lastZoom === undefined
    ) {
      return;
    }

    const curCenter = appMap.getCenter();
    const curZoom = appMap.getZoom();

    if (
      curCenter.lat != mapViewStore.state.lastCenter.lat ||
      curCenter.lng != mapViewStore.state.lastCenter.lng ||
      curZoom != mapViewStore.state.lastZoom
    ) {
      appMap.flyTo(mapViewStore.state.lastCenter, mapViewStore.state.lastZoom, {
        animate: true,
        duration: 1,
      });
    }
  }, 200);
});
</script>
