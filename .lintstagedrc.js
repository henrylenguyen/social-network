module.exports = {
  '*.{js,jsx,ts,tsx}': (files) => {
    // Giới hạn số lượng files trong một lần chạy
    const maxFilesPerRun = 10;
    const commands = [];

    // Xử lý files theo batch
    for (let i = 0; i < files.length; i += maxFilesPerRun) {
      const chunk = files.slice(i, i + maxFilesPerRun);
      const filePaths = chunk.join(' ');
      commands.push(`eslint --fix ${filePaths}`);
      commands.push(`prettier --write ${filePaths}`);
    }

    return commands;
  },
  '*.{vue,svelte}': (files) => {
    // Tương tự, xử lý theo batch
    const maxFilesPerRun = 5;
    const commands = [];

    for (let i = 0; i < files.length; i += maxFilesPerRun) {
      const chunk = files.slice(i, i + maxFilesPerRun);
      const filePaths = chunk.join(' ');
      commands.push(`eslint --fix ${filePaths}`);
      commands.push(`prettier --write ${filePaths}`);
    }

    return commands;
  },
  '*.{json,md,yml,yaml}': (files) => {
    const maxFilesPerRun = 20;
    const commands = [];

    for (let i = 0; i < files.length; i += maxFilesPerRun) {
      const chunk = files.slice(i, i + maxFilesPerRun);
      commands.push(`prettier --write ${chunk.join(' ')}`);
    }

    return commands;
  }
};