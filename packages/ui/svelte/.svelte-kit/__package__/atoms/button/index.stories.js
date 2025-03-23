import Button from './Button.svelte'

export default {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    isLoading: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    fullWidth: { control: { type: 'boolean' } },
    onClick: { action: 'click' },
  },
}

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

export const Secondary = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
}

export const Outline = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
}

export const Ghost = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
}

export const Danger = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
}

export const Small = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
}

export const Medium = {
  args: {
    size: 'md',
    children: 'Medium Button',
  },
}

export const Large = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
}

export const Loading = {
  args: {
    isLoading: true,
    children: 'Loading...',
  },
}

export const Disabled = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
}

export const FullWidth = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
}
