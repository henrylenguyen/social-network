<template>
  <button :class="buttonClasses" :disabled="disabled || isLoading" v-bind="$attrs">
    <span v-if="isLoading" class="loader mr-2" />
    <span v-if="!isLoading && leftIcon" class="mr-2">
      <slot name="left-icon" />
    </span>
    <slot />
    <span v-if="!isLoading && rightIcon" class="ml-2">
      <slot name="right-icon" />
    </span>
  </button>
</template>

<script lang="ts">
export default {
  name: 'VButton',
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: boolean
  rightIcon?: boolean
  fullWidth?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  isLoading: false,
  leftIcon: false,
  rightIcon: false,
  fullWidth: false,
  disabled: false,
})

const buttonClasses = computed(() => {
  // Base classes
  let classes =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  // Variant classes
  switch (props.variant) {
    case 'primary':
      classes += ' bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
      break
    case 'secondary':
      classes += ' bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
      break
    case 'outline':
      classes +=
        ' border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50 focus:ring-gray-500'
      break
    case 'ghost':
      classes += ' bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
      break
    case 'danger':
      classes += ' bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      break
  }

  // Size classes
  switch (props.size) {
    case 'sm':
      classes += ' text-xs h-8 px-3'
      break
    case 'md':
      classes += ' text-sm h-10 px-4'
      break
    case 'lg':
      classes += ' text-base h-12 px-6'
      break
  }

  // Width class
  if (props.fullWidth) {
    classes += ' w-full'
  }

  // Disabled state
  if (props.disabled || props.isLoading) {
    classes += ' opacity-50 cursor-not-allowed'
  }

  return classes
})
</script>

<style scoped>
.loader {
  @apply h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent;
}
</style>
