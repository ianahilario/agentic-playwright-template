const VIEWPORT_TAGS = new Set(['desktop', 'mobile']);

function isIdentifier(node, name) {
  return node.type === 'Identifier' && node.name === name;
}

function isTestCall(node) {
  if (isIdentifier(node.callee, 'test')) {
    return true;
  }

  if (node.callee.type !== 'MemberExpression' || node.callee.computed) {
    return false;
  }

  if (!isIdentifier(node.callee.object, 'test')) {
    return false;
  }

  return (
    isIdentifier(node.callee.property, 'only') ||
    isIdentifier(node.callee.property, 'skip') ||
    isIdentifier(node.callee.property, 'fixme')
  );
}

function isViewportTagArg(node) {
  return (
    node.type === 'MemberExpression' &&
    !node.computed &&
    isIdentifier(node.object, 'testTag') &&
    node.property.type === 'Identifier' &&
    VIEWPORT_TAGS.has(node.property.name)
  );
}

function hasViewportSetTestTags(args) {
  return args.some((arg) => {
    if (arg.type !== 'CallExpression' || !isIdentifier(arg.callee, 'setTestTags')) {
      return false;
    }

    return arg.arguments.some(isViewportTagArg);
  });
}

/** @type {import('eslint').Rule.RuleModule} */
const requireViewportTag = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require setTestTags with @desktop and/or @mobile on every test()',
    },
    messages: {
      missing:
        'Tag this test with setTestTags(testTag.desktop) and/or setTestTags(testTag.mobile). Untagged tests never run in desktop-chrome or mobile-chrome.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isTestCall(node)) {
          return;
        }

        if (!hasViewportSetTestTags(node.arguments)) {
          context.report({ node: node.callee, messageId: 'missing' });
        }
      },
    };
  },
};

export default requireViewportTag;
