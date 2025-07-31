import { ThemeConfig } from 'antd';

export const commonConfig: ThemeConfig = {
  token: {
    fontFamily: 'var(--font-family)',
  },
  components: {
    Menu: {
      itemBg: 'transparent',
    },
  },
};
export const lightAntConfig: ThemeConfig = {
  token: {
    fontFamily: 'var(--font-family)',
    colorPrimary: '#443da9',
    colorInfo: '#443da9',
    colorSuccess: '#70d43f',
  },
  components: {
    Layout: {
      headerBg: 'rgb(255,255,255)',
      siderBg: 'rgb(255,255,255)',
    },
  },
};
export const darkAntConfig: ThemeConfig = {
  token: {
    fontFamily: 'var(--font-family)',
    colorPrimary: '#736eff',
    colorInfo: '#736eff',
    colorSuccess: '#70d43f',
  },
  components: {
    Layout: {
      bodyBg: '#111a2c',
    },
    Menu: {
      colorPrimary: '#cbe1ff',
      // itemColor: 'var(--color-itemColor)',
      // itemHoverColor: 'var(--color-itemHoverColor)',
      // itemSelectedColor: 'var(--color-itemSelectedColor)',
      // itemBg: 'var(--color-itemBg)',
      // itemActiveBg: 'var(--color-itemActiveBg)',
      // itemHoverBg: 'var(--color-itemHoverBg)',
      itemSelectedBg: 'var(--color-itemSelectedBg)',
      // subMenuItemSelectedColor: 'var(--color-itemSelectedColor)',
    },
  },
};
