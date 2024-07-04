<template>
  <header>
    <div class="header-container header-shadow">
      <header class="header-shadow">
        <div class="container">
          <div class="form-container">
            <!-- 로고 이미지 -->
            <div class="logo-container">
              <router-link to="/">
              <img src="../assets/pillgood_logo.png">&nbsp;
              <span>: 필굿</span>
              </router-link>
            </div>
            <!-- 검색창 -->
            <div class="search-container">
              <input type="search" placeholder="검색어를 입력하세요" aria-label="Search"
                class="form-control form-control-white text-bg-white search-input">
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
              <router-link to="#" class="icon-link">
                <i class="fa-solid fa-location-dot"></i>
              </router-link>
              <router-link to="#" class="icon-link">
                <i class="fa-solid fa-heart"></i>
              </router-link>
              <router-link to="/cart" class="icon-link" @click="navigateToCart">
                <i class="fa-solid fa-cart-shopping"></i>
              </router-link>
            </div>
          </div>
          <!-- 일반 사용자 카테고리 -->
          <nav class="nav-container" v-if="!isAdmin">
            <ul>
              <li><router-link to="/productlist"><i class="fa-solid fa-bars"></i>&nbsp;카테고리</router-link></li>
              <li><a href="#">신제품</a></li>
              <li><a href="#">베스트</a></li>
              <li><a href="#">필굿리포트</a></li>
            </ul>
          </nav>
          <!-- 관리자 카테고리 -->
          <nav class="nav-container" v-if="isAdmin">
            <ul>
              <li><a href="#">회원관리</a></li>
              <!-- 상품목록 페이지로 수정 예정. 목록 페이지 안 만들어서 등록 페이지 붙임. -->
              <li><a href="/admin/productlist">상품관리</a></li>
              <li><a href="#">베스트</a></li>
              <li><a href="#">필굿리포트</a></li>
            </ul>
          </nav>
        </div>
      </header>
    </div>
  </header>
</template>

<script>
import { mapState } from 'vuex';
import '../assets/layout.css';

export default {
  name: 'HeaderView',
  computed: {
    ...mapState('member', {
      isLoggedIn: state => state.isLoggedIn,
      isAdmin: state => state.isAdmin
    })
  },
  methods: {
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
      // isLoggedIn 상태를 확인하는 디버깅 로그를 추가
      // console.log('mapState 안 된다고!!!! :', this.isLoggedIn);
      console.log('30초마다 isLoggedIn 상태 확인:', this.isLoggedIn);
    }, 30000); // 10초마다 실행
  }
};
</script>
