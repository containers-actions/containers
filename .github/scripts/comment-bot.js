module.exports = async (scripts) => {
  const { github, context, core, glob, io, exec, fetch, require } = scripts;

  const runtime = require('.github/scripts/runtime.js')(scripts);

  const {
    comment: { body: commentData },
    issue: { number: issueNumber },
    sender: { login: commentUser },
  } = context.payload;

  const allowUsers = runtime.readYaml('.github/allow-bot-user.yml')['users'];

  if (!allowUsers.includes(commentUser)) {
    return;
  }

  const comment = async (comment) => await runtime.createIssueComment(issueNumber, comment);

  const { command, subCommand1 } = /^(?<command>\/\S+)(?:\s+(?<subCommand1>\S+))$/gm.exec(commentData).groups;
  switch (command) {
    case 'closeAllAndDeleteBranch':
      const pullRequestList = await runtime.listPullRequest('open');
      for (const pr of pullRequestList) {
        (await runtime.closePullRequest(pr.number)) && (await runtime.deleteBranch(pr.head.ref));
      }
      await comment('Operation completed');
      break;
  }
};
