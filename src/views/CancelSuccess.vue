<template>
  <div class="main-container">
    <h2 class="text-melon">결제 취소 완료</h2>
    <div class="box-container-no-shade">
      <p>결제가 성공적으로 취소되었습니다.</p>
      <div class="btn-container">
      <button class="btn btn-green" @click="goHome">홈으로 돌아가기</button></div>
    </div>
  </div>
</template>

<script>
import '../assets/styles.css';

export default {
  methods: {
    goHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>

</style>
