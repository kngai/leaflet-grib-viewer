<template>
  <v-container>
    <div>
      <label for="grib-file-select">Filename:</label><br />
      <select
        v-model="selectedGrib2FileIndex"
        id="grib-file-select"
        @change="changeGrib">
        <option v-for="(filename, index) in grib2Files" :key="index" :value="index">{{ filename }}</option>
      </select>
    </div>

    <l-map
      id="map-grib2class"
      :zoom="zoom"
      :center="center"
      :minZoom="minZoom"
      ref="grib2ClassMap">
      <l-control-scale position="bottomleft"></l-control-scale>
      <l-control-layers position="topright"></l-control-layers>
      <l-tile-layer
        v-for="(layer, index) in tileLayerList"
        :key="index"
        :ref="layer.id"
        :url="layer.url"
        :attribution="layer.attributionHtml"
        :name="layer.name"
        :visible="index === 0"
        :options="layer.options"
        layer-type="base"></l-tile-layer>
    </l-map>

    <h3>Parsed file details</h3>
    <v-row v-if="selectedGribLoaded">
      <v-col>
        <h3>Meta</h3>
        <ul>
          <li
            v-for="(value, key) in parsedGrib.meta"
            :key="key">
            <strong>{{ key }}:</strong> {{ value }}
          </li>
        </ul>

        <h3>Other grib parts</h3>
        <ul>
          <li
            v-for="part in grib2Parts"
            :key="part">
            <strong>{{ part }}:</strong> <code>{{ parsedGrib[part] }}</code>
          </li>
        </ul>

        <h3>Data values</h3>
        <strong>Members:</strong> <code>parsedGrib.DataValues.length</code><br />

        <label for="member-select">Member:</label>
        <select v-model="selectedMember" id="member-select">
          <option v-for="n in numMembers" :key="n">{{ n }}</option>
        </select>
        <code>
          {{ parsedGrib.DataValues[selectedMember - 1] }}
        </code>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import L from 'leaflet'
import { LMap, LControlScale, LControlLayers, LTileLayer } from 'vue2-leaflet'
import GRIB2CLASS from 'grib2class'
import { mapGetters, mapActions } from 'vuex'
import JpxImage from '@/api/jpeg2000/jpx.min.js'

// Default leaflet icon settings
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  name: 'Grib2ClassViewer',
  components: {
    LMap,
    LControlScale,
    LControlLayers,
    LTileLayer
  },
  mounted() {
    this.getGrib(this.selectedGribFilename)
  },
  data () {
    return {
      selectedGrib2FileIndex: 0,
      selectedMember: 1,
      grib2Files: [
        'CMC_hrdps_west_TMP_ISBL_0750_ps2.5km_2020040106_P000-00.grib2',
        'CMC_glb_TMP_TGL_2_latlon.15x.15_2020060300_P000.grib2'
      ],
      grib2Reader: {},
      grib2Parts: [/*'ParameterNameAndUnit',*/ /*'DataTitles',*/ /*'DataValues',*/ 'DataAllocated', 'LengthOfMessage', 'IdentificationOfCentre', 'IdentificationOfSubCentre', 'Year', 'Month', 'Day', 'Hour', 'Minute', 'Second', 'ForecastTimeInDefinedUnits', 'ForecastConvertedTime', 'TypeOfData', 'TypeOfProjection', 'Nx', 'Ny', 'Dx', 'Dy'],
      osmAttribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      stamenAttribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      osmUrl: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      osmWeatherUrl: 'http://osm.weather.gc.ca/osm/{z}/{x}/{y}.png',
      stamenTonerUrl: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png',
      center: L.latLng(58, -102),
      zoom: 3,
      minZoom: 0
    }
  },
  computed: {
    ...mapGetters('grib', [
      'gribDataByFilename',
      'gribLoadedByFilename'
    ]),
    selectedGribFilename: function () {
      return this.grib2Files[this.selectedGrib2FileIndex]
    },
    selectedGribLoaded: function () {
      return this.gribLoadedByFilename(this.selectedGribFilename)
    },
    parsedGrib: function () {
      let options = {
        log: false,
        numMembers: 1,
        jpeg2000decoder: this.jpeg2000decoder
      }
      let grib2Reader = new GRIB2CLASS(options)
      let gribData = this.gribDataByFilename(this.selectedGribFilename)
      grib2Reader.parse(gribData)
      return grib2Reader
    },
    numMembers: function () {
      return this.parsedGrib.DataValues.length
    },
    tileLayerList: function () {
      return [{
        name: 'OSM',
        id: 'baseLayers.osm',
        attributionHtml: this.osmAttribution,
        url: this.osmUrl
      }, {
        name: 'OSM Weather',
        id: 'baseLayers.osmWeather',
        attributionHtml: this.osmAttribution,
        url: this.osmWeatherUrl
      }, {
        name: 'Stamen Toner',
        id: 'baseLayers.stamenToner',
        attributionHtml: this.stamenAttribution,
        url: this.stamenTonerUrl
      }]
    }
  },
  methods: {
    ...mapActions('grib', [
      'getGrib'
    ]),
    changeGrib: function () {
      this.getGrib(this.selectedGribFilename)
    },
    jpeg2000decoder: function (imageBytes) {
      var jpeg2000 = new JpxImage()
      jpeg2000.parse(imageBytes)
      return jpeg2000.tiles[0].items
      // return null
    }
  }
}
</script>

<style>
@import '~leaflet/dist/leaflet.css';

#map-grib2class {
  height: 300px;
  z-index: 0;
}
</style>
