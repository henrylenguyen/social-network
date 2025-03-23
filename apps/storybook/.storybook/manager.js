import { addons } from '@storybook/manager-api'
import { create } from '@storybook/theming/create'

const theme = create({
  base: 'light',
  brandTitle: 'Social Blog UI Components',
  brandUrl: 'https://social-blog.com',
  brandTarget: '_self',
})

addons.setConfig({
  theme,
  sidebar: {
    showRoots: true,
  },
})
