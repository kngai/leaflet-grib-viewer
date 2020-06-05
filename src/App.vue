<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <h1>leaflet-grib tester</h1>
      </div>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-content>
      <grib2-class-viewer></grib2-class-viewer>
    </v-content>
  </v-app>
</template>

<script>
import Grib2ClassViewer from './components/Grib2ClassViewer';

export default {
  name: 'App',

  components: {
    Grib2ClassViewer,
  },

  data: () => ({
    //
  }),
};
</script>
