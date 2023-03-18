/* eslint-disable func-names */

function Node() {
  this.name = "";
  this.props = [];
  this.state = [];
  this.children = [];
}

const pushState = function (memoizedState, stateArray) {
  if (!memoizedState) return;

  stateArray.push(memoizedState.memoizedState);
  pushState(memoizedState.next, stateArray);
};

Node.prototype.addChild = function (child) {
  this.children.push(child);
};

Node.prototype.setName = function (node) {
  if (node.tag === 0) {
    this.name = node.elementType.name;
  } else if (node.tag === 3) {
    this.name = "root";
  } else if (node.tag === 6) {
    this.name = node.memoizedProps;
  } else if (node.tag === 8) {
    this.name = "React.StrictMode";
  } else if (node.tag === 11) {
    this.name = node.elementType.target;
  } else if (node.tag === 15) {
    this.name = "SimpleMemoComponent";
  } else {
    this.name = node.elementType;
  }
};

Node.prototype.addProps = function (node) {
  if (!node.memoizedProps) return;

  if (node.tag === 0 || node.tag === 1) {
    this.props = Object.values(node.memoizedProps);
  }
};

Node.prototype.addState = function (node) {
  if (!node.memoizedState) return;

  if (node.tag === 0 || node.tag === 1) {
    pushState(node.memoizedState, this.state);
  }
};

export default Node;
