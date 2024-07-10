<template>
  <div id="app">
    <HeaderView />
    <main>
    <router-view />
    </main>
    <FooterView />
  </div>
</template>


<script>
import HeaderView from './components/HeaderView.vue';
import FooterView from './components/FooterView.vue';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'App',
  components: {
    HeaderView,
    FooterView
  },
  computed: {
    ...mapState('member', {
      isLoggedIn: state => state.isLoggedIn,
      memberId: state => state.memberId,
      member: state => state.member
    })
  },
  methods: {
    ...mapActions('member', ['checkLoginStatus', 'fetchMemberInfo']),
  },
  async created() {
    try {
      // console.log('App created lifecycle hook');
      await this.checkLoginStatus();
      // console.log('checkLoginStatus 처리 완료');
      // console.log("state의 memberId: " + this.memberId); // 상태 업데이트 확인
      if (this.isLoggedIn && this.memberId) {
        // console.log('로그인됨, 사용자 정보 가져오는 중');
        await this.fetchMemberInfo(this.memberId);
        // console.log('fetchMemberInfo 처리 완료'); // fetchMemberInfo 완료 확인
      } else {
        console.log('로그인되지 않았거나 memberId가 없음');
      }
    } catch (error) {
      console.error('checkLoginStatus 에러:', error);
    }

    // 주기적으로 세션 상태 확인
    setInterval(async () => {
      try {
        console.log('세션 상태 확인 중...');
        await this.checkLoginStatus();
        if (this.isLoggedIn) {
          // console.log('60초마다 세션 테스트 중');
          await this.fetchMemberInfo(this.memberId);
          // const member = this.member;
          // if (member) {
          //   console.log(`현재 로그인된 사용자 ID: ${this.memberId}`);
          // } else {
          //   console.log(`로그인한 사용자가 없습니다.`);
          // }
        } else {
          console.log('로그인된 사용자가 없음');
        }
      } catch (error) {
        console.error('세션 상태 확인 중 에러:', error);
      }
    }, 60000); // 60초마다 실행
  },
  watch: {
    isLoggedIn(newVal) {
      console.log('A 로그인 상태 변경:', newVal); // 상태 변경 확인
    }
  }
};
</script>

<style>
@import './assets/layout.css';

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  display: flex;
  flex-direction: column;
}
</style>