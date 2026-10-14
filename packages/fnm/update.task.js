module.exports = (scripts) =>
  scripts.runtime.githubReleaseTask({ owner: 'Schniz', repo: 'fnm', envKey: 'FNM_VERSION' })(scripts);
