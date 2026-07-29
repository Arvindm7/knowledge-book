const lintStagedConfig = {
  '*.{js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,css}': ['prettier --write'],
};

export default lintStagedConfig;
