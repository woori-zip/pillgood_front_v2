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
            <!-- 사용자 이름 -->
            <div v-if="isLoggedIn" class="user-name">
             {{ userName }} 님
            </div>
            <!-- 아이콘 -->
            <div class="icon-container">
              <router-link v-if="isLoggedIn" to="/mypage" class="icon-link">
                <i class="fa-solid fa-user"></i>
              </router-link>
              <button v-if="isLoggedIn" @click="logout" class="icon-link">
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
              <router-link v-else to="/login" class="icon-link">
                <i class="fa-solid fa-user"></i>
              </router-link>
              <router-link to="/cart" class="icon-link" @click="navigateToCart">
                <i class="fa-solid fa-cart-shopping"></i>
              </router-link>
              <router-link to="/noticelist" class="icon-link">
                <i class="fa-solid fa-bullhorn"></i>
              </router-link>
              <router-link to="/admin" v-if="isAdmin">
                <button>Admin Page</button>
              </router-link>
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
