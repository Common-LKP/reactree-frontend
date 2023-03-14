function deepCopy(object) {
  const res = {};

  for (const key in object) {
    if (key === "child") {
      res[key] = deepCopy(object[key]);
    } else {
      res[key] = object[key];
    }
  }

  return res;
}

// index.js의 root를 사용합니다.
const fiberRootNode = deepCopy(root._internalRoot);

function Tree (name) {
  this.name = name;
  this.children = [];
}

const fiberTree = new Tree("");

function createNode(fiberNode, tree, parentTree) {
  if (!fiberNode || Object.keys(fiberNode).length === 0) return;

  const node = fiberNode.alternate ? fiberNode.alternate : fiberNode;

  if (node.tag === 3) {
    tree.name = "root";
  } else if (node.tag === 0) {
    tree.name = node.elementType.name;
  } else {
    tree.name = node.elementType;
  }

  if (fiberNode.sibling) {
    parentTree.children.push(new Tree(""));
    createNode(fiberNode.sibling, parentTree.children.at(-1), parentTree);
  }

  if (fiberNode.child) {
    tree.children.push(new Tree(""));
    createNode(fiberNode.child, tree.children[0], tree);
  }
}

setTimeout(() => {
  createNode(fiberRootNode.current.alternate, fiberTree);
  console.log(JSON.stringify(fiberTree, null, 2));
}, 0);
