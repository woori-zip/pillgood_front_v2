<template>
  <div class="main-container">
    <h1 class="text-melon">성분 관리</h1>
    <div>
      <h2>성분 효능 부족 리스트</h2>
      <table class="line-table">
        <thead>
          <tr>
            <th>성분</th>
            <th>효능</th>
            <th>부족</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <!-- <tr>
            // 성능 선택 input 태그
            // 효능 선택 input 태그
            // 부족 선택 input 태그
          </tr> -->

          <tr v-for="ne in transformedData" :key="ne.id">
            <td>{{ ne.nutrientName }}</td>
            <td>{{ ne.efficiencyName }}</td>
            <td>{{ ne.deficiencyName }}</td>
            <td>
              <button @click="handleUpdateNutrientEfficiency(ne)">수정</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'NutrientEdit',
  data() {
    return {};
  },
  computed: {
    ...mapGetters('nutrient', ['nutrientEfficiencies', 'nutrients']),
    ...mapGetters('efficiency', ['efficiencies']),
    ...mapGetters('deficiency', ['deficiencyNutrients', 'deficiencies']),
    transformedData() {
      if (!this.nutrientEfficiencies || !this.nutrients || !this.efficiencies || !this.deficiencyNutrients || !this.deficiencies) {
        return [];
      }

      const transformed = [];

      this.nutrientEfficiencies.forEach(ne => {
        const nutrient = this.nutrients.find(n => n.nutrientId === ne.nutrientId);
        const efficiency = this.efficiencies.find(e => e.efficiencyId === ne.efficiencyId);

        const relatedDeficiencies = this.deficiencyNutrients.filter(dn => dn.nutrientId === ne.nutrientId);

        if (relatedDeficiencies.length > 0) {
          relatedDeficiencies.forEach(dn => {
            const deficiency = this.deficiencies.find(d => d.deficiencyId === dn.deficiencyId);
            transformed.push({
              id: `${ne.nutrientEfficiencyId}-${dn.deficiencyNutrientId}`,
              nutrientEfficiencyId: ne.nutrientEfficiencyId, // 실제 nutrientEfficiencyId 저장
              nutrientName: nutrient ? nutrient.nutrientName : 'Unknown',
              efficiencyName: efficiency ? efficiency.efficiencyName : 'Unknown',
              deficiencyName: deficiency ? deficiency.deficiencyName : 'Unknown'
            });
          });
        } else {
          transformed.push({
            id: ne.nutrientEfficiencyId,
            nutrientEfficiencyId: ne.nutrientEfficiencyId, // 실제 nutrientEfficiencyId 저장
            nutrientName: nutrient ? nutrient.nutrientName : 'Unknown',
            efficiencyName: efficiency ? efficiency.efficiencyName : 'Unknown',
            deficiencyName: '해당없음'
          });
        }
      });

      return transformed;
    }
  },
  methods: {
    ...mapActions('nutrient', ['fetchNutrientEfficiencies', 'fetchNutrients']),
    ...mapActions('efficiency', ['fetchEfficiencies']),
    ...mapActions('deficiency', ['fetchDeficiencies', 'fetchDeficiencyNutrients']),
    async loadData() {
      await this.fetchNutrientEfficiencies();
      await this.fetchNutrients();
      await this.fetchEfficiencies();
      await this.fetchDeficiencies();
      await this.fetchDeficiencyNutrients();
    },
    // handleUpdateNutrientEfficiency(ne) {
    //   // 수정 로직 구현
    // }
  },
  async created() {
    await this.loadData();
    // 데이터가 제대로 로드되었는지 콘솔 로그 확인
    console.log('Nutrient Efficiencies:', this.nutrientEfficiencies);
    console.log('Nutrients:', this.nutrients);
    console.log('Efficiencies:', this.efficiencies);
    console.log('Deficiencies:', this.deficiencies);
    console.log('Deficiency Nutrients:', this.deficiencyNutrients);
    console.log('Transformed Data:', this.transformedData);
  }
};
</script>
