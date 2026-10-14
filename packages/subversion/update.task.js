module.exports = (scripts) =>
  scripts.runtime.debianPackageTask({ envKey: 'SUBVERSION_VERSION' })(scripts);
