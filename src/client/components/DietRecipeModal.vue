<template lang="pug">
  common-modal.diet-recipe-modal(
    v-model="isOpen"
    :title="title"
    :loading="loading"
    :headerColor="headerColor"
    :readonly="readonly"
    :with-remove="localItem && !!localItem.id"
    :content-class="contentClass"
    @cancel="cancel()"
    @confirm="confirm()"
    @remove="remove()"
  )
    template(v-if="localItem")
      v-row
        v-col
          .subtitle-1 {{ $t('components.dietRecipeModal.general') }}
          v-form.diet-recipe-modal__form(
            ref="form"
            @submit.prevent="confirm()"
          )
            .red--text.mb-4(v-if="serverErrorType")
              | {{ $t(`components.dietRecipeModal.errors.server.${serverErrorType}`) }}
            v-text-field(
              v-model="localItem.name"
              :label="$t('components.dietRecipeModal.form.name')"
              :rules="rules.name"
              :readonly="readonly"
              name="name"
            )
            v-text-field(
              v-model="localItem.description"
              :label="$t('components.dietRecipeModal.form.description')"
              :readonly="readonly"
              name="description"
            )
            .diet-recipe-modal__form__serving
              v-text-field(
                v-model="localItem.serving.value"
                :label="$t('components.dietRecipeModal.form.serving.value')"
                :readonly="readonly"
                name="servingValue"
              )
              .diet-recipe-modal__form__serving__unit
                v-select(
                  v-model="localItem.serving.unit"
                  :items="units"
                  :label="$t('components.dietRecipeModal.form.serving.unit')"
                  :readonly="readonly"
                  name="servingUnit"
                )
            v-btn.d-none(
              v-if="!readonly"
              type="submit"
            )

      v-row
        v-col(v-if="!readonly && !$vuetify.breakpoint.xs")
          v-btn.mr-4.green.lighten-2.white--text(
            small
            fab
            @click="openSelectModal()"
          )
            v-icon {{ $theme.icons.mdiPlus }}
          v-btn.mr-4.red.lighten-2.white--text(
            small
            fab
            @click="onRemoveClick()"
          )
            v-icon {{ $theme.icons.mdiPlaylistRemove }}
        v-col
          diet-table-filters(v-model="searchString")

      v-row
        v-col
          diet-table.diet-recipe-modal__ingredients(
            v-model="tableSelection"
            :search-string="searchString"
            :items="ingredients"
            with-amount
            without-serving
            :readonly="readonly"
            :selectable="isInRemoveMode"
            :single-select="!isInRemoveMode"
            @item:change="onIngredientAmountChange($event)"
          )
          v-divider
      v-row
        v-col.diet-recipe-modal__summary
          .subtitle-1 {{ $t('components.dietRecipeModal.summary') }}
          diet-nutrient-summary-chart(
            v-if="!isNutrientSummaryEmpty"
            :summary="nutrientSummary"
          )
          .text-center.mt-4(v-else) {{ $t('components.dietRecipeModal.noIngredients') }}

    diet-select-modal(
      v-model="isSelectModalOpen"
      :loading="loading"
      :items="localFoods"
      :selected-items="selectedItems"
      :title="$t('components.dietRecipeModal.ingredientSelector')"
      content-class="diet-recipe-modal__ingredient-selector"
      @cancel="onSelectModalCancel()"
      @confirm="onSelectModalConfirm($event)"
    )

    v-speed-dial(
      v-if="!readonly && $vuetify.breakpoint.xs"
      v-model="isFabActive"
      bottom
      right
      fixed
    )
      template(v-slot:activator)
        v-btn.diet-recipe-modal__fab.primary(
          v-model="isFabActive"
          fab
          large
        )
          v-icon(v-if="isFabActive") {{ $theme.icons.mdiClose }}
          v-icon(v-else) {{ $theme.icons.mdiDotsVertical }}
      v-btn.diet-recipe-modal__fab__ingredients.green.lighten-2.white--text(
        v-if="$vuetify.breakpoint.xs"
        fab
        @click="openSelectModal()"
      )
        v-icon {{ $theme.icons.mdiPlus }}
      v-btn.diet-recipe-modal__fab__remove.red.lighten-2.white--text(
        fab
        @click="onRemoveClick()"
      )
        v-icon {{ $theme.icons.mdiPlaylistRemove }}
