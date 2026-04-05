<template>
  <form
    class="dot-form"
    :class="[`dot-form--${layout}`]"
    @submit.prevent="handleSubmit"
  >
    <div class="dot-form__content">
      <div
        v-for="field in fields"
        :key="field.key"
        class="dot-form__item"
        :class="{
          'dot-form__item--error': errors[field.key],
        }"
      >
        <label
          class="dot-form__label"
          :style="{ width: labelWidth }"
        >
          {{ field.label }}
          <span v-if="isRequired(field)" class="dot-form__required">*</span>
        </label>
        <div class="dot-form__control">
          <!-- 输入框 -->
          <input
            v-if="field.type === 'input'"
            v-model="formData[field.key]"
            class="dot-form__input"
            :placeholder="field.placeholder || `请输入${field.label}`"
            @blur="validateField(field)"
          />

          <!-- 文本域 -->
          <textarea
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.key]"
            class="dot-form__textarea"
            :placeholder="field.placeholder || `请输入${field.label}`"
            @blur="validateField(field)"
          />

          <!-- 下拉选择 -->
          <select
            v-else-if="field.type === 'select'"
            v-model="formData[field.key]"
            class="dot-form__select"
            @change="validateField(field)"
          >
            <option value="">请选择</option>
            <option
              v-for="opt in field.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>

          <!-- 单选框 -->
          <div v-else-if="field.type === 'radio'" class="dot-form__radio-group">
            <label
              v-for="opt in field.options"
              :key="opt.value"
              class="dot-form__radio"
            >
              <input
                v-model="formData[field.key]"
                type="radio"
                :value="opt.value"
                @change="validateField(field)"
              />
              {{ opt.label }}
            </label>
          </div>

          <!-- 复选框 -->
          <div v-else-if="field.type === 'checkbox'" class="dot-form__checkbox-group">
            <label
              v-for="opt in field.options"
              :key="opt.value"
              class="dot-form__checkbox"
            >
              <input
                v-model="formData[field.key]"
                type="checkbox"
                :value="opt.value"
                @change="validateField(field)"
              />
              {{ opt.label }}
            </label>
          </div>

          <!-- 错误提示 -->
          <span v-if="errors[field.key]" class="dot-form__error">
            {{ errors[field.key] }}
          </span>
        </div>
      </div>
    </div>

    <!-- 操作按钮区 -->
    <div class="dot-form__actions">
      <button
        type="submit"
        class="dot-form__btn dot-form__btn--primary"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? '提交中...' : submitText }}
      </button>
      <button
        v-if="showReset"
        type="button"
        class="dot-form__btn"
        @click="handleReset"
      >
        {{ resetText }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from "vue";
import { formProps, type FormField, type FormRule } from "./form";

defineOptions({
  name: "DotForm",
});

const props = defineProps(formProps);
const emit = defineEmits(["submit", "reset", "change"]);

// 表单数据（内部响应式副本）
const formData = reactive<Record<string, any>>({});
// 错误信息
const errors = reactive<Record<string, string>>({});
// 提交状态
const isSubmitting = ref(false);

// 初始化表单数据
const initFormData = () => {
  props.fields.forEach((field) => {
    if (field.type === 'checkbox') {
      formData[field.key] = props.model[field.key] || field.defaultValue || [];
    } else {
      formData[field.key] = props.model[field.key] || field.defaultValue || '';
    }
  });
};

// 监听外部 model 变化
watch(
  () => props.model,
  () => {
    initFormData();
  },
  { immediate: true, deep: true }
);

// 监听内部数据变化，同步到外部
watch(
  formData,
  () => {
    emit("change", { ...formData });
  },
  { deep: true }
);

// 判断是否必填
const isRequired = (field: FormField): boolean => {
  return field.rules?.some((rule) => rule.required) || false;
};

// 验证单个字段
const validateField = (field: FormField): boolean => {
  const value = formData[field.key];
  const rules = field.rules || [];

  for (const rule of rules) {
    // 必填验证
    if (rule.required) {
      const isEmpty = Array.isArray(value)
        ? value.length === 0
        : value === '' || value === null || value === undefined;
      if (isEmpty) {
        errors[field.key] = rule.message || `${field.label}不能为空`;
        return false;
      }
    }

    // 最小长度验证
    if (rule.min !== undefined) {
      const len = typeof value === 'string' ? value.length : 0;
      if (len < rule.min) {
        errors[field.key] = rule.message || `${field.label}最少${rule.min}个字符`;
        return false;
      }
    }

    // 最大长度验证
    if (rule.max !== undefined) {
      const len = typeof value === 'string' ? value.length : 0;
      if (len > rule.max) {
        errors[field.key] = rule.message || `${field.label}最多${rule.max}个字符`;
        return false;
      }
    }

    // 正则验证
    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors[field.key] = rule.message || `${field.label}格式不正确`;
      return false;
    }

    // 自定义验证器
    if (rule.validator) {
      const result = rule.validator(value);
      if (result !== true) {
        errors[field.key] = typeof result === 'string' ? result : `${field.label}验证失败`;
        return false;
      }
    }
  }

  // 清除错误
  delete errors[field.key];
  return true;
};

