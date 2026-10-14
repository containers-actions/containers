module.exports = (scripts) =>
  scripts.runtime.debianPackageTask({ envKey: 'LIBREOFFICE_VERSION' })(scripts);
