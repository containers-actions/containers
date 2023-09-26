module.exports = async (scripts, patterns) => {
  const { github, context, core, glob, io, exec, fetch, require } = scripts;

  const runtime = require('.github/scripts/runtime.js')(scripts);
  const globber = await glob.create(patterns, {
    followSymbolicLinks: false,
    matchDirectories: false,
  });

  for await (const task of globber.globGenerator()) {
    const package = task.substring(task.indexOf(runtime.const.PACKAGE_DIR) + runtime.const.PACKAGE_DIR.length + 1, task.lastIndexOf('/'));
    runtime.printlnWarpText(`${package} Task`);
    const path = `${runtime.const.PACKAGE_DIR}/${package}`;
    const run = require(task);
    core.info(`Checking for ${package} updates`);
    const result = await run({
      constants: { package, path },
      scripts,
      runtime,
    });
    if (result != null) {
      if (Array.isArray(result)) {
        result.forEach((r) => core.info(`Updated ${package} version to ${r}`));
      } else {
        core.info(`Updated ${package} version to ${result}`);
      }
    } else {
      core.info(`${package} is up to date`);
    }
  }
};
