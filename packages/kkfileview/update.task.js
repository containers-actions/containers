module.exports = (scripts) =>
  scripts.runtime.githubReleaseTask({ owner: 'kekingcn', repo: 'kkFileView', envKey: 'KKFILEVIEW_VERSION' })(scripts);
