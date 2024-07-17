<template>
  <v-app style="background: yellow;">
    <v-main style="background: coral;">
      <v-container>
        <v-btn color="primary">Hello, Vuetify!</v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { inject, onMounted } from 'vue'

export default {
  name: 'AdminApp',
  setup() {
    const showHeaderAndFooter = inject('showHeaderAndFooter')

    onMounted(() => {
      showHeaderAndFooter.value = false
    })

    return {}
  },
}
</script>
