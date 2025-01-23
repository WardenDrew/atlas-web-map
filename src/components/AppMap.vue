<template>
  <div>
    <div id="map"></div>

    <!-- Center Map Button -->
    <div
      class="absolute-top row justify-center z-1000 q-mt-sm"
      style="pointer-events: none"
    >
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <q-btn
          v-show="showCenterMapButton"
          rounded
          label="Re-center Map"
          color="accent"
          icon-right="mdi-image-filter-center-focus"
          @click="centerMap"
          style="pointer-events: auto"
        ></q-btn>
      </transition>
    </div>

    <!-- Buttom Map Name Bar -->
    <div
      class="full-width absolute-bottom z-1000"
      style="pointer-events: none"
    >
      <div class="row justify-center">
        <div class="text-subtitle1 q-py-xs q-px-sm q-mb-xs text-white overlay-bg-blur">
          Furtive Sage Gaming - Pirate's Parley
        </div>
      </div>
    </div>

    <!-- FAB Buttons -->
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
      class="z-1000"
    >
      <div class="column items-center q-gutter-sm">
        <q-btn
          round
          icon="mdi-layers-outline"
          color="amber"
          @click="showLayersDialog"
        />
        <q-btn
          round
          icon="mdi-map-marker-plus"
          color="primary"
          disabled
        />
        <q-btn
          fab
          icon="mdi-map-search"
          color="accent"
          @click="showSearchDialog"
        />
      </div>
    </q-page-sticky>

    <!-- Search Dialog -->
    <q-dialog
      v-model="isShowSearchDialog"
      backdrop-filter="blur(5px)"
    >
      <div class="row full-width">
        <q-form
          @submit="doSearch"
          class="row full-width q-gutter-sm"
        >
          <q-input
            outlined
            v-model="searchQuery"
            placeholder="Search is not hooked up yet!"
            class="overlay-bg-blur col-grow"
            autofocus
            clearable
          />
          <q-btn
            type="submit"
            icon="mdi-map-search"
            color="accent"
            @click="doSearch"
          />
        </q-form>
      </div>
    </q-dialog>

    <!-- Layers Dialog -->
    <q-dialog
      v-model="isShowLayersDialog"
      backdrop-filter="blur(5px)"
    >
      <q-card>
        <q-card-section> </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style lang="scss">
.z-1000 {
  z-index: 1000;
}

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

.tradewinds-layer {
  filter: brightness(60%);
  mix-blend-mode: color-dodge;
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

.overlay-bg-blur {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
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
  layerGroup,
} from 'leaflet';
import type { LatLngBoundsExpression, Layer, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Ref } from 'vue';
import { onMounted, ref } from 'vue';
import { useMapViewStore } from 'src/stores/mapViewStore';
const mapViewStore = useMapViewStore();

// Search
const isShowSearchDialog = ref(false);
const showSearchDialog = () => {
  isShowSearchDialog.value = true;
};
const searchQuery = ref<string | undefined>(undefined);
const doSearch = () => {
  isShowSearchDialog.value = false;
};

// Layers Interface
const isShowLayersDialog = ref(false);
const showLayersDialog = () => {
  isShowLayersDialog.value = true;
};

// Center Button
const showCenterMapButton = ref(false);
let isCentering = false;
const centerMap = () => {
  isCentering = true;
  showCenterMapButton.value = false;
  appMap?.fitBounds(bounds);
};

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

// Column Number to Letter Math
const colToLetter = function (col: number) {
  return (col + 10).toString(36).toUpperCase();
};

// Interface for layers that the user can select
interface DataLayer {
  id: string;
  label: string;
  state: Ref<boolean, boolean>;
  showing: boolean;
  layerInitFunc: () => Layer;
  layerRef: Layer | undefined;
}

// Primary Layers on the map
const primaryDataLayers: DataLayer[] = [
  {
    id: 'map',
    label: 'Map Imagery',
    state: ref(true),
    showing: false,
    layerInitFunc: () => {
      const group = layerGroup();

      imageOverlay('map/WorldMapImage.jpg', bounds, {
        pane: 'tilePane',
      }).addTo(group);

      tileLayer('map/GridCellMapImage_{x}-{y}.jpg', {
        bounds,
        tileSize: highResTileSize,
        minZoom: -2,
        maxZoom: 5,
        minNativeZoom: 0,
        maxNativeZoom: 0,
      }).addTo(group);

      return group;
    },
    layerRef: undefined,
  },

  {
    id: 'cell_labels',
    label: 'Grid Labels',
    state: ref(true),
    showing: false,
    layerInitFunc: () => {
      const group = layerGroup();

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
            .addTo(group);
        }
      }
      return group;
    },
    layerRef: undefined,
  },

  {
    id: 'tradewinds',
    label: 'Tradewinds',
    state: ref(true),
    showing: false,
    layerInitFunc: () => {
      const group = layerGroup();

      tileLayer('map/GridCellTradewindMapImage_{x}-{y}.jpg', {
        bounds,
        tileSize: highResTileSize,
        minZoom: -5,
        maxZoom: 5,
        minNativeZoom: 0,
        maxNativeZoom: 0,
        className: 'tradewinds-layer',
      }).addTo(group);

      return group;
    },
    layerRef: undefined,
  },
];

// Refresh all Layers
const refreshLayers = function () {
  refreshLayer(primaryDataLayers);
};

// Refresh specific layer
const refreshLayer = function (dataLayers: DataLayer[]) {
  dataLayers.forEach((layer) => {
    if (layer.state.value === layer.showing) {
      return;
    }

    if (appMap === undefined) {
      return;
    }

    if (layer.layerRef === undefined) {
      layer.layerRef = layer.layerInitFunc();
    }

    if (layer.state) {
      layer.layerRef.addTo(appMap);
      layer.showing = true;
    } else {
      layer.layerRef.removeFrom(appMap);
      layer.showing = false;
    }
  });
};

// BUILD THE MAP

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

  refreshLayers();

  // Need to set center and zoom first before attaching move handlers
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
