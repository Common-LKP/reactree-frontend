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
    let childTree;

    if (fiberNode.child.tag === 10 || fiberNode.child.tag === 11) {
      childTree = createNode(fiberNode.child.child, tree);
    } else {
      childTree = createNode(fiberNode.child, tree);
    }

    tree.addChild(childTree);
  }

  return tree;
}

export default createNode;
