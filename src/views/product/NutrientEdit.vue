<template>
  <div class="main-container">

    <h2 class="text-melon">영양제 효능 관계</h2>
    <button class="small-btn" @click="toggleAddForm('efficiency')">추가하기</button>
    <div>
      <label for="filterNutrientEfficiency">영양제 필터:</label>
      <select v-model="filterNutrientEfficiency">
        <option value="">전체</option>
        <option v-for="nutrient in nutrients" :key="nutrient.nutrientId" :value="nutrient.nutrientId">
          {{ nutrient.nutrientName }}
        </option>
      </select>
      <label for="filterEfficiency">효능 필터:</label>
      <select v-model="filterEfficiency">
        <option value="">전체</option>
        <option v-for="efficiency in efficiencies" :key="efficiency.efficiencyId" :value="efficiency.efficiencyId">
          {{ efficiency.efficiencyName }}
        </option>
      </select>
    </div>
    <div class="scrollable-table">
      <table class="scroll-table">
        <thead>
          <tr>
            <th>영양제</th>
            <th>효능</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="showAddForm.efficiency">
            <td>
              <select v-model="newNutrientEfficiency.nutrientId" required>
                <option v-for="nutrient in nutrients" :key="nutrient.nutrientId" :value="nutrient.nutrientId">
                  {{ nutrient.nutrientName }}
                </option>
              </select>
            </td>
            <td>
              <select v-model="newNutrientEfficiency.efficiencyId" required>
                <option v-for="efficiency in efficiencies" :key="efficiency.efficiencyId" :value="efficiency.efficiencyId">
                  {{ efficiency.efficiencyName }}
                </option>
              </select>
            </td>
            <td>
              <button class="small-btn" @click="addNutrientEfficiency">저장</button>
              <button class="small-btn" @click="cancelAddForm('efficiency')">취소</button>
            </td>
          </tr>
          <tr v-if="errorMessage.efficiency">
            <td colspan="3" class="error">{{ errorMessage.efficiency }}</td>
          </tr>
          <tr v-for="ne in filteredNutrientEfficiencies" :key="ne.nutrientEfficiencyId">
            <td>{{ getNutrientName(ne.nutrientId) }}</td>
            <td>{{ getEfficiencyName(ne.efficiencyId) }}</td>
            <td>
              <button class="small-btn" @click="deleteNutrientEfficiency(ne.nutrientEfficiencyId)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="text-melon">영양제 부족 관계</h2>
    <button class="small-btn" @click="toggleAddForm('deficiency')">추가하기</button>
    <div>
      <label for="filterNutrientDeficiency">영양제 필터:</label>
      <select v-model="filterNutrientDeficiency">
        <option value="">전체</option>
        <option v-for="nutrient in nutrients" :key="nutrient.nutrientId" :value="nutrient.nutrientId">
          {{ nutrient.nutrientName }}
        </option>
      </select>
      <label for="filterDeficiency">부족 필터:</label>
      <select v-model="filterDeficiency">
        <option value="">전체</option>
        <option v-for="deficiency in deficiencies" :key="deficiency.deficiencyId" :value="deficiency.deficiencyId">
          {{ deficiency.deficiencyName }}
        </option>
      </select>
    </div>
    <div class="scrollable-table">
      <table class="scroll-table">
        <thead>
          <tr>
            <th>영양제</th>
            <th>부족</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="showAddForm.deficiency">
            <td>
              <select v-model="newDeficiencyNutrient.nutrientId" required>
                <option v-for="nutrient in nutrients" :key="nutrient.nutrientId" :value="nutrient.nutrientId">
                  {{ nutrient.nutrientName }}
                </option>
              </select>
            </td>
            <td>
              <select v-model="newDeficiencyNutrient.deficiencyId" required>
                <option v-for="deficiency in deficiencies" :key="deficiency.deficiencyId" :value="deficiency.deficiencyId">
                  {{ deficiency.deficiencyName }}
                </option>
              </select>
            </td>
            <td>
              <button class="small-btn" @click="addDeficiencyNutrient">저장</button>
              <button class="small-btn" @click="cancelAddForm('deficiency')">취소</button>
            </td>
          </tr>
          <tr v-if="errorMessage.deficiency">
            <td colspan="3" class="error">{{ errorMessage.deficiency }}</td>
          </tr>
          <tr v-for="dn in filteredDeficiencyNutrients" :key="dn.deficiencyNutrientId">
            <td>{{ getNutrientName(dn.nutrientId) }}</td>
            <td>{{ getDeficiencyName(dn.deficiencyId) }}</td>
            <td>
              <button class="small-btn" @click="deleteDeficiencyNutrient(dn.deficiencyNutrientId)">삭제</button>
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
  data() {
    return {
      showAddForm: {
        efficiency: false,
        deficiency: false
      },
      newNutrientEfficiency: {
        nutrientId: '',
        efficiencyId: ''
      },
      newDeficiencyNutrient: {
        nutrientId: '',
        deficiencyId: ''
      },
      filterNutrientEfficiency: '',
      filterEfficiency: '',
      filterNutrientDeficiency: '',
      filterDeficiency: '',
      errorMessage: {
        efficiency: '',
        deficiency: ''
      }
    };
  },
  computed: {
    ...mapGetters('nutrient', ['nutrients', 'nutrientEfficiencies']),
    ...mapGetters('efficiency', ['efficiencies']),
    ...mapGetters('deficiency', ['deficiencyNutrients', 'deficiencies']),
    sortedNutrientEfficiencies() {
      return [...this.nutrientEfficiencies].sort((a, b) => {
        const nutrientA = this.getNutrientName(a.nutrientId);
        const nutrientB = this.getNutrientName(b.nutrientId);
        const efficiencyA = this.getEfficiencyName(a.efficiencyId);
        const efficiencyB = this.getEfficiencyName(b.efficiencyId);
        return nutrientA.localeCompare(nutrientB) || efficiencyA.localeCompare(efficiencyB);
      });
    },
    sortedDeficiencyNutrients() {
      return [...this.deficiencyNutrients].sort((a, b) => {
        const nutrientA = this.getNutrientName(a.nutrientId);
        const nutrientB = this.getNutrientName(b.nutrientId);
        const deficiencyA = this.getDeficiencyName(a.deficiencyId);
        const deficiencyB = this.getDeficiencyName(b.deficiencyId);
        return nutrientA.localeCompare(nutrientB) || deficiencyA.localeCompare(deficiencyB);
      });
    },
    filteredNutrientEfficiencies() {
      return this.sortedNutrientEfficiencies.filter(ne => {
        return (!this.filterNutrientEfficiency || ne.nutrientId === this.filterNutrientEfficiency) &&
               (!this.filterEfficiency || ne.efficiencyId === this.filterEfficiency);
      });
    },
    filteredDeficiencyNutrients() {
      return this.sortedDeficiencyNutrients.filter(dn => {
        return (!this.filterNutrientDeficiency || dn.nutrientId === this.filterNutrientDeficiency) &&
               (!this.filterDeficiency || dn.deficiencyId === this.filterDeficiency);
      });
    }
  },
  methods: {
    ...mapActions('nutrient', [
      'fetchNutrients',
      'fetchNutrientEfficiencies',
      'createNutrientEfficiency',
      'deleteNutrientEfficiency'
    ]),
    ...mapActions('efficiency', ['fetchEfficiencies']),
    ...mapActions('deficiency', [
      'fetchDeficiencies',
      'fetchDeficiencyNutrients',
      'createDeficiencyNutrient',
      'deleteDeficiencyNutrient'
    ]),
    async loadData() {
      await this.fetchNutrients();
      await this.fetchEfficiencies();
      await this.fetchDeficiencies();
      await this.fetchNutrientEfficiencies();
      await this.fetchDeficiencyNutrients();
    },
    async addNutrientEfficiency() {
      const existing = this.nutrientEfficiencies.find(
        ne =>
          ne.nutrientId === this.newNutrientEfficiency.nutrientId &&
          ne.efficiencyId === this.newNutrientEfficiency.efficiencyId
      );

      if (existing) {
        this.errorMessage.efficiency = '이미 존재하는 관계입니다.';
        return;
      }

      try {
        await this.createNutrientEfficiency(this.newNutrientEfficiency);
        this.newNutrientEfficiency.nutrientId = '';
        this.newNutrientEfficiency.efficiencyId = '';
        this.showAddForm.efficiency = false;
        this.errorMessage.efficiency = '';
        await this.loadData();
      } catch (error) {
        console.error('Failed to create nutrient efficiency:', error);
      }
    },
    async addDeficiencyNutrient() {
      const existing = this.deficiencyNutrients.find(
        dn =>
          dn.nutrientId === this.newDeficiencyNutrient.nutrientId &&
          dn.deficiencyId === this.newDeficiencyNutrient.deficiencyId
      );

      if (existing) {
        this.errorMessage.deficiency = '이미 존재하는 관계입니다.';
        return;
      }

      try {
        await this.createDeficiencyNutrient(this.newDeficiencyNutrient);
        this.newDeficiencyNutrient.nutrientId = '';
        this.newDeficiencyNutrient.deficiencyId = '';
        this.showAddForm.deficiency = false;
        this.errorMessage.deficiency = '';
        await this.loadData();
      } catch (error) {
        console.error('Failed to create deficiency nutrient:', error);
      }
    },
    getNutrientName(id) {
      const nutrient = this.nutrients.find(n => n.nutrientId === id);
      return nutrient ? nutrient.nutrientName : 'Unknown';
    },
    getEfficiencyName(id) {
      const efficiency = this.efficiencies.find(e => e.efficiencyId === id);
      return efficiency ? efficiency.efficiencyName : 'Unknown';
    },
    getDeficiencyName(id) {
      const deficiency = this.deficiencies.find(d => d.deficiencyId === id);
      return deficiency ? deficiency.deficiencyName : 'Unknown';
    },
    async deleteNutrientEfficiency(id) {
      try {
        await this.deleteNutrientEfficiency(id);
        await this.loadData();
      } catch (error) {
        console.error('Failed to delete nutrient efficiency:', error);
      }
    },
    async deleteDeficiencyNutrient(id) {
      try {
        await this.deleteDeficiencyNutrient(id);
        await this.loadData();
      } catch (error) {
        console.error('Failed to delete deficiency nutrient:', error);
      }
    },
    toggleAddForm(type) {
      this.showAddForm[type] = !this.showAddForm[type];
    },
    cancelAddForm(type) {
      this.showAddForm[type] = false;
      this.errorMessage[type] = '';
    }
  },
  async created() {
    await this.loadData();
  }
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}
.table-container {
  margin-bottom: 20px;
}
.scrollable-table {
  max-height: 300px; /* 원하는 높이로 설정 */
  overflow-y: scroll;
  border: 1px solid grey;
}
.scroll-table {
  width: 100%;
  border-collapse: collapse;
}
.scroll-table th, .scroll-table td {
  border: 1px solid #ddd;
  padding: 8px;
}
.scroll-table th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
  z-index: 1000; /* 필요시 조정 */
}
.small-btn {
  padding: 5px 10px;
  font-size: 12px;
}
.error {
  color: red;
  font-weight: bold;
}
</style>
