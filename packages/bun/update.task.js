module.exports = (scripts) =>
  scripts.runtime.githubReleaseTask({ owner: 'oven-sh', repo: 'bun', envKey: 'BUN_VERSION' })(scripts);
