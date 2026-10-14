module.exports = async (scripts) => {
  const { github, context, core, glob, io, exec, require } = scripts;

  const runtime = require('.github/scripts/runtime.js')(scripts);

  const package = RegExp(`^packages/(?<p>[\\w-]+)$`, 'gm').exec(context.payload.label.name).groups['p'];
  const version = RegExp(`^${package}/v?(?<v>.*)$`, 'gm').exec(context.payload.pull_request.head.ref).groups['v'];
  const prFiles = await runtime.listPullRequestFiles(context.payload.number);

  let subdir = '';
  prFiles.forEach((x) => {
    const prefix = `${runtime.const.PACKAGE_DIR}/${package}/`;
    if (x.filename.startsWith(prefix) && x.filename.endsWith('/Dockerfile')) {
      // Dockerfile 位于包根目录时截取结果为 '/'，需归一化为空串
      subdir = x.filename.substring(prefix.length, x.filename.length - '/Dockerfile'.length).replace(/\/+$/, '');
    }
  });

  const packagePath = subdir.length == 0 ? package : `${package}/${subdir}`;

  const registrys = runtime.readDockerRegistrys() || [];
  const imageTags = runtime.readImageTags(packagePath);

  const tags = [];
  registrys.forEach((registry) => {
    imageTags.forEach((tag) => tags.push(`${registry}/${package}:${tag}`));
  });

  let dockerfile = runtime.readDockerfile(packagePath);
  const baseImage = RegExp(`^FROM\\s+(?<baseImage>.*)\\s+$`, 'gm').exec(dockerfile).groups['baseImage'];
  const annotations = runtime.getImageAnnotation(package, version, {
    'org.opencontainers.image.base.name': baseImage,
  });

  const platformArgs = runtime.readBuildPlatform(packagePath);
  const labelArgs = Object.keys(annotations).map((key) => `--label=${key}=${annotations[key]}`);
  const annotationArgs = Object.keys(annotations).map((key) => `annotation-index.${key}=${annotations[key]}`);

  const args = ['buildx', 'build', '--provenance=false'];
  args.push(`--platform=${platformArgs.join(',')}`);
  tags.forEach((x) => args.push(`--tag=${x}`));
  labelArgs.forEach((x) => args.push(x));
  if (platformArgs.length > 1) {
    args.push(`--output=type=image,${annotationArgs.join(',')}`);
  }
  args.push(`${runtime.const.PACKAGE_DIR}/${packagePath}`);
  args.push('--push');

  await exec.exec('docker', args);

  if (
    await runtime.createIssueComment(
      context.payload.number,
      `
Package build success 🎉
Platform: \`${runtime.readBuildPlatform(packagePath).join(',')}\`
You can find it here:
\`\`\`
${tags.join('\n')}
\`\`\`
  `
    )
  ) {
    if (await runtime.mergePullRequestSquash(context.payload.number)) {
      await runtime.sleep(5000);
      await runtime.deleteBranch(context.payload.pull_request.head.ref);
    }
  }
};
