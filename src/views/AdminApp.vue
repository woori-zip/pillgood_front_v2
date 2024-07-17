<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" :permanent="isPermanent" class="grey lighten-4">
      <v-list dense>
        <v-list-item link to="/admin/members">
          <v-list-item-icon>
            <v-icon>mdi-account-group</v-icon>
          </v-list-item-icon>
          <v-list-item-title>회원 관리</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/admin/products">
          <v-list-item-icon>
            <v-icon>mdi-package-variant-closed</v-icon>
          </v-list-item-icon>
          <v-list-item-title>상품 관리</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>관리자 대시보드</v-toolbar-title>
      <router-link to="/">
        <button>User Page</button>
      </router-link>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import { inject, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs' // Vuetify 3에서 사용하는 방식

export default {
  name: 'AdminApp',
  setup() {
    const showHeaderAndFooter = inject('showHeaderAndFooter')
    const { mdAndDown } = useDisplay()

    const drawer = ref(true)
    const isPermanent = ref(true)

    onMounted(() => {
      showHeaderAndFooter.value = false
    })

    return {
      drawer,
      isPermanent,
      mdAndDown
    }
  },
  watch: {
    $route() {
      if (this.mdAndDown.value) {
        this.drawer = false
      }
    }
  }
}
</script>
