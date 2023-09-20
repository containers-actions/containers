module.exports = async (scripts) => {
  const { github, context, core, glob, io, exec, fetch, require } = scripts;

  const package = RegExp(`^packages/(?<p>[\\w-]+)$`, 'gm').exec(context.payload.label.name).groups['p'];
  const version = RegExp(`^${package}-v?(?<v>.*)$`, 'gm').exec(context.payload.pull_request.head.ref).groups['v'];
  const runtime = require('.github/scripts/runtime.js')(scripts);
  const namespaces = ['docker.io/fangzhengjin', 'ghcr.io/containers-actions'];
  const tags = [];
  for (const ns of namespaces) {
    tags.push(`--tag=${ns}/${package}:${version}`);
    tags.push(`--tag=${ns}/${package}:latest`);
  }
  let dockerfile = runtime.readDockerfile(package);
  const baseImage = RegExp(`^FROM\\s+(?<baseImage>.*)\\s+$`, 'gm').exec(dockerfile).groups['baseImage'];
  const annotations = runtime.getImageAnnotation(package, version, {
    'org.opencontainers.image.base.name': baseImage,
  });

  const platformArgs = runtime.readBuildPlatform(package);
  const labelArgs = Object.keys(annotations).map((key) => `--label=${key}=${annotations[key]}`);
  const annotationArgs = Object.keys(annotations).map((key) => `annotation-index.${key}=${annotations[key]}`);

  const args = ['buildx', 'build', '--provenance=false'];
  args.push(`--platform=${platformArgs.join(',')}`);
  tags.forEach((x) => args.push(x));
  labelArgs.forEach((x) => args.push(x));
  if (platformArgs.length > 1) {
    args.push(`--output=type=image,${platformArgs.join(',')}`);
  }
  args.push(context.payload.label.name);
  args.push('--push');

  await exec.exec('docker', args);

  if (
    await runtime.createIssueComment(
      context.payload.number,
      `
Package build success 🎉
Platform: \`${runtime.readBuildPlatform(package).join(',')}\`
You can find it here:
\`\`\`
${namespaces.map((ns) => `${ns}/${package}:${version}`).join('\n')}
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
