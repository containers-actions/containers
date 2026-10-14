module.exports = async (scripts, patterns) => {
  const { github, context, core, glob, io, exec, require } = scripts;

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
    try {
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
    } catch (error) {
      // 单个包失败不阻断其余包的检查，但将失败标记到运行结果上
      core.error(`${package} 检查失败: ${error.message}`);
      core.setFailed(error.message);
    }
  }
};
