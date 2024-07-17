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
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import { inject, onMounted } from 'vue'

export default {
  name: 'AdminApp',
  data() {
    return {
      drawer: true,
      isPermanent: true,
    }
  },
  watch: {
    $route() {
      if (this.$vuetify.breakpoint.mdAndDown) {
        this.drawer = false
      }
    }
  },
  setup() {
    const showHeaderAndFooter = inject('showHeaderAndFooter')

    onMounted(() => {
      showHeaderAndFooter.value = false
    })

    return {}
  },
}
</script>

<!-- <style>
@import '../../node_modules/@mdi/font/css/materialdesignicons.css'
</style> -->