// 验证整个表单
const validateAll = (): boolean => {
  let isValid = true;
  props.fields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  return isValid;
};

// 提交处理
const handleSubmit = async () => {
  if (!validateAll()) return;

  isSubmitting.value = true;
  try {
    await emit("submit", { ...formData });
  } finally {
    isSubmitting.value = false;
  }
};

// 重置处理
const handleReset = () => {
  initFormData();
  // 清除错误
  Object.keys(errors).forEach((key) => delete errors[key]);
  emit("reset");
};

// 暴露方法供外部调用
defineExpose({
  validate: validateAll,
  reset: handleReset,
  getValues: () => ({ ...formData }),
  setValues: (values: Record<string, any>) => {
    Object.keys(values).forEach((key) => {
      if (key in formData) {
        formData[key] = values[key];
      }
    });
  },
});
</script>

<style scoped>
.dot-form {
  width: 100%;
}

/* 水平布局 */
.dot-form--horizontal .dot-form__item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.dot-form--horizontal .dot-form__label {
  flex-shrink: 0;
  padding-top: 8px;
  text-align: right;
  padding-right: 12px;
}

/* 垂直布局 */
.dot-form--vertical .dot-form__item {
  margin-bottom: 20px;
}

.dot-form--vertical .dot-form__label {
  display: block;
  margin-bottom: 8px;
}

/* 内联布局 */
.dot-form--inline {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.dot-form--inline .dot-form__item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot-form__required {
  color: #f56c6c;
  margin-left: 4px;
}

.dot-form__control {
  flex: 1;
  min-width: 0;
}

.dot-form__input,
.dot-form__textarea,
.dot-form__select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.dot-form__input:focus,
.dot-form__textarea:focus,
.dot-form__select:focus {
  outline: none;
  border-color: #409eff;
}

.dot-form__textarea {
  min-height: 80px;
  resize: vertical;
}

.dot-form__radio-group,
.dot-form__checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 8px 0;
}

.dot-form__radio,
.dot-form__checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.dot-form__error {
  display: block;
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

.dot-form__item--error .dot-form__input,
.dot-form__item--error .dot-form__textarea,
.dot-form__item--error .dot-form__select {
  border-color: #f56c6c;
}

.dot-form__actions {
  display: flex;
  gap: 12px;
  padding-top: 12px;
}

.dot-form--horizontal .dot-form__actions {
  padding-left: v-bind(labelWidth);
}

.dot-form__btn {
  padding: 8px 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.dot-form__btn:hover {
  border-color: #c6e2ff;
  color: #409eff;
}

.dot-form__btn--primary {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.dot-form__btn--primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.dot-form__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
