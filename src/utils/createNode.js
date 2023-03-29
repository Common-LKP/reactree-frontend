/* eslint-disable no-param-reassign */
import TreeNode from "./TreeNode";

const skipTag = [7, 9, 10, 11];

function createNode(fiberNode, parentTree) {
  if (!fiberNode || Object.keys(fiberNode).length === 0) return null;

  const node = fiberNode.alternate ? fiberNode.alternate : fiberNode;
  const tree = new TreeNode();

  tree.setName(node);
  tree.addProps(node);
  tree.addState(node);

  if (fiberNode.sibling) {
    while (skipTag.includes(fiberNode.sibling.tag)) {
      const originSibling = fiberNode.sibling.sibling;
      fiberNode.sibling = fiberNode.sibling.child;
      fiberNode.sibling.sibling = originSibling;
    }

    const siblingTree = createNode(fiberNode.sibling, parentTree);
    if (siblingTree) {
      parentTree.addChild(siblingTree);
    }
  }

  if (fiberNode.child) {
    while (skipTag.includes(fiberNode.child.tag)) {
      fiberNode.child = fiberNode.child.child;
    }

    const childTree = createNode(fiberNode.child, tree);

    tree.addChild(childTree);
  }

  return tree;
}

export default createNode;
