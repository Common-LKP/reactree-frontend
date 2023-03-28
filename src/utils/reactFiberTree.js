import Node from "./Node";

function createNode(fiberNode, parentTree) {
  if (!fiberNode || Object.keys(fiberNode).length === 0) return null;

  const node = fiberNode.alternate ? fiberNode.alternate : fiberNode;
  const tree = new Node();

  tree.setName(node);
  tree.addProps(node);
  tree.addState(node);

  if (fiberNode.sibling) {
    const siblingTree = createNode(fiberNode.sibling, parentTree);
    if (siblingTree) {
      parentTree.addChild(siblingTree);
    }
  }

  if (fiberNode.child) {
    const childTree = createNode(fiberNode.child.child, tree);

    if (childTree) {
      tree.addChild(childTree);
    }
  }

  return tree || null;
}

export default createNode;
