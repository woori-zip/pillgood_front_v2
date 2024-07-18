<template>
  <button class="back-to-top" @click="scrollToTop">
    <i class="fas fa-arrow-up"></i>
  </button>
</template>

<script>
export default {
  name: 'BackToTop',
  methods: {
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
};
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 30px; /* 푸터 위에 고정되는 위치 */
  right: 30px; /* 원하는 위치에 따라 조절 */
  z-index: 1000; /* 다른 요소들 위에 배치되도록 충분히 높은 값 설정 */
  background-color: #B4D9A9; /* 배경 색상 */
  border: 0; /* 테두리 색상 */
  border-radius: 50%; /* 둥근 버튼 */
  width: 50px; /* 버튼 크기 */
  height: 50px; /* 버튼 크기 */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer; /* 마우스 포인터를 손가락 모양으로 */
}
.back-to-top i {
  color: #fff; /* 아이콘 색상 */
}
.back-to-top:hover {
  background-color: #A1C4A6; /* 호버 시 배경 색상 */
  opacity: 0.8; /* 호버 시 불투명도 */
}
</style>