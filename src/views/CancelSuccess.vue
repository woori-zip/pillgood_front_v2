<template>
  <div class="main-container">
    <h2 class="text-melon">결제 취소 완료</h2>
    <div class="box-container-no-shade">
      <p>결제가 성공적으로 취소되었습니다.</p>
      <button class="btn btn-green" @click="goHome">홈으로 돌아가기</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.main-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #5cb85c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  text-align: center;
}

.btn:hover {
  background-color: #4cae4c;
}
</style>
