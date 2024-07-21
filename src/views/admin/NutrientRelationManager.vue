<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">영양제 효능 및 부족 관계 관리</span>
    </v-card-title>
    <v-card-text>
      <v-tabs v-model="tab" background-color="primary" dark>
        <v-tab value="NutrientEfficiency">영양제 효능</v-tab>
        <v-tab value="DeficiencyNutrient">영양제 부족</v-tab>
      </v-tabs>
      <v-tabs-window v-model="tab">
        <!-- 영양제  Section -->
        <v-tabs-window-item value="NutrientEfficiency">
          <v-card flat>
            <v-card-title>
            </v-card-title>
            <v-row>
              <v-col cols="5">
                <v-select
                  v-model="filterNutrientEfficiency"
                  :items="nutrientItems"
                  item-text="title"
                  item-value="value"
                  label="영양제 필터"
                  dense
                ></v-select>
              </v-col>
              <v-col cols="5">
                <!-- 효능 추가 -->
                <v-select
                  v-model="filterEfficiency"
                  :items="efficiencyItems"
                  item-text="title"
                  item-value="value"
                  label="효능 필터"
                  dense
                >
                  <template v-slot:item="{ item, attrs, on }">
                    <v-list-item v-bind="attrs">
                      <v-row align="center" justify="space-between" v-on="{ ...on, click: () => { filterEfficiency = item.value } }">
                        <v-col cols="9">
                          <v-list-item-title>{{ item.title }}</v-list-item-title>
                        </v-col>
                        <v-col cols="3" class="text-right">
                          <v-btn icon @click.stop="confirmDeleteEfficiency(item.value)">
                            <v-icon color="red">mdi-delete</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-list-item>
                  </template>
                  <template v-slot:append-item>
                    <v-list-item @click="toggleAddEfficiencyDialog">
                      <v-list-item-content>
                        <v-list-item-title>
                          + Add New Efficiency
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-select>
              <!-- 효능 추가 끝 -->

              </v-col>
              <v-col cols="2">
                <v-btn color="primary" @click="resetFilters">초기화</v-btn>
              </v-col>
            </v-row>
            <!-- 효능 추가 -->
            <v-dialog v-model="showAddEfficiencyDialog" max-width="600px">
              <v-card>
                <v-card-title>
                  <span class="text-h5">새 효능 추가</span>
                </v-card-title>
                <v-card-text>
                  <v-form @submit.prevent="addEfficiency">
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="newEfficiency.efficiencyName"
                          label="효능 이름"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" type="submit">저장</v-btn>
                      <v-btn color="grey" @click="toggleAddEfficiencyDialog">취소</v-btn>
                    </v-card-actions>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-dialog>
            <!-- 효능 추가 끝 -->
            
            <v-row align="center" justify="center">
              <v-col class="text-center" cols="12">
                  <v-btn color="primary" @click="toggleAddForm('efficiency')" width="50%">추가하기</v-btn>
              </v-col>
            </v-row>
            <v-data-table
              :headers="efficiencyHeaders"
              :items="filteredNutrientEfficiencies"
              class="elevation-1"
            >
              <template v-slot:[`item.nutrientId`]="{ item }">
                <span>{{ getNutrientName(item.nutrientId) }}</span>
              </template>
              <template v-slot:[`item.efficiencyId`]="{ item }">
                <span>{{ getEfficiencyName(item.efficiencyId) }}</span>
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <v-btn color="error" @click="handleDeleteNutrientEfficiency(item.nutrientEfficiencyId)">삭제</v-btn>
              </template>
            </v-data-table>
            <v-dialog v-model="showAddForm.efficiency" max-width="600px">
              <v-card>
                <v-card-title>
                  <span class="text-h5">효능 추가</span>
                </v-card-title>
                <v-card-text>
                  <v-form @submit.prevent="addNutrientEfficiency">
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-select
                          v-model="newNutrientEfficiency.nutrientId"
                          :items="nutrientItems"
                          item-text="title"
                          item-value="value"
                          label="영양제"
                          dense
                          required
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-select
                          v-model="newNutrientEfficiency.efficiencyId"
                          :items="efficiencyItems"
                          item-text="title"
                          item-value="value"
                          label="효능"
                          dense
                          required
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" type="submit">저장</v-btn>
                      <v-btn color="grey" @click="cancelAddForm('efficiency')">취소</v-btn>
                    </v-card-actions>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-dialog>
          </v-card>
        </v-tabs-window-item>

        <!-- Deficiency Nutrient Section -->
        <v-tabs-window-item value="DeficiencyNutrient">
          <v-card flat>
            <v-card-title></v-card-title>
            <v-row>
              <v-col cols="5">
                <v-select
                  v-model="filterNutrientDeficiency"
                  :items="nutrientItems"
                  item-text="title"
                  item-value="value"
                  label="영양제 필터"
                  dense
                ></v-select>
              </v-col>
              <v-col cols="5">
                <!-- 부족 select -->
                <v-select
                  v-model="filterDeficiency"
                  :items="deficiencyItems"
                  item-text="title"
                  item-value="value"
                  label="부족 필터"
                  dense
                >
                  <template v-slot:item="{ item, attrs, on }">
                    <v-list-item v-bind="attrs">
                      <v-row align="center" justify="space-between" v-on="{ ...on, click: () => { filterDeficiency = item.value } }">
                        <v-col cols="9">
                          <v-list-item-title>{{ item.title }}</v-list-item-title>
                        </v-col>
                        <v-col cols="3" class="text-right">
                          <v-btn icon @click.stop="confirmDeleteDeficiency(item.value)">
                            <v-icon color="red">mdi-delete</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-list-item>
                  </template>
                  <template v-slot:append-item>
                    <v-list-item @click="toggleAddDeficiencyDialog">
                      <v-list-item-content>
                        <v-list-item-title>
                          + Add New Deficiency
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-select>
                <!-- 부족 select 끝 -->
              </v-col>
              <v-col cols="2">
                <v-btn color="primary" @click="resetFilters2">초기화</v-btn>
              </v-col>
            </v-row>
            <v-row align="center" justify="center">
              <v-col class="text-center" cols="12">
                <v-btn color="primary" @click="toggleAddForm('deficiency')" width="50%">추가하기</v-btn>                
              </v-col>
            </v-row>
            <v-data-table
              :headers="deficiencyHeaders"
              :items="filteredDeficiencyNutrients"
              class="elevation-1"
            >
              <template v-slot:[`item.nutrientId`]="{ item }">
                <span>{{ getNutrientName(item.nutrientId) }}</span>
              </template>
              <template v-slot:[`item.deficiencyId`]="{ item }">
                <span>{{ getDeficiencyName(item.deficiencyId) }}</span>
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <v-btn color="error" @click="handleDeleteDeficiencyNutrient(item.deficiencyNutrientId)">삭제</v-btn>
              </template>
            </v-data-table>
            <!-- 영양제-부족 관계 추가 모달창 -->
            <v-dialog v-model="showAddForm.deficiency" max-width="600px">
              <v-card>
                <v-card-title>
                  <span class="text-h5">영양제-부족 관계 추가</span>
                </v-card-title>
                <v-card-text>
                  <v-form @submit.prevent="addDeficiencyNutrient">
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-select
                          v-model="newDeficiencyNutrient.nutrientId"
                          :items="nutrientItems"
                          item-text="title"
                          item-value="value"
                          label="영양제"
                          dense
                          required
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-select
                          v-model="newDeficiencyNutrient.deficiencyId"
                          :items="deficiencyItems"
                          item-text="title"
                          item-value="value"
                          label="부족"
                          dense
                          required
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" type="submit">저장</v-btn>
                      <v-btn color="grey" @click="cancelAddForm('deficiency')">취소</v-btn>
                    </v-card-actions>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-dialog>
            <!-- 영양제-부족 관계 추가 모달창 끝 -->
            <!-- 부족 추가 모달창 -->
            <v-dialog v-model="showAddDeficiencyDialog" max-width="600px">
              <v-card>
                <v-card-title>
                  <span class="text-h5">새 부족 추가</span>
                </v-card-title>
                <v-card-text>
                  <v-form @submit.prevent="addDeficiency">
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="newDeficiency.deficiencyName"
                          label="부족 이름"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" type="submit">저장</v-btn>
                      <v-btn color="grey" @click="toggleAddDeficiencyDialog">취소</v-btn>
                    </v-card-actions>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-dialog>
            <!-- 부족 추가 모달창 끝 -->
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  data() {
    return {
      tab: null,
      showAddForm: {
        efficiency: false,
        deficiency: false
      },
      // 효능 추가
      showAddEfficiencyDialog: false,
      newEfficiency: {
        efficiencyName: ''
      },
      // 효능 추가 끝
      // 부족 추가
      showAddDeficiencyDialog: false,
      newDeficiency: {
        deficiencyName: ''
      },
      // 부족 추가 끝
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
    nutrientItems() {
      return this.nutrients.map(nutrient => ({
        title: nutrient.nutrientName,
        value: nutrient.nutrientId
      }));
    },
    efficiencyItems() {
      return this.efficiencies.map(efficiency => ({
        title: efficiency.efficiencyName,
        value: efficiency.efficiencyId
      }));
    },
    deficiencyItems() {
      return this.deficiencies.map(deficiency => ({
        title: deficiency.deficiencyName,
        value: deficiency.deficiencyId
      }));
    },
    efficiencyHeaders() {
      return [
        { title: '영양제', value: 'nutrientId' },
        { title: '효능', value: 'efficiencyId' },
        { title: '관리', value: 'actions', sortable: false }
      ];
    },
    deficiencyHeaders() {
      return [
        { title: '영양제', value: 'nutrientId' },
        { title: '부족', value: 'deficiencyId' },
        { title: '관리', value: 'actions', sortable: false }
      ];
    },
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
    ...mapActions('efficiency', [
      'fetchEfficiencies', 
      'createEfficiency',
      'deleteEfficiency',
    ]),
    ...mapActions('deficiency', [
      'fetchDeficiencies',
      'fetchDeficiencyNutrients',
      'createDeficiency',
      'createDeficiencyNutrient',
      'deleteDeficiency',
      'deleteDeficiencyNutrient',
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
    async handleDeleteNutrientEfficiency(id) {
      try {
        await this.deleteNutrientEfficiency(id);
        await this.loadData();
      } catch (error) {
        console.error('Failed to delete nutrient efficiency:', error);
      }
    },
    async handleDeleteDeficiencyNutrient(id) {
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
    // 효능 추가
    toggleAddEfficiencyDialog() {
      this.showAddEfficiencyDialog = !this.showAddEfficiencyDialog;
    },
    async addEfficiency() {
      try {
        await this.createEfficiency({ efficiencyName: this.newEfficiency.efficiencyName });
        this.newEfficiency.efficiencyName = '';
        this.showAddEfficiencyDialog = false;
        await this.loadData();
      } catch (error) {
        console.error('Failed to create efficiency:', error);
      }
    },
    async confirmDeleteEfficiency(id) {
      const isAssociated = this.nutrientEfficiencies.some((ne) => ne.efficiencyId === id);
      if (isAssociated) {
        alert('This efficiency cannot be deleted as it is associated with existing nutrient-efficiency relationships.');
      } else {
        if (confirm('Are you sure you want to delete this efficiency?')) {
          await this.handleDeleteEfficiency(id);
        }
      }
    },
    async handleDeleteEfficiency(id) {
      try {
        await this.deleteEfficiency(id);
        await this.loadData();
      } catch (error) {
        console.error('Failed to delete efficiency:', error);
      }
    },
    // 효능 추가 끝
    // 부족 추가
    toggleAddDeficiencyDialog() {
      this.showAddDeficiencyDialog = !this.showAddDeficiencyDialog;
    },
    async addDeficiency() {
      try {
        await this.createDeficiency({ deficiencyName: this.newDeficiency.deficiencyName });
        this.newDeficiency.deficiencyName = '';
        this.showAddDeficiencyDialog = false;
        await this.loadData();
      } catch (error) {
        console.error('Failed to create deficiency:', error);
      }
    },
    async confirmDeleteDeficiency(id) {
      const isAssociated = this.deficiencyNutrients.some((dn) => dn.deficiencyId === id);
      if (isAssociated) {
        alert('This deficiency cannot be deleted as it is associated with existing nutrient-deficiency relationships.');
      } else {
        if (confirm('Are you sure you want to delete this deficiency?')) {
          await this.handleDeleteDeficiency(id);
        }
      }
    },
    async handleDeleteDeficiency(id) {
      try {
        await this.deleteDeficiency(id);
        await this.loadData();
      } catch (error) {
        console.error('Failed to delete deficiency:', error);
      }
    },
    // 부족 추가 끝
    cancelAddForm(type) {
      this.showAddForm[type] = false;
      this.errorMessage[type] = '';
    },
    resetFilters() {
      this.filterNutrientEfficiency = '';
      this.filterEfficiency = '';
    },
    resetFilters2() {
      this.filterNutrientDeficiency = '';
      this.filterDeficiency = '';
    }
  },
  async created() {
    await this.loadData();
  }
};
</script>

