module.exports = (scripts) =>
  scripts.runtime.githubReleaseTask({ owner: 'containers-actions', repo: 'cnpmcore', envKey: 'CNPMCORE_VERSION' })(scripts);
