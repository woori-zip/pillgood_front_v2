<template>
  <div id="app">
    <HeaderView v-if="showHeaderAndFooter" />
    <main>
      <router-view />
    </main>
    <FooterView v-if="showHeaderAndFooter" />
  </div>
</template>

<script>
import { provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import HeaderView from './components/HeaderView.vue'
import FooterView from './components/FooterView.vue'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'App',
  components: {
    HeaderView,
    FooterView,
  },
  setup() {
    const route = useRoute()
    const showHeaderAndFooter = ref(true)

    provide('showHeaderAndFooter', showHeaderAndFooter)

    const updateHeaderAndFooterVisibility = () => {
      if (route.path.startsWith('/admin')) {
        showHeaderAndFooter.value = false
      } else {
        showHeaderAndFooter.value = true
      }
    }

    // Watch for route changes
    watch(route, updateHeaderAndFooterVisibility, { immediate: true })

    return { showHeaderAndFooter }
  },
  computed: {
    ...mapState('member', {
      isLoggedIn: (state) => state.isLoggedIn,
      memberId: (state) => state.memberId,
      member: (state) => state.member,
    }),
  },
  methods: {
    ...mapActions('member', ['checkLoginStatus', 'fetchMemberInfo']),
  },
  async created() {
    try {
      await this.checkLoginStatus()
      if (this.isLoggedIn && this.memberId) {
        await this.fetchMemberInfo(this.memberId)
      } else {
        console.log('로그인되지 않았거나 memberId가 없음')
      }
    } catch (error) {
      console.error('checkLoginStatus 에러:', error)
    }

    // 주기적으로 세션 상태 확인
    setInterval(async () => {
      try {
        await this.checkLoginStatus()
        if (this.isLoggedIn) {
          await this.fetchMemberInfo(this.memberId)
        } else {
          console.log('로그인된 사용자가 없음')
        }
      } catch (error) {
        console.error('세션 상태 확인 중 에러:', error)
      }
    }, 600000) // 10분마다 실행
  },
  mounted() {
    // 카카오 SDK 로드 및 초기화
    /* global Kakao */ // Kakao를 전역 변수로 선언
    const kakaoScript = document.createElement('script')
    kakaoScript.src = 'https://developers.kakao.com/sdk/js/kakao.js'
    kakaoScript.onload = () => {
      Kakao.init('03f074279f45f35b6bed2cfbcc42ec4d') // 카카오 개발자 콘솔에서 발급받은 JavaScript 키
      console.log('Kakao SDK initialized')
    }
    document.head.appendChild(kakaoScript)
  },
  watch: {
    isLoggedIn(newVal) {
      console.log('A 로그인 상태 변경:', newVal) // 상태 변경 확인
    },
  },
}
</script>

<!-- <style>
@import './assets/layout.css'

html,
body {
  margin: 0;
  padding: 0;
  height: 100%
}

#app {
  display: flex;
  flex-direction: column;
}
</style> -->
