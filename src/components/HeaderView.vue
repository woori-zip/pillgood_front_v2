<template>
  <header>
    <div class="header-container header-shadow">
      <header class="header-shadow">
        <div class="container">
          <div class="form-container">
            <!-- 로고 이미지 컨테이너 -->
            <div class="logo-container">

              <!-- 메뉴 -->
              <i class="fa-solid fa-bars" @click="toggleMenu" style="font-size: 20px; color: #B4D9A9;"></i>
              <HamburgerMenu v-if="isMenuOpen" @close="toggleMenu" /> &nbsp;&nbsp;&nbsp;
              <!-- 메뉴 끝 -->

              <router-link to="/" style="display: flex; align-items: center;">
                <img src="../assets/pillgood_logo.png">&nbsp;
                <span style="white-space: nowrap;">: 필굿</span>
              </router-link>
            </div>
            <!-- 검색창 -->
            <div class="search-container">
              <input v-model="searchQuery" type="search" placeholder="검색어를 입력하세요" aria-label="Search"
                class="form-control form-control-white text-bg-white search-input">
              <i class="fa-solid fa-magnifying-glass search-icon" @click="searchProducts"></i>
            </div>

            <div class="header-right">
              <!-- 사용자 이름 -->
              <div v-if="isLoggedIn" class="user-name" style="margin-right: 5px;">
              {{ userName }} 님
              </div>
              <!-- 아이콘 -->
              <div class="icon-container">
                <button v-if="isLoggedIn" @click="navigateTo('/mypage')" class="icon-link">
                  <i class="fa-solid fa-user"></i>
                </button>
                <button v-if="isLoggedIn" @click="logoutAndNavigate" class="icon-link">
                  <i class="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
                <button v-else @click="navigateTo('/login')" class="icon-link">
                  <i class="fa-solid fa-user"></i>
                </button>
                <button @click="navigateTo('/cart')" class="icon-link">
                  <i class="fa-solid fa-cart-shopping"></i>
                </button>
                <button @click="navigateTo('/noticelist')" class="icon-link">
                  <i class="fa-solid fa-bullhorn"></i>
                </button>
                <button @click="goToAdminPage" v-if="isAdmin" class="icon-link">
                  <i class="fa-solid fa-gear"></i>
                </button>
              </div>
            </div>
          </div>

        </div>
      </header>
    </div>
  </header>
</template>

<script>
import { mapState } from 'vuex';
import '../assets/layout.css';
import HamburgerMenu from './HamburgerMenu.vue';

export default {
  name: 'HeaderView',
  components: {
    HamburgerMenu
  },
  data() {
    return {
      searchQuery: '', // searchQuery를 data에 정의
      isMenuOpen: false
    };
  },
  computed: {
    ...mapState('member', {
      isLoggedIn: state => state.isLoggedIn,
      userName: state => state.member?.name || 'Guest', // Vuex 상태에서 사용자 이름을 가져옴 || 로그인 안 되었을 시 Guest
      isAdmin: state => state.isAdmin
    })
  },
  methods: {
    logoutAndNavigate() {
      this.logout();
      this.$router.push('/');
    },
    navigateTo(path) {
      this.$router.push(path);
    },
    logout() {
      this.$store.dispatch('member/logout');
      this.$router.push('/');
    },
    navigateToCart() {
      if (this.isLoggedIn) {
        this.$router.push('/cart');
      } else {
        this.$router.push('/login');
      }
    },
    searchProducts() {
      if (this.searchQuery.trim()) {
        this.$router.push({ name: 'ProductList', query: { search: this.searchQuery.trim() } });
      }
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    goToAdminPage() {
      window.location.href = '/admin';
    }
  },
  watch: {
    isLoggedIn(newVal) {
      console.log('로그인 상태 변경:', newVal);
    }
  },
  created() {
    // 주기적으로 isLoggedIn 상태 확인
    setInterval(() => {
      console.log('30초마다 isLoggedIn 상태 확인:', this.isLoggedIn);
    }, 30000); // 30초마다 실행
  }
};
</script>
