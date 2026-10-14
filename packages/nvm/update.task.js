module.exports = (scripts) =>
  scripts.runtime.githubReleaseTask({ owner: 'nvm-sh', repo: 'nvm', envKey: 'NVM_VERSION' })(scripts);
