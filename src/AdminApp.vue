<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" :permanent="isPermanent" class="grey lighten-4">
      <v-list dense>
        <v-list-item link to="/admin">
          <v-icon>mdi-home-outline</v-icon>
        </v-list-item>
        <v-list-item link to="/admin/members">
          <v-list-item-icon>
            <v-icon>mdi-account-group-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>회원 관리</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/admin/products">
          <v-list-item-icon>
            <v-icon>mdi-package-variant-closed</v-icon>
          </v-list-item-icon>
          <v-list-item-title>상품 관리</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/admin/surveys">
          <v-list-item-icon>
            <v-icon>mdi-text-box-edit-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>설문 관리</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/admin/notices">
          <v-list-item-icon>
            <v-icon>mdi-bulletin-board</v-icon>
          </v-list-item-icon>
          <v-list-item-title>공지사항 관리</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/admin/reviews">
          <v-list-item-icon>
            <v-icon>mdi-star-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>후기 관리</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/admin/inquirys">
          <v-list-item-icon>
            <v-icon>mdi-comment-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>문의 관리</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/admin/coupons">
          <v-list-item-icon>
            <v-icon>mdi-ticket-percent-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>쿠폰 관리</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>관리자 대시보드</v-toolbar-title>
      <button @click="goToUserPage">User Page</button>
    </v-app-bar>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import { ref } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'

export default {
  name: 'AdminApp',
  setup() {
    const { mdAndDown } = useDisplay()

    const drawer = ref(true)
    const isPermanent = ref(true)

    const goToUserPage = () => {
      window.location.href = '/'
    }

    return {
      drawer,
      isPermanent,
      mdAndDown,
      goToUserPage
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