</template>

<script>
import Food from '../models/food';
import Recipe from '../models/recipe';
import DietItem from '../models/diet-item';

import CommonModal from './CommonModal';
import DietTable from './DietTable';
import DietTableFilters from './DietTableFilters';
import DietSelectModal from './DietSelectModal';
import DietNutrientSummaryChart from './DietNutrientSummaryChart';

export default {
  components: {
    CommonModal,
    DietNutrientSummaryChart,
    DietTable,
    DietTableFilters,
    DietSelectModal,
  },
  props: {
    loading: Boolean,
    serverErrorType: String,
    headerColor: String,
    readonly: Boolean,
    value: Boolean,
    item: Object,
    contentClass: String,
    foods: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      isFabActive: false,
      isSelectModalOpen: false,
      onlyShowSelected: false,
      searchString: '',
      localItem: this.item ? new Recipe(this.item) : null,
      selectedItems: [],
      isInRemoveMode: false,
      tableSelection: [],
      units: Food.unitValues.map(value => ({ text: this.$tc(`common.units.${value}`, 2), value })),
      rules: {
        name: [ v => !!v || this.$t('components.dietRecipeModal.errors.name.required') ],
      },
    };
  },
  computed: {
    title () {
      const prefix = 'components.dietRecipeModal.';
      if (this.readonly) return this.$t(prefix + 'title.view');
      if (this.localItem && this.localItem.id) return this.$t(prefix + 'title.edit');
      return this.$t(prefix + 'title.new');
    },
    isOpen: {
      get () { return this.value; },
      set (newValue) { this.$emit('input', newValue); },
    },
    localFoods () {
      if (this.onlyShowSelected) {
        const selectedIds = this.ingredients.map(item => item.id);
        return [...this.foods.filter(item => selectedIds.indexOf(item.id) !== -1)];
      } else {
        return [...this.foods];
      }
    },
    ingredients: {
      get () {
        return this.localItem.ingredients.map(item => DietItem.convertFromIngredient(item));
      },
      set (newValue) {
        this.localItem.ingredients = (newValue || []).map(item => new Recipe.Ingredient(item));
      },
    },
    nutrientSummary () {
      return this.localItem && this.localItem.getNutrients();
    },
    isNutrientSummaryEmpty () {
      return Recipe.areNutrientsEmpty(this.nutrientSummary);
    },
  },
  methods: {
    cancel () {
      this.$emit('cancel');
    },
    confirm () {
      if (!this.readonly && this.$refs.form.validate()) this.$emit('confirm', this.localItem);
    },
    remove () {
      this.$emit('remove', this.localItem);
    },

    openSelectModal () {
      this.selectedItems = [...this.ingredients];
      this.isSelectModalOpen = true;
    },
    onSelectModalCancel () {
      this.isSelectModalOpen = false;
    },
    onSelectModalConfirm (selectedItems) {
      this.ingredients = selectedItems;
      this.isSelectModalOpen = false;
    },

    onRemoveClick () {
      if (this.isInRemoveMode) {
        const removeIds = this.tableSelection.map(item => item.id);
        this.ingredients = [...this.ingredients.filter(item => removeIds.indexOf(item.id) === -1)];
        this.tableSelection = [];
      }
      this.isInRemoveMode = !this.isInRemoveMode;
    },

    onIngredientAmountChange (item) {
      this.ingredients = [
        ...this.ingredients.filter(subject => subject.id !== item.id),
        item,
      ];
    },
  },
  watch: {
    'item' (newValue) { this.localItem = newValue ? new Recipe(newValue) : null; },
  },
};
</script>

<style lang="sass">
.diet-recipe-modal
  &__form
    &__serving
      display: flex

      &__unit
        max-width: 7rem
        margin-left: 1rem

.v-expansion-panel-content__wrap
  padding-right: 8px
  padding-left: 8px
</style>
