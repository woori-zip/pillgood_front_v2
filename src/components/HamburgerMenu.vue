<template>
  <div class="overlay" @click.self="closeMenu">
    <div class="menu" @click.stop>
      <div class="logo-container">
        <router-link to="/">
          <img src="../assets/pillgood_logo.png">&nbsp;
        </router-link>
      </div>

      <ul>
        <li><a href="/mypage">마이페이지</a></li>
        <li><a href="/productlist?sort=latest" @click="navigateTo($event, { name: 'ProductList', query: { sort: 'latest' } })">🚀신상품</a></li>
        <li><a href="/productlist?sort=topSelling" @click="navigateTo($event, { name: 'ProductList', query: { sort: 'topSelling' } })">🔥베스트</a></li>
        <li><a href="/productlist">스토어</a></li>
        <li><a href="/productlist?tab=nutrients" @click="navigateTo($event, { name: 'ProductList', query: { tab: 'nutrients' } })">성분별</a></li>
        <li><a href="/productlist?tab=deficiencies" @click="navigateTo($event, { name: 'ProductList', query: { tab: 'deficiencies' } })">고민별</a></li>
        <li><a href="/productlist?tab=targets" @click="navigateTo($event, { name: 'ProductList', query: { tab: 'targets' } })">대상별</a></li>
        <li><a href="/noticelist">공지사항</a></li>
        <li><a href="/inquiries">문의하기</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HamburgerMenu',
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    closeMenu() {
      this.isMenuOpen = false;
    },
    navigateTo(event, location) {
      this.$router.push(location);
      this.closeMenu();
    }
  }
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-start; /* 왼쪽 정렬 */
}
.menu {
  background-color: white;
  width: 250px;
  height: 100%;
  box-shadow: 2px 0 5px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.menu ul {
  padding: 0;
  margin: 0;
  list-style-type: none; /* 점 제거 */
}
.menu li {
  padding: 10px 0;
}
</style>
