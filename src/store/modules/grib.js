/*
Vuex module to retrieve a single item json of a collectionId from a pygeoapi instance
*/

import axios from 'axios'

const GRIB_HOST = '/static'

// initial state
const state = {
  // normalize data; filename acts as id
  gribData: {}, // gribData[filename] = data
  gribLoaded: {}, // gribLoaded[filename] = boolean
  gribList: [] // list of filenames
}

// getters
const getters = {
  gribData: (state) => {
    return state.gribData
  },

  gribDataByFilename: (state, getters) => (filename) => {
    if (Object.prototype.hasOwnProperty.call(state.gribData, filename)) {
      return getters.gribData[filename]
    } else {
      return null
    }
  },
  gribLoadedByFilename: (state) => (filename) => {
    if (Object.prototype.hasOwnProperty.call(state.gribLoaded, filename)) {
      return state.gribLoaded[filename]
    } else {
      return false
    }
  }
}

// mutations
const mutations = {
  setGribData(state, {data, filename}) {
    if (!Object.prototype.hasOwnProperty.call(state.gribData, filename)) {
      // set
      state.gribData = {...state.gribData, [filename]: null}
    }
    state.gribData[filename] = data
    state.gribList.push(filename)
  },
  setGribLoaded(state, {status, filename}) {
    if (!Object.prototype.hasOwnProperty.call(state.gribData, filename)) {
      state.gribLoaded = {...state.gribLoaded, [filename]: false}
    }
    state.gribLoaded[filename] = status
  }
}

// actions
const actions = {
  getGrib({state, commit}, gribFilename) {
    if (state.gribLoaded[gribFilename]) {
      // do nothing
    } else {
      commit('setGribLoaded', { status: false, filename: gribFilename })
      const requestUrl = GRIB_HOST + '/' + gribFilename
      axios.get(requestUrl, { responseType: 'arraybuffer' })
        .then((res) => {
          let rawData = res.data
          let bufferData = Buffer.from(rawData, 'binary')
          commit('setGribData', { data: bufferData, filename: gribFilename })
          commit('setGribLoaded', { status: true, filename: gribFilename })
        })
        .catch((error) => {
          console.error(error)
          commit('setGribLoaded', { status: false, filename: gribFilename })
        })
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
