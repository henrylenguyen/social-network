<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary'
  export let size: 'sm' | 'md' | 'lg' = 'md'
  export let isLoading = false
  export let leftIcon = false
  export let rightIcon = false
  export let fullWidth = false
  export let disabled = false
  export let type = 'button'

  // Compute button classes
  let buttonClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  // Variant classes
  switch (variant) {
    case 'primary':
      buttonClasses += ' bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
      break
    case 'secondary':
      buttonClasses += ' bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
      break
    case 'outline':
      buttonClasses +=
        ' border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50 focus:ring-gray-500'
      break
    case 'ghost':
      buttonClasses += ' bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
      break
    case 'danger':
      buttonClasses += ' bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      break
  }

  // Size classes
  switch (size) {
    case 'sm':
      buttonClasses += ' text-xs h-8 px-3'
      break
    case 'md':
      buttonClasses += ' text-sm h-10 px-4'
      break
    case 'lg':
      buttonClasses += ' text-base h-12 px-6'
      break
  }

  // Width class
  if (fullWidth) {
    buttonClasses += ' w-full'
  }

  // Disabled state
  if (disabled || isLoading) {
    buttonClasses += ' opacity-50 cursor-not-allowed'
  }
</script>

<button {type} class={buttonClasses} disabled={disabled || isLoading} on:click>
  {#if isLoading}
    <span class="mr-2">
      <svg
        class="h-4 w-4 animate-spin text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </span>
  {/if}

  {#if !isLoading && leftIcon}
    <span class="mr-2">
      <slot name="left-icon"></slot>
    </span>
  {/if}

  <slot></slot>

  {#if !isLoading && rightIcon}
    <span class="ml-2">
      <slot name="right-icon"></slot>
    </span>
  {/if}
</button>
