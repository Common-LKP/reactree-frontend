/* eslint-disable no-prototype-builtins */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
function deepCopy(object) {
  const result = {};

  for (const key in object) {
    if (!object.hasOwnProperty(key)) continue;

    if (key === "child") {
      result[key] = deepCopy(object[key]);
    } else {
      result[key] = object[key];
    }
  }

  return result;
}

// index.js의 root를 사용합니다.
const fiberRootNode = deepCopy(root._internalRoot);

function Tree() {
  this.name = "";
  this.props = [];
  this.children = [];
}

Tree.prototype.addChild = function (child) {
  this.children.push(child);
};

Tree.prototype.setName = function (node) {
  if (node.tag === 3) {
    this.name = "root";
  } else if (node.tag === 0) {
    this.name = node.elementType.name;
  } else if (node.tag === 6) {
    this.name = node.memoizedProps;
  } else {
    this.name = node.elementType;
  }
};

Tree.prototype.addProps = function (node) {
  if (!node.memoizedProps) return;

  if (node.tag === 0 || node.tag === 1) {
    if (Object.values(node.memoizedProps).length) {
      this.props = [...this.props, Object.values(node.memoizedProps)];
    }
  }
};
const fiberTree = new Tree("");

function createNode(fiberNode, tree, parentTree) {
  if (!fiberNode || Object.keys(fiberNode).length === 0) return;

  const node = fiberNode.alternate ? fiberNode.alternate : fiberNode;

  tree.setName(node);
  tree.addProps(node);

  if (fiberNode.sibling) {
    parentTree.addChild(new Tree());
    createNode(fiberNode.sibling, parentTree.children.at(-1), parentTree);
  }

  if (fiberNode.child) {
    tree.addChild(new Tree());
    createNode(fiberNode.child, tree.children[0], tree);
  }
}

setTimeout(() => {
  createNode(fiberRootNode.current.alternate, fiberTree);
}, 0);
