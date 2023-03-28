import Node from "./Node";

function createNode(fiberNode, tree, parentTree) {
  if (!fiberNode || Object.keys(fiberNode).length === 0) return;

  const node = fiberNode.alternate ? fiberNode.alternate : fiberNode;

  tree.setName(node);
  tree.addProps(node);
  tree.addState(node);

  if (fiberNode.sibling) {
    parentTree.addChild(new Node());
    createNode(fiberNode.sibling, parentTree.children.at(-1), parentTree);
  }

  if (fiberNode.child) {
    tree.addChild(new Node());

    if (fiberNode.child.tag === 10 || fiberNode.child.tag === 11) {
      createNode(fiberNode.child.child, tree.children[0], tree);
    } else {
      createNode(fiberNode.child, tree.children[0], tree);
    }
  }
}

export default createNode;